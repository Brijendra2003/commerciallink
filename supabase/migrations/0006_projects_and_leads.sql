-- =====================================================================
-- CommercialLink — projects, admin verification, and owner-visible leads
--
-- Three changes of substance:
--
--  1. `properties` carries a segment (commercial / residential), a
--     buyer-facing category, a RERA number for under-construction
--     projects, and the residential configuration fields.
--
--  2. `owners` carries an account type, so an owner, a broker and a
--     developer are distinguishable without a second table.
--
--  3. Owners, brokers and developers can now READ the leads raised on
--     their own listings — including buyer contact details.
--
--     This reverses the guarantee documented in 0002_portal.sql. That
--     design put the desk between both sides; the platform is now a
--     marketplace where the lister works their own enquiries. The read
--     is still scoped per row: a lister sees leads on listings they own
--     and nothing else. Writes stay off the table for them — lead
--     status changes go through a server action that re-checks
--     ownership with the service role.
--
-- Run after 0005_segment_enums.sql. Safe to re-run.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Account type on the supply side.
-- ---------------------------------------------------------------------
alter table public.owners
  add column if not exists account_type owner_account_type not null default 'owner',
  -- Brokers and developers are asked for a registration number at signup.
  -- Nullable: a private owner has none.
  add column if not exists rera_number text,
  add column if not exists about text;

create index if not exists owners_account_type_idx on public.owners (account_type);

-- ---------------------------------------------------------------------
-- Listings: segment, category, RERA, residential configuration, and the
-- admin verification trail.
-- ---------------------------------------------------------------------
alter table public.properties
  add column if not exists segment         property_segment not null default 'commercial',
  add column if not exists category        project_category not null default 'ready_to_move',
  add column if not exists rera_number     text,
  add column if not exists bedrooms        integer check (bedrooms is null or bedrooms between 0 and 50),
  add column if not exists bathrooms       integer check (bathrooms is null or bathrooms between 0 and 50),
  add column if not exists balconies       integer check (balconies is null or balconies between 0 and 50),
  -- Set when the project is under construction.
  add column if not exists possession_by   date,
  -- Verification trail. `verified` (0001) stays the public-facing flag;
  -- these record who decided, when, and what they told the lister.
  add column if not exists review_status   review_outcome not null default 'pending',
  add column if not exists review_note     text,
  add column if not exists reviewed_at     timestamptz,
  add column if not exists reviewed_by     uuid references public.admin_users (id) on delete set null;

create index if not exists properties_segment_idx  on public.properties (segment);
create index if not exists properties_category_idx on public.properties (category);

-- ---------------------------------------------------------------------
-- A new project under construction must carry a RERA number.
--
-- Added NOT VALID: existing rows predate the column and default to
-- 'ready_to_move', but a legacy row edited into 'new_project' without a
-- number would otherwise block the whole migration. Every INSERT and
-- UPDATE from here on is checked.
-- ---------------------------------------------------------------------
do $$ begin
  alter table public.properties
    add constraint properties_rera_required_for_new_project
    check (
      category <> 'new_project'
      or (rera_number is not null and length(btrim(rera_number)) > 0)
    ) not valid;
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------
-- Residential listings describe a configuration; commercial ones do not.
-- Not enforced as a constraint — a residential plot has no bedrooms, and
-- a serviced commercial suite may well quote washrooms. The application
-- decides which fields to ask for.
-- ---------------------------------------------------------------------

-- ---------------------------------------------------------------------
-- Ownership predicate. SECURITY DEFINER so the lead policy below can
-- join `properties` and `owners` without tripping their own RLS.
-- ---------------------------------------------------------------------
create or replace function public.owns_property(pid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
      from public.properties p
      join public.owners o on o.id = p.owner_id
     where p.id = pid
       and o.auth_user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------
-- Leads on my own listings.
--
-- SELECT only. There is deliberately no owner INSERT/UPDATE/DELETE
-- policy on `leads`: RLS is row-level, so an UPDATE grant would let a
-- lister rewrite buyer_name or buyer_phone on a row they can see.
-- Status changes go through updateOwnerLeadStatus(), which verifies
-- ownership server-side and writes only the status column.
-- ---------------------------------------------------------------------
drop policy if exists leads_owner_read on public.leads;
create policy leads_owner_read on public.leads
  for select to authenticated
  using (property_id is not null and public.owns_property(property_id));

-- ---------------------------------------------------------------------
-- Listers see the activity trail on their own leads, so a follow-up
-- note logged by the desk is visible to them too.
-- ---------------------------------------------------------------------
drop policy if exists lead_activities_owner_read on public.lead_activities;
create policy lead_activities_owner_read on public.lead_activities
  for select to authenticated
  using (
    lead_id in (
      select l.id from public.leads l
      where l.property_id is not null and public.owns_property(l.property_id)
    )
  );

-- ---------------------------------------------------------------------
-- A lister edits their own listing in any state. An edit to a published
-- listing drops it back to pending_review — the application does that,
-- and this policy is what lets the write land.
--
-- Replaces the 0002_portal.sql policy, which was limited to
-- draft / pending_review.
-- ---------------------------------------------------------------------
drop policy if exists properties_owner_update on public.properties;
create policy properties_owner_update on public.properties
  for update to authenticated
  using (
    owner_id in (select id from public.owners where auth_user_id = auth.uid())
  )
  with check (
    owner_id in (select id from public.owners where auth_user_id = auth.uid())
    -- A lister can never publish or verify their own listing. Only the
    -- admin review action, which runs with the service role, can.
    and status <> 'published'
  );

-- ---------------------------------------------------------------------
-- Media on a lister's own listing. Submission writes go through the
-- service role, but a lister managing an existing project needs these.
-- ---------------------------------------------------------------------
drop policy if exists property_media_owner_write on public.property_media;
create policy property_media_owner_write on public.property_media
  for all to authenticated
  using (
    property_id in (
      select p.id from public.properties p
      join public.owners o on o.id = p.owner_id
      where o.auth_user_id = auth.uid()
    )
  )
  with check (
    property_id in (
      select p.id from public.properties p
      join public.owners o on o.id = p.owner_id
      where o.auth_user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------
-- Keep `review_status` and `status` in step, so neither the admin panel
-- nor a lister edit can leave them contradicting each other.
-- ---------------------------------------------------------------------
create or replace function public.sync_review_status()
returns trigger language plpgsql as $$
begin
  if new.status = 'published' and old.status <> 'published' then
    new.review_status = 'approved';
    new.verified      = true;
    new.reviewed_at   = coalesce(new.reviewed_at, now());
  elsif new.status = 'pending_review' and old.status = 'published' then
    -- An edit to a live listing sends it back round.
    new.review_status = 'pending';
    new.verified      = false;
  end if;
  return new;
end $$;

drop trigger if exists properties_sync_review on public.properties;
create trigger properties_sync_review before update on public.properties
  for each row execute function public.sync_review_status();
