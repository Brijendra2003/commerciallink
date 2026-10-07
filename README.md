# CommercialLink

A **residential and commercial** property marketplace for the Western line
corridor from **Mira Road to Dahanu Road**.

Registered **owners, brokers and developers** list their own projects. Our team
**verifies** each one before it publishes — and a new project under
construction cannot list at all without a MahaRERA number. Buyer enquiries on a
project go **to the lister who owns it**, in their own dashboard, with the
buyer's name and number. There is a second capture path ("Post Your
Requirement") for visitors who find no match; unlike an enquiry, a requirement
stays with the internal desk.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

It runs immediately with no configuration. See [Demo mode](#demo-mode) below.

## Coverage: one corridor

The portal serves the Western line from Mira Road to Dahanu Road and nothing
else. `properties.city` stays on the schema but is no longer a useful facet; the
one buyers search on is the **station area** (`locality`), grouped into three
**belts** (`zone`):

| Belt (`zone`) | Station areas |
| --- | --- |
| `mira_bhayandar` | Mira Road E/W, Kashimira, Shanti Park, Beverly Park, Bhayandar E/W, Navghar, Uttan, Dongri |
| `vasai_virar` | Naigaon E/W, Juchandra, Vasai Road E/W, Papdy, Nalasopara E/W, Achole, Virar E/W, Bolinj, Agashi, Arnala |
| `palghar` | Vaitarna, Saphale, Kelve Road, Palghar E/W, Umroli, Boisar E/W, Tarapur MIDC, Vangaon, Chinchani, Dahanu Road |

Forty station areas, defined once in
[`lib/data/taxonomy.ts`](lib/data/taxonomy.ts). Search URLs use `?zone=` and
`?market=`, and the sitemap emits long-tail landing URLs for every
`type × station area` and `category × station area` pair.

> The six legacy MMR `mmr_zone` labels (`south`, `central`, `western`,
> `eastern`, `navi`, `thane`) remain in the database enum — Postgres cannot drop
> a label historical rows may hold — but nothing new is written with them and
> the UI does not offer them. `toProperty()` in
> [`lib/data/mappers.ts`](lib/data/mappers.ts) resolves a legacy row's belt from
> its locality.

## Segments, types and categories

One `properties` table serves both sides of the book, split by `segment`:

| | Types |
| --- | --- |
| `residential` | Flat/apartment, studio, penthouse, villa, row house, bungalow, residential plot |
| `commercial` | Office, shop & retail, warehouse/godown, industrial, commercial land, co-working |

Every listing also carries a `category`, which is the first facet buyers filter
on:

| `category` | Meaning | RERA |
| --- | --- | --- |
| `new_project` | Launched or under construction | **Required** |
| `ready_to_move` | Completed, OC received | Optional |
| `resale` | Resale or owner property | Optional |

The conditional RERA rule is enforced in three places from one predicate
(`reraRequired()` in `lib/data/taxonomy.ts`): the form reveals and requires the
field, `submitPropertyListing` re-validates it server-side, and a `CHECK`
constraint on `properties` refuses the row. `reviewProperty` additionally
refuses to approve a `new_project` with no number.

## Demo mode

With no Supabase credentials the app serves the typed mock data in `lib/data/*`,
logs form submissions instead of inserting them, and leaves the admin panel
unlocked as the seeded super admin (the sidebar says so). Every gate switches on
the moment `.env.local` is filled in — no code change. The switch is a single
flag, [`isSupabaseConfigured`](lib/supabase/env.ts).

## Connecting Supabase

1. **Create a project** at [supabase.com](https://supabase.com).

2. **Apply the migrations, in order.** Paste each into the SQL editor and run it:
   - [`0001_schema.sql`](supabase/migrations/0001_schema.sql) — tables, enums,
     indexes, triggers, RLS.
   - [`0002_portal.sql`](supabase/migrations/0002_portal.sql) — buyer/owner
     self-service policies and the `leads.buyer_id` link.
   - [`0003_listing_details.sql`](supabase/migrations/0003_listing_details.sql) —
     unique profile emails (required by the upserts), extra listing
     specification columns, and the `property-media` (public) /
     `property-documents` (private) Storage buckets for uploads.
   - [`0004_market_notes.sql`](supabase/migrations/0004_market_notes.sql) —
     the Market Notes subscriber list.
   - [`0005_segment_enums.sql`](supabase/migrations/0005_segment_enums.sql) —
     residential property types, the three corridor belts, residential
     furnishing values, and the `property_segment` / `project_category` /
     `owner_account_type` / `review_outcome` types. **Run this on its own,
     before 0006**: `alter type … add value` may not use the value it adds in
     the same transaction, so every column and policy that references these
     lives in the next file.
   - [`0006_projects_and_leads.sql`](supabase/migrations/0006_projects_and_leads.sql) —
     segment/category/RERA and residential columns, the verification trail,
     `owners.account_type`, and the `leads_owner_read` policy that lets a
     lister see the enquiries on their own projects.

3. **Fill in `.env.local`** — copy [`.env.example`](.env.example):

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
   SUPABASE_SERVICE_ROLE_KEY=<service_role key>   # server-side only
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   SEED_ADMIN_PASSWORD=<12+ characters>
   ```

4. **Seed it.**

   ```bash
   npm run db:seed
   ```

   This creates the staff auth users, then loads owners, properties, media,
   requirements, leads, activities, deals and the audit log from the same mock
   data the demo uses — so the two never drift. It is idempotent.

5. **Set the auth redirect URLs.** In Supabase → Authentication → URL
   Configuration, set the Site URL to your `NEXT_PUBLIC_SITE_URL` and add these
   to the redirect allow-list, or confirmation and reset links will bounce:

   ```
   http://localhost:3000/**
   https://your-domain.com/**
   ```

6. **Sign in.** The seed prints three accounts, all using
   `SEED_ADMIN_PASSWORD`:

   | Who | Where | Email |
   | --- | --- | --- |
   | Staff (super admin) | `/admin/login` | `nikhil@commerciallink.in` |
   | Lister (broker) | `/login` | `sanjay@kotharirealty.in` |
   | Buyer | `/login` | `rohan@arclighttech.example.com` |

   **Rotate these from the Supabase dashboard before the site is exposed to
   anyone.**

### Authentication

There are **two separate sign-in surfaces**, and each rejects the other's users:

| | Staff | Buyers & listers |
| --- | --- | --- |
| Sign in | `/admin/login` | `/login` |
| Lands on | `/admin` | `/dashboard` |
| Identity | [`lib/auth.ts`](lib/auth.ts) → `admin_users` | [`lib/portal.ts`](lib/portal.ts) → `owners` / `buyers` |

An owner, a broker and a developer are all rows in `owners`, told apart by
`account_type`. They are one `PortalRole` (`"owner"`) because they do exactly
the same things on the platform — list projects, and work the enquiries on them.
The account type changes labels and the verification checklist, not capabilities.
| Actions | [`lib/auth-actions.ts`](lib/auth-actions.ts) | [`lib/portal-actions.ts`](lib/portal-actions.ts) |

- [`proxy.ts`](proxy.ts) matches `/admin/**` and `/dashboard/**` only — a
  marketing page never pays for a session round trip. It refreshes the session
  cookie and bounces unauthenticated visitors to the right login screen with a
  `?next=` return path. (Next 16 renamed `middleware` to `proxy`.) It **fails
  closed**: if Supabase is unreachable the request is treated as
  unauthenticated.
- The layouts then confirm the user belongs there —
  [`app/admin/(panel)/layout.tsx`](app/admin/%28panel%29/layout.tsx) requires an
  `admin_users` row, [`app/(site)/dashboard/layout.tsx`](app/%28site%29/dashboard/layout.tsx)
  requires an owner or buyer profile. A staff account that signs in at `/login`
  is redirected to `/admin`, not into the portal.
- Server Actions re-verify for themselves via `requirePortalSession()` rather
  than trusting the proxy or layout — the Next production checklist is explicit
  that a layout check alone is not enough.
- Failure messages are deliberately vague, and post-login redirects are
  regex-restricted so the login page can't be turned into an open redirect.

### Listers see their own leads — and nobody else's

`/dashboard` gives an owner, broker or developer a **lead inbox**: every enquiry
raised on one of their own projects, with the buyer's name, phone, email and
message, plus a stage selector.

This **reverses** the earlier design, which showed enquiry *counts* only and had
no owner SELECT policy on `leads` at all. The reasoning is recorded at the top
of
[`0006_projects_and_leads.sql`](supabase/migrations/0006_projects_and_leads.sql):
the platform is now a marketplace where the lister works their own enquiries,
not a desk that sits between both sides. The scoping is still per row —
`leads_owner_read` admits a lead only when `owns_property(property_id)` holds.

Two things are deliberately **not** granted:

- **No lister UPDATE policy on `leads`.** RLS is row-level, so an UPDATE grant
  would let a lister rewrite `buyer_name` or `buyer_phone` on any row they can
  read. Stage changes go through `updateOwnerLeadStatus()`, which re-checks
  ownership with the service role and writes only `status`.
- **No lister read of `requirements`.** A posted requirement stays with the
  internal desk; only a project enquiry is routed onward.

### Row Level Security

- `leads` has an **INSERT policy for anon and no anon SELECT policy** — a
  visitor can submit an enquiry and cannot read anyone's back. Reads are limited
  to staff, the buyer who raised it, and the lister of the project it is on.
- `owners.phone` / `owners.email` are readable only by staff or the owner
  themselves, and are never published on a listing page.
- `properties.owner_id` is `NOT NULL` with an owner-scoped INSERT policy, and
  `submitPropertyListing` refuses an unauthenticated caller outright — so
  registration is a structural prerequisite for listing, not a UI gate.
- A lister may update their own listing but **never to `status = 'published'`**
  (the `with check` on `properties_owner_update` forbids it). Publishing is
  reachable only through `reviewProperty`, which requires an editor role. An
  edit to a live listing drops it back to `pending_review` via the
  `properties_sync_review` trigger, so it is re-verified before it goes back up.
- Public reads of `properties` are limited to `status = 'published'`.

Staff membership is the admin grant: `is_admin()` and `admin_role()` are
`SECURITY DEFINER` helpers over `admin_users`, and the permission matrix on
`/admin/settings` documents the intended role split.

## Routes

### Public

| Route | Rendering | Notes |
| --- | --- | --- |
| `/` | Static | Hero search, asset classes, featured, **every live project** split by segment, trust, process, testimonials, lister CTA, requirement band |
| `/properties` | Dynamic | URL-driven filters (segment, category, type, zone, station area, purpose, budget, area, BHK, possession, sort) + empty state that converts into a requirement |
| `/properties/[slug]` | SSG | Gallery, specs incl. RERA and configuration, sticky enquiry rail, `RealEstateListing` JSON-LD, similar stock |
| `/post-requirement` | Static | The "didn't find a match" capture path |
| `/list-your-property` | Dynamic | Supply-side landing. Shows the **single-screen** submission form to a signed-in lister, and a registration gate to everyone else |
| `/about` | Static | Positioning, principles, process, FAQs with `FAQPage` JSON-LD |
| `/contact` | Static | Contact routes + message form |
| `/login`, `/signup` | Dynamic | Sign-in and registration with four account types — buyer, owner, broker, developer (`noindex`) |
| `/reset-password` | Static | Landing page for Supabase recovery links |
| `/dashboard` | Dynamic | Lister: **lead inbox**, projects with verification state, withdraw/relist, verification checklist. Buyer: enquiry history, requirements, profile. Gated. |
| `/sitemap.xml`, `/robots.txt` | Static | Includes `type × station area` and `category × station area` landing URLs |

### Admin (`noindex`, gated)

| Route | Module |
| --- | --- |
| `/admin/login` | Staff sign-in, password reset |
| `/admin` | KPI tiles, lead funnel, 12-month volume, first-call queue, activity + audit feeds |
| `/admin/leads` | Kanban with drag-between-columns **and** a table view, filter row, detail drawer with activity timeline, CSV export |
| `/admin/requirements` | Buyer briefs with inventory matching and suggested stock |
| `/admin/properties` | Status filters, **verification queue with approve / request-changes / reject**, per-listing performance |
| `/admin/properties/[id]` | Verification panel, details incl. segment/category/RERA/configuration, Cloudinary media manager (drag-reorder), SEO fields with search preview, linked leads |
| `/admin/sales` | Deal register, commission by advisor and asset class, monthly revenue, payout tracking |
| `/admin/owners` | Directory with **account type** (owner / broker / developer) and RERA registration, KYC state, linked properties, communication log |
| `/admin/analytics` | Funnel health, source volume vs. average value, acquisition split, listing performance |
| `/admin/settings` | Team roster, RBAC permission matrix, audit log |

## Architecture

```
app/
  (site)/                 Public route group — header/footer shell
  admin/
    login/                Ungated
    (panel)/              Gated: auth check + sidebar shell
components/
  site/ home/ property/ listings/ forms/
  admin/                  Shell, page scaffolding, status badges, media manager, login form
    leads/                Kanban + table board, lead detail drawer
  charts/                 Chart card (with table twin), funnel, column, bar list, stat tile
  ui/                     Buttons, fields, section scaffolding, icons, dividers, image wrapper
lib/
  supabase/               env flag, server / browser / service-role clients, DB types
  auth.ts                 getAdminSession — the one place identity is resolved
  auth-actions.ts         Sign in / out / reset
  data/queries.ts         THE data-access boundary: Supabase when configured, mocks otherwise
  data/properties.ts      Mock properties + pure filter/sort shared by both paths
  data/crm.ts             Mock CRM rows + metrics (pure functions over a lead list)
  data/taxonomy.ts        Micro-markets, zones, asset classes, bands, labels
  actions.ts              Public form capture → real inserts, with rate limiting
proxy.ts                  Admin route gate + session refresh
supabase/migrations/      Schema, RLS, triggers
scripts/seed.ts           Seeds a fresh project from the mock data
```

Every page reads through `lib/data/queries.ts`, so the mock and live paths
return identical shapes. Swapping to generated DB types is a one-file change:

```bash
npx supabase gen types typescript --project-id <ref> > lib/supabase/types.ts
```

> One gotcha worth knowing if you edit that file: the row types must be **type
> aliases, not interfaces**. Interfaces get no implicit index signature, so they
> fail Supabase's `Record<string, unknown>` constraint and every `.from()` call
> silently degrades to `never`.

## Charts

Chart colour is computed, not picked. The tokens in
[`app/globals.css`](app/globals.css) were run through a palette validator
against the white chart surface:

- **Ordinal ramp** (`--viz-step-1..6`, funnel stages): one teal hue, monotone
  lightness, adjacent ΔL ≥ 0.06, light end 2.22:1 on white.
- **Categorical pair** (`--viz-series-1/2`, paid vs unpaid): worst all-pairs CVD
  ΔE 11.5, normal-vision ΔE 25.2 — clear of both floors.
- **Status scale** (good / warning / serious / critical): reserved meaning, never
  reused as a series colour, always shipped with a glyph and a label.

Re-run the validator if those hexes change. Every chart carries a table-view
twin, so no value is reachable only by hovering, and nominal categories (lead
source, asset class) take a single hue rather than a value ramp.

## Design

The visual language is drawn from the reference boards in `public/images`:
serif display type with an italic accent clause, uppercase eyebrow labels,
organic curved section dividers, soft rounded cards, a numbered process rail,
and a dark multi-column footer — adapted to commercial property with a deep
teal / terracotta / cream palette. Tokens live in `app/globals.css` under
`@theme`.

## Deploying

The app is Vercel-native; any Node host that runs `next build` / `next start`
works too.

1. Push the repo and import it in Vercel. Framework detection handles the rest —
   no build-command override needed.
2. Add the five variables from [`.env.example`](.env.example) to the Vercel
   project. `SUPABASE_SERVICE_ROLE_KEY` and `SEED_ADMIN_PASSWORD` are
   server-side only — do **not** give them a `NEXT_PUBLIC_` prefix.
3. Set `NEXT_PUBLIC_SITE_URL` to the production domain, and add that domain to
   the Supabase auth redirect allow-list (step 5 above). Recovery and
   confirmation links break silently otherwise.
4. Deploy, then confirm: `/` renders, `/admin/login` and `/login` both reject a
   bad password, and `/sitemap.xml` lists your live slugs.

**Already handled:** security headers and `poweredByHeader: false` in
[`next.config.ts`](next.config.ts); `robots.txt` disallowing the gated routes;
`noindex` on every authenticated page; error boundaries at the site, admin,
dashboard and root levels; streamed `loading.tsx` for the two slowest routes;
`next/font` self-hosting; `next/image` with AVIF/WebP.

**No Content-Security-Policy is set**, on purpose. A static CSP permissive
enough for Next's inlined bootstrap buys very little; doing it properly needs a
per-request nonce in `proxy.ts`. The approach is documented in
`node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md` if you
want it before launch.

## Still to wire

Honest list of what is *not* done, so nothing surprises you after launch:

- **Cloudinary / document storage.** `imageUrl()` in
  [`lib/format.ts`](lib/format.ts) is the single place media URLs are built
  (Unsplash stands in today); `next.config.ts` holds the remote pattern to
  extend. The admin media manager and the owner KYC checklist are built as UI —
  signed uploads are not, so owners email documents to the desk for now.
- **Admin write-backs.** The panel reads live data, and the *portal* writes
  (profile edit, withdraw listing, close requirement) are real. But admin-side
  edits — save listing, change lead status, mark payout settled — are still
  local component state. The RLS policies for those writes already exist.
- **Rate limiting** on public forms is an in-process map — fine for a single
  instance, replace with Upstash or similar before running multi-region.
- **Email / WhatsApp notifications** on new leads.
- **CSP**, as described above.

## Commands

```bash
npm run dev
npm run build
npm start
npm run lint
npm run typecheck
npm run db:seed
```
