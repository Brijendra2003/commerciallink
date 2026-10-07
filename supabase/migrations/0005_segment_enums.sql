-- =====================================================================
-- CommercialLink — enum groundwork for residential stock, project
-- categories, broker/developer accounts and the Mira Road–Dahanu
-- Road corridor.
--
-- Kept in its own migration ON PURPOSE. `alter type ... add value` may
-- not USE the value it adds inside the same transaction, so every
-- column, constraint and policy that references these values lives in
-- 0006_projects_and_leads.sql and runs afterwards.
--
-- Run before 0006. Safe to re-run.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Residential asset classes join the existing commercial ones. One
-- `property_type` enum keeps a single listings table serving both
-- sides of the book.
-- ---------------------------------------------------------------------
alter type property_type add value if not exists 'apartment';
alter type property_type add value if not exists 'studio';
alter type property_type add value if not exists 'penthouse';
alter type property_type add value if not exists 'villa';
alter type property_type add value if not exists 'row_house';
alter type property_type add value if not exists 'bungalow';
alter type property_type add value if not exists 'plot';

-- ---------------------------------------------------------------------
-- The service area is now the Western line from Mira Road to Dahanu
-- Road. The six MMR values stay in the enum — Postgres cannot drop an
-- enum label that historical rows may still carry — but nothing new is
-- written with them, and lib/data/taxonomy.ts no longer offers them.
-- ---------------------------------------------------------------------
alter type mmr_zone add value if not exists 'mira_bhayandar';
alter type mmr_zone add value if not exists 'vasai_virar';
alter type mmr_zone add value if not exists 'palghar';

-- ---------------------------------------------------------------------
-- Residential handover vocabulary. Commercial keeps bare/warm shell.
-- ---------------------------------------------------------------------
alter type furnishing add value if not exists 'unfurnished';
alter type furnishing add value if not exists 'semi_furnished';
alter type furnishing add value if not exists 'furnished';

-- ---------------------------------------------------------------------
-- New types, created whole.
-- ---------------------------------------------------------------------
do $$ begin
  -- Which side of the book a listing belongs to.
  create type property_segment as enum ('commercial', 'residential');
exception when duplicate_object then null;
end $$;

do $$ begin
  -- The buyer-facing category. 'new_project' is the one that requires a
  -- RERA registration number — enforced by a CHECK in 0006.
  create type project_category as enum ('new_project', 'ready_to_move', 'resale');
exception when duplicate_object then null;
end $$;

do $$ begin
  -- Who is listing: the owner of the asset, an intermediary, or a
  -- developer marketing their own project.
  create type owner_account_type as enum ('owner', 'broker', 'developer');
exception when duplicate_object then null;
end $$;

do $$ begin
  -- The outcome of the admin verification pass on a submitted listing.
  create type review_outcome as enum ('pending', 'approved', 'rejected', 'changes_requested');
exception when duplicate_object then null;
end $$;
