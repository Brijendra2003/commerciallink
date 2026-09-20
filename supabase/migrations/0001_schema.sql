-- =====================================================================
-- CommercialLink — schema, roles and row-level security
-- Implements Section 6 of the project documentation.
--
-- Run this in the Supabase SQL editor (or `supabase db push`) before
-- 0002_seed.sql. It is idempotent enough to re-run on a clean project.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
do $$ begin
  create type property_type   as enum ('office','retail','warehouse','industrial','land','coworking');
  create type property_status as enum ('draft','pending_review','published','archived','sold','leased');
  create type purpose         as enum ('buy','lease');
  create type possession      as enum ('ready','under_construction','shell_core');
  create type furnishing      as enum ('bare_shell','warm_shell','fully_fitted');
  create type mmr_zone        as enum ('south','central','western','eastern','navi','thane');
  create type media_type      as enum ('image','floor_plan','brochure','video');
  create type lead_status     as enum ('new','contacted','qualified','site_visit','negotiation','won','lost');
  create type lead_source     as enum ('organic','paid_ad','referral','whatsapp','brochure','requirement');
  create type activity_type   as enum ('call','email','whatsapp','note','status_change','site_visit','created');
  create type requirement_status as enum ('open','matched','closed');
  create type deal_status     as enum ('in_progress','won','lost');
  create type kyc_status      as enum ('verified','pending','rejected');
  create type admin_role      as enum ('super_admin','sales_exec','content_editor');
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------
-- admin_users — the staff table. Membership here IS the admin grant.
-- ---------------------------------------------------------------------
create table if not exists public.admin_users (
  id           uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users (id) on delete cascade,
  name         text not null,
  initials     text not null,
  email        text not null unique,
  role         admin_role not null default 'sales_exec',
  is_active    boolean not null default true,
  last_seen    timestamptz,
  created_at   timestamptz not null default now()
);

-- Helper predicates. SECURITY DEFINER so policies can consult admin_users
-- without recursing through that table's own RLS.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admin_users
    where auth_user_id = auth.uid() and is_active
  );
$$;

create or replace function public.admin_role()
returns admin_role language sql stable security definer set search_path = public as $$
  select role from public.admin_users
  where auth_user_id = auth.uid() and is_active
  limit 1;
$$;

create or replace function public.can_edit_listings()
returns boolean language sql stable security definer set search_path = public as $$
  select public.admin_role() in ('super_admin','content_editor');
$$;

-- ---------------------------------------------------------------------
-- owners & buyers — supply and demand side profiles
-- ---------------------------------------------------------------------
create table if not exists public.owners (
  id           uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users (id) on delete set null,
  name         text not null,
  company      text,
  phone        text not null,
  email        text not null,
  city         text not null default 'Mumbai',
  kyc_status   kyc_status not null default 'pending',
  verified_at  timestamptz,
  created_at   timestamptz not null default now()
);

create table if not exists public.buyers (
  id           uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users (id) on delete cascade,
  name         text not null,
  company      text,
  phone        text not null,
  email        text not null,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- properties
-- ---------------------------------------------------------------------
create table if not exists public.properties (
  id                uuid primary key default gen_random_uuid(),
  ref               text not null unique,
  slug              text not null unique,
  title             text not null,
  type              property_type not null,
  purpose           purpose not null,
  city              text not null default 'Mumbai',
  zone              mmr_zone not null,
  locality          text not null,
  address           text not null,
  price             bigint,
  rent_psf          numeric(10,2),
  area_sqft         integer not null check (area_sqft > 0),
  carpet_area_sqft  integer,
  floor             text,
  possession        possession not null default 'ready',
  furnishing        furnishing not null default 'bare_shell',
  zoning            text,
  status            property_status not null default 'draft',
  featured          boolean not null default false,
  verified          boolean not null default false,
  amenities         text[] not null default '{}',
  summary           text,
  description       text[] not null default '{}',
  meta_title        text,
  meta_description  text,
  -- NOT NULL: registration is a structural prerequisite for listing, per the
  -- "Mandatory Registration Design Note" in Section 6.
  owner_id          uuid not null references public.owners (id) on delete restrict,
  created_by        uuid references public.admin_users (id) on delete set null,
  view_count        integer not null default 0,
  enquiry_count     integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists properties_status_idx    on public.properties (status);
create index if not exists properties_type_idx      on public.properties (type);
create index if not exists properties_locality_idx  on public.properties (locality);
create index if not exists properties_zone_idx      on public.properties (zone);
create index if not exists properties_featured_idx  on public.properties (featured) where status = 'published';

create table if not exists public.property_media (
  id                    uuid primary key default gen_random_uuid(),
  property_id           uuid not null references public.properties (id) on delete cascade,
  cloudinary_public_id  text not null,
  type                  media_type not null default 'image',
  alt                   text,
  sort_order            integer not null default 0,
  created_at            timestamptz not null default now()
);

create index if not exists property_media_property_idx
  on public.property_media (property_id, sort_order);

-- ---------------------------------------------------------------------
-- requirements — the "couldn't find a match" briefs
-- ---------------------------------------------------------------------
create table if not exists public.requirements (
  id            uuid primary key default gen_random_uuid(),
  ref           text not null unique,
  buyer_id      uuid references public.buyers (id) on delete set null,
  buyer_name    text not null,
  buyer_company text,
  buyer_phone   text not null,
  buyer_email   text not null,
  property_type property_type not null,
  city          text not null default 'Mumbai',
  locality      text,
  budget_label  text,
  area_sqft     integer,
  purpose       purpose not null,
  timeline      text,
  notes         text,
  status        requirement_status not null default 'open',
  matched_property_ids uuid[] not null default '{}',
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- leads — the central pipeline entity
-- ---------------------------------------------------------------------
create table if not exists public.leads (
  id             uuid primary key default gen_random_uuid(),
  ref            text not null unique,
  property_id    uuid references public.properties (id) on delete set null,
  requirement_id uuid references public.requirements (id) on delete set null,
  buyer_name     text not null,
  buyer_company  text,
  buyer_phone    text not null,
  buyer_email    text not null,
  source         lead_source not null default 'organic',
  status         lead_status not null default 'new',
  assigned_to    uuid references public.admin_users (id) on delete set null,
  message        text,
  preferred_time text,
  value_estimate bigint not null default 0,
  consent        boolean not null default false,
  utm_source     text,
  utm_campaign   text,
  created_at     timestamptz not null default now(),
  last_activity_at timestamptz not null default now(),
  -- A lead points at a listing or at a requirement, never at neither.
  constraint leads_origin_check
    check (property_id is not null or requirement_id is not null)
);

create index if not exists leads_status_idx   on public.leads (status);
create index if not exists leads_assigned_idx on public.leads (assigned_to);
create index if not exists leads_created_idx  on public.leads (created_at desc);

create table if not exists public.lead_activities (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid not null references public.leads (id) on delete cascade,
  type       activity_type not null default 'note',
  note       text not null,
  created_by uuid references public.admin_users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists lead_activities_lead_idx
  on public.lead_activities (lead_id, created_at desc);

-- ---------------------------------------------------------------------
-- deals & owner communication
-- ---------------------------------------------------------------------
create table if not exists public.deals (
  id             uuid primary key default gen_random_uuid(),
  ref            text not null unique,
  lead_id        uuid references public.leads (id) on delete set null,
  property_id    uuid references public.properties (id) on delete set null,
  owner_id       uuid references public.owners (id) on delete set null,
  client         text not null,
  value          bigint not null default 0,
  commission_pct numeric(5,2) not null default 0,
  status         deal_status not null default 'in_progress',
  assigned_to    uuid references public.admin_users (id) on delete set null,
  payout_settled boolean not null default false,
  closed_at      date,
  created_at     timestamptz not null default now()
);

create table if not exists public.owner_notes (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references public.owners (id) on delete cascade,
  author     text not null,
  text       text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_log (
  id         uuid primary key default gen_random_uuid(),
  actor      text not null,
  action     text not null,
  target     text,
  created_at timestamptz not null default now()
);

create index if not exists audit_log_created_idx on public.audit_log (created_at desc);

-- ---------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists properties_touch on public.properties;
create trigger properties_touch before update on public.properties
  for each row execute function public.touch_updated_at();

-- =====================================================================
-- Row Level Security
--
-- The core guarantee from Section 6: buyer and owner contact fields are
-- readable by admin staff only. This is enforced here, at the database,
-- not in the UI — a direct API call with an anon key cannot bypass it.
-- =====================================================================

alter table public.admin_users     enable row level security;
alter table public.owners          enable row level security;
alter table public.buyers          enable row level security;
alter table public.properties      enable row level security;
alter table public.property_media  enable row level security;
alter table public.requirements    enable row level security;
alter table public.leads           enable row level security;
alter table public.lead_activities enable row level security;
alter table public.deals           enable row level security;
alter table public.owner_notes     enable row level security;
alter table public.audit_log       enable row level security;

-- --- admin_users ------------------------------------------------------
drop policy if exists admin_users_self_read on public.admin_users;
create policy admin_users_self_read on public.admin_users
  for select using (auth_user_id = auth.uid() or public.is_admin());

drop policy if exists admin_users_super_write on public.admin_users;
create policy admin_users_super_write on public.admin_users
  for all using (public.admin_role() = 'super_admin')
  with check (public.admin_role() = 'super_admin');

-- --- properties -------------------------------------------------------
-- Anonymous visitors see published listings only. No contact columns live
-- on this table, so a public read is safe.
drop policy if exists properties_public_read on public.properties;
create policy properties_public_read on public.properties
  for select using (status = 'published');

drop policy if exists properties_admin_read on public.properties;
create policy properties_admin_read on public.properties
  for select using (public.is_admin());

-- An owner sees their own listings in every state — but never a buyer.
drop policy if exists properties_owner_read on public.properties;
create policy properties_owner_read on public.properties
  for select using (
    owner_id in (select id from public.owners where auth_user_id = auth.uid())
  );

drop policy if exists properties_owner_insert on public.properties;
create policy properties_owner_insert on public.properties
  for insert with check (
    owner_id in (select id from public.owners where auth_user_id = auth.uid())
    and status = 'pending_review'
  );

drop policy if exists properties_admin_write on public.properties;
create policy properties_admin_write on public.properties
  for all using (public.can_edit_listings())
  with check (public.can_edit_listings());

-- --- property_media ---------------------------------------------------
drop policy if exists property_media_public_read on public.property_media;
create policy property_media_public_read on public.property_media
  for select using (
    property_id in (select id from public.properties where status = 'published')
    or public.is_admin()
  );

drop policy if exists property_media_admin_write on public.property_media;
create policy property_media_admin_write on public.property_media
  for all using (public.can_edit_listings())
  with check (public.can_edit_listings());

-- --- owners -----------------------------------------------------------
-- owners.phone / owners.email are the protected columns. Only staff and the
-- owner themselves can select a row at all.
drop policy if exists owners_admin_read on public.owners;
create policy owners_admin_read on public.owners
  for select using (public.is_admin() or auth_user_id = auth.uid());

drop policy if exists owners_self_update on public.owners;
create policy owners_self_update on public.owners
  for update using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

drop policy if exists owners_admin_write on public.owners;
create policy owners_admin_write on public.owners
  for all using (public.is_admin()) with check (public.is_admin());

-- --- buyers -----------------------------------------------------------
drop policy if exists buyers_self_read on public.buyers;
create policy buyers_self_read on public.buyers
  for select using (auth_user_id = auth.uid() or public.is_admin());

drop policy if exists buyers_self_write on public.buyers;
create policy buyers_self_write on public.buyers
  for all using (auth_user_id = auth.uid() or public.is_admin())
  with check (auth_user_id = auth.uid() or public.is_admin());

-- --- leads ------------------------------------------------------------
-- No public SELECT policy exists, by design: leads carry buyer_phone and
-- buyer_email. An anon key can INSERT an enquiry and read nothing back.
drop policy if exists leads_public_insert on public.leads;
create policy leads_public_insert on public.leads
  for insert with check (true);

drop policy if exists leads_admin_read on public.leads;
create policy leads_admin_read on public.leads
  for select using (public.is_admin());

drop policy if exists leads_admin_write on public.leads;
create policy leads_admin_write on public.leads
  for all using (public.is_admin()) with check (public.is_admin());

-- --- lead_activities --------------------------------------------------
drop policy if exists lead_activities_admin on public.lead_activities;
create policy lead_activities_admin on public.lead_activities
  for all using (public.is_admin()) with check (public.is_admin());

-- --- requirements -----------------------------------------------------
drop policy if exists requirements_public_insert on public.requirements;
create policy requirements_public_insert on public.requirements
  for insert with check (true);

drop policy if exists requirements_owner_read on public.requirements;
create policy requirements_owner_read on public.requirements
  for select using (
    public.is_admin()
    or buyer_id in (select id from public.buyers where auth_user_id = auth.uid())
  );

drop policy if exists requirements_admin_write on public.requirements;
create policy requirements_admin_write on public.requirements
  for all using (public.is_admin()) with check (public.is_admin());

-- --- deals / owner_notes / audit_log ----------------------------------
drop policy if exists deals_admin on public.deals;
create policy deals_admin on public.deals
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists owner_notes_admin on public.owner_notes;
create policy owner_notes_admin on public.owner_notes
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists audit_log_admin on public.audit_log;
create policy audit_log_admin on public.audit_log
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- Counters: keep properties.enquiry_count honest without a cron job.
-- ---------------------------------------------------------------------
create or replace function public.bump_enquiry_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.property_id is not null then
    update public.properties
       set enquiry_count = enquiry_count + 1
     where id = new.property_id;
  end if;
  return new;
end $$;

drop trigger if exists leads_bump_enquiry on public.leads;
create trigger leads_bump_enquiry after insert on public.leads
  for each row execute function public.bump_enquiry_count();
