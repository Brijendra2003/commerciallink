-- =====================================================================
-- CommercialLink — richer listings, media storage, profile uniqueness
--
-- Run after 0002_portal.sql. Safe to re-run.
-- =====================================================================

-- ---------------------------------------------------------------------
-- One profile per email, per side.
--
-- The listing, signup and seed code all upsert with ON CONFLICT (email),
-- which Postgres rejects unless a matching unique index exists. Emails are
-- lower-cased by the application before they are written.
--
-- If this fails with a duplicate-key error, merge the duplicate rows first:
--   select email, count(*) from public.owners group by email having count(*) > 1;
-- ---------------------------------------------------------------------
create unique index if not exists owners_email_unique on public.owners (email);
create unique index if not exists buyers_email_unique on public.buyers (email);

-- ---------------------------------------------------------------------
-- Listing specifications buyers ask for before they will book a visit.
-- All nullable: the desk completes whatever the owner leaves blank.
-- ---------------------------------------------------------------------
alter table public.properties
  add column if not exists building_name           text,
  add column if not exists pincode                 text,
  add column if not exists total_floors            integer check (total_floors is null or total_floors > 0),
  add column if not exists property_age_years      integer check (property_age_years is null or property_age_years >= 0),
  add column if not exists available_from          date,
  add column if not exists maintenance_psf         numeric(10,2) check (maintenance_psf is null or maintenance_psf >= 0),
  add column if not exists security_deposit_months integer check (security_deposit_months is null or security_deposit_months >= 0),
  add column if not exists lock_in_months          integer check (lock_in_months is null or lock_in_months >= 0),
  add column if not exists parking_slots           integer check (parking_slots is null or parking_slots >= 0),
  add column if not exists power_load_kva          integer check (power_load_kva is null or power_load_kva >= 0),
  add column if not exists ceiling_height_ft       numeric(6,2) check (ceiling_height_ft is null or ceiling_height_ft > 0);

-- ---------------------------------------------------------------------
-- Owners can see the media on their own listings, whatever the status.
-- ---------------------------------------------------------------------
drop policy if exists property_media_owner_read on public.property_media;
create policy property_media_owner_read on public.property_media
  for select to authenticated
  using (
    property_id in (
      select p.id from public.properties p
      join public.owners o on o.id = p.owner_id
      where o.auth_user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------
-- Storage buckets.
--
--  property-media      public  — photos and floor plans, served on listings.
--  property-documents  private — brochures, released by the desk on enquiry.
--
-- All writes go through the service-role client in server actions (which
-- validate type and size), so no INSERT policies are granted to clients.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('property-media', 'property-media', true, 6 * 1024 * 1024,
   array['image/jpeg', 'image/png', 'image/webp']),
  ('property-documents', 'property-documents', false, 12 * 1024 * 1024,
   array['application/pdf'])
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
