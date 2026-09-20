-- =====================================================================
-- CommercialLink — Market Notes subscribers
--
-- Backs the footer subscribe form. Run after 0003_listing_details.sql.
-- Safe to re-run.
-- =====================================================================

create table if not exists public.market_notes_subscribers (
  id           uuid primary key default gen_random_uuid(),
  email        text not null unique,
  source       text not null default 'footer',
  confirmed    boolean not null default false,
  unsubscribed_at timestamptz,
  created_at   timestamptz not null default now()
);

create index if not exists market_notes_created_idx
  on public.market_notes_subscribers (created_at desc);

alter table public.market_notes_subscribers enable row level security;

-- Subscribing is a public act; reading the list is not. There is no SELECT
-- policy for anon, so the address book cannot be harvested through the API.
drop policy if exists market_notes_public_insert on public.market_notes_subscribers;
create policy market_notes_public_insert on public.market_notes_subscribers
  for insert with check (true);

drop policy if exists market_notes_admin_read on public.market_notes_subscribers;
create policy market_notes_admin_read on public.market_notes_subscribers
  for select using (public.is_admin());

drop policy if exists market_notes_admin_write on public.market_notes_subscribers;
create policy market_notes_admin_write on public.market_notes_subscribers
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- Listing media caps.
--
-- Images are limited to 2 MB and videos to 15 MB across the product. The
-- public bucket predates Cloudinary and now only serves admin-side uploads,
-- so its ceiling is brought in line with the same rule.
-- ---------------------------------------------------------------------
update storage.buckets
   set file_size_limit = 2 * 1024 * 1024
 where id = 'property-media';
