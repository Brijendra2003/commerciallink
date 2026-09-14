-- =====================================================================
-- CommercialLink — buyer & owner self-service portal
--
-- Adds what the public-side accounts need on top of 0001_schema.sql.
-- Run this after 0001. Safe to re-run.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Link enquiries to a registered buyer so they can see their own history.
-- Nullable: an anonymous enquiry is still a valid lead.
-- ---------------------------------------------------------------------
alter table public.leads
  add column if not exists buyer_id uuid references public.buyers (id) on delete set null;

create index if not exists leads_buyer_idx on public.leads (buyer_id);

-- ---------------------------------------------------------------------
-- Self-registration. An authenticated user creates exactly one profile
-- row, bound to their own auth.uid() — they cannot forge another's.
-- ---------------------------------------------------------------------
drop policy if exists owners_self_insert on public.owners;
create policy owners_self_insert on public.owners
  for insert to authenticated
  with check (auth_user_id = auth.uid());

drop policy if exists buyers_self_insert on public.buyers;
create policy buyers_self_insert on public.buyers
  for insert to authenticated
  with check (auth_user_id = auth.uid());

-- ---------------------------------------------------------------------
-- Buyers read their own enquiries — and only their own.
--
-- Note what is deliberately absent: there is NO owner SELECT policy on
-- `leads`. RLS is row-level, not column-level, so any owner-facing read
-- of this table would expose buyer_phone / buyer_email. Owners get
-- enquiry *counts* from properties.enquiry_count instead, which is the
-- "no direct contact" guarantee from Section 2.1 held at the database.
-- ---------------------------------------------------------------------
drop policy if exists leads_buyer_read on public.leads;
create policy leads_buyer_read on public.leads
  for select to authenticated
  using (
    buyer_id in (select id from public.buyers where auth_user_id = auth.uid())
  );

-- ---------------------------------------------------------------------
-- Owners update their own listings, but only while a listing is still
-- theirs to edit — a published listing is the desk's to change.
-- ---------------------------------------------------------------------
drop policy if exists properties_owner_update on public.properties;
create policy properties_owner_update on public.properties
  for update to authenticated
  using (
    owner_id in (select id from public.owners where auth_user_id = auth.uid())
    and status in ('draft', 'pending_review')
  )
  with check (
    owner_id in (select id from public.owners where auth_user_id = auth.uid())
    and status in ('draft', 'pending_review')
  );

-- ---------------------------------------------------------------------
-- Buyers close or edit their own requirement briefs.
-- ---------------------------------------------------------------------
drop policy if exists requirements_buyer_update on public.requirements;
create policy requirements_buyer_update on public.requirements
  for update to authenticated
  using (
    buyer_id in (select id from public.buyers where auth_user_id = auth.uid())
  )
  with check (
    buyer_id in (select id from public.buyers where auth_user_id = auth.uid())
  );

-- ---------------------------------------------------------------------
-- One profile per auth user, per side. Prevents a double-registration
-- race from creating two owner rows for the same login.
-- ---------------------------------------------------------------------
create unique index if not exists owners_auth_user_unique
  on public.owners (auth_user_id) where auth_user_id is not null;

create unique index if not exists buyers_auth_user_unique
  on public.buyers (auth_user_id) where auth_user_id is not null;
