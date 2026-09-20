# CommercialLink

A commercial real estate lead-generation portal for the **Mumbai Metropolitan
Region**, built to the brief in
[`public/CommercialLink_Project_Documentation.docx`](public/CommercialLink_Project_Documentation.docx).

The platform is a **controlled marketplace**: owner contact details are never
published, and every buyer interaction funnels through an enquiry that becomes a
lead the admin desk works. That principle drives the UI throughout — every
listing CTA is enquiry-based, and there is a second capture path ("Post Your
Requirement") for visitors who find no match.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

It runs immediately with no configuration. See [Demo mode](#demo-mode) below.

## Coverage: Mumbai only

The portal serves the MMR and nothing else. `properties.city` is always
`Mumbai`; the facet buyers actually search on is the **micro-market**
(`locality`), grouped into six **zones** (`zone`):

| Zone | Micro-markets |
| --- | --- |
| South Mumbai | Nariman Point, Fort & Ballard Estate, Colaba |
| Central Mumbai | Worli, Lower Parel, Prabhadevi, Dadar |
| Western Suburbs | BKC, Bandra West, Andheri East/West, Goregaon, Malad |
| Eastern Suburbs | Powai, Vikhroli, Ghatkopar, Chembur |
| Navi Mumbai | Vashi, Turbhe, Airoli, Belapur, Taloja MIDC |
| Thane & Beyond | Thane West, Wagle Estate, Bhiwandi, Panvel |

Twenty-six micro-markets, defined once in
[`lib/data/taxonomy.ts`](lib/data/taxonomy.ts). Search URLs use `?zone=` and
`?market=`, and the sitemap emits a long-tail landing URL for every
`type × micro-market` pair.

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
   | Owner | `/login` | `sanjay@kotharirealty.in` |
   | Buyer | `/login` | `rohan@arclighttech.example.com` |

   **Rotate these from the Supabase dashboard before the site is exposed to
   anyone.**

### Authentication

There are **two separate sign-in surfaces**, and each rejects the other's users:

| | Staff | Buyers & owners |
| --- | --- | --- |
| Sign in | `/admin/login` | `/login` |
| Lands on | `/admin` | `/dashboard` |
| Identity | [`lib/auth.ts`](lib/auth.ts) → `admin_users` | [`lib/portal.ts`](lib/portal.ts) → `owners` / `buyers` |
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

### The owner dashboard sees counts, not enquirers

`/dashboard` shows an owner their listings with view and enquiry **counts**
sourced from `properties.enquiry_count`. There is deliberately **no owner SELECT
policy on `leads`** — RLS is row-level, not column-level, so any owner-facing
read of that table would expose `buyer_phone` and `buyer_email`. That is the
"no direct contact" guarantee from Section 2.1, held at the database rather than
in the UI.

### Row Level Security

The brief's core guarantee is enforced in the database, not the UI:

- `leads` has an **INSERT policy for anon and no SELECT policy** — a visitor can
  submit an enquiry and cannot read anyone's back, even with a direct API call.
- `owners.phone` / `owners.email` are readable only by staff or the owner
  themselves.
- `properties.owner_id` is `NOT NULL` with an owner-scoped INSERT policy, which
  makes registration a structural prerequisite for listing rather than a UI gate.
- Public reads of `properties` are limited to `status = 'published'`.

Staff membership is the admin grant: `is_admin()` and `admin_role()` are
`SECURITY DEFINER` helpers over `admin_users`, and the permission matrix on
`/admin/settings` documents the intended role split.

## Routes

### Public

| Route | Rendering | Notes |
| --- | --- | --- |
| `/` | Static | Hero search, asset classes, featured mandates, trust, process, testimonials, owner CTA, requirement band |
| `/properties` | Dynamic | URL-driven filters (type, zone, micro-market, purpose, budget, area, possession, sort) + empty state that converts into a requirement |
| `/properties/[slug]` | SSG | Gallery, specs, sticky enquiry rail, `RealEstateListing` JSON-LD, similar stock |
| `/post-requirement` | Static | The "didn't find a match" capture path |
| `/list-your-property` | Static | Supply-side landing + owner submission form |
| `/about` | Static | Positioning, principles, process, FAQs with `FAQPage` JSON-LD |
| `/contact` | Static | Desk contact routes + message form |
| `/login`, `/signup` | Dynamic | Buyer & owner sign-in and registration with role selection (`noindex`) |
| `/reset-password` | Static | Landing page for Supabase recovery links |
| `/dashboard` | Dynamic | Owner: listings with view/enquiry counts, verification checklist. Buyer: enquiry history, requirements, profile. Gated. |
| `/sitemap.xml`, `/robots.txt` | Static | Includes `type × micro-market` landing URLs |

### Admin (`noindex`, gated)

| Route | Module |
| --- | --- |
| `/admin/login` | Staff sign-in, password reset |
| `/admin` | KPI tiles, lead funnel, 12-month volume, first-call queue, activity + audit feeds |
| `/admin/leads` | Kanban with drag-between-columns **and** a table view, filter row, detail drawer with activity timeline, CSV export |
| `/admin/requirements` | Buyer briefs with inventory matching and suggested stock |
| `/admin/properties` | Status filters, owner-submission approval queue, per-listing performance |
| `/admin/properties/[id]` | Details, Cloudinary media manager (drag-reorder), SEO fields with search preview, linked leads |
| `/admin/sales` | Deal register, commission by advisor and asset class, monthly revenue, payout tracking |
| `/admin/owners` | Directory, KYC state, linked properties, communication log |
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
