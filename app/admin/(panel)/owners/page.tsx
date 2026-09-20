import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { LogOwnerNoteButton, NewOwnerButton } from "@/components/admin/quick-actions";
import { KycBadge } from "@/components/admin/status-badge";
import { StatTile } from "@/components/charts/stat-tile";
import { getAllProperties, getDeals, getOwners } from "@/lib/data/queries";
import { formatArea, formatINR } from "@/lib/format";

export const metadata: Metadata = { title: "Owner Management" };

function commission(value: number, pct: number) {
  return (value * pct) / 100;
}

/** Drafts the KYC chase, or a plain message once the owner is verified. */
function chaseDocsHref(name: string, email: string, kyc: string): string {
  const verified = kyc === "verified";
  const subject = verified
    ? "CommercialLink — your listings"
    : "CommercialLink — ownership documents outstanding";
  const body = verified
    ? `Hello ${name},\n\n\n\nRegards,\nCommercialLink advisory desk`
    : [
        `Hello ${name},`,
        "",
        "Before we can publish your listing we need to complete verification.",
        "Please reply with:",
        "  • Title deed or share certificate",
        "  • Latest property tax receipt",
        "  • Photo ID of the signatory",
        "  • Occupancy certificate, where issued",
        "",
        "Regards,",
        "CommercialLink onboarding desk",
      ].join("\n");

  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default async function OwnersPage() {
  const [owners, deals, properties] = await Promise.all([
    getOwners(),
    getDeals(),
    getAllProperties(),
  ]);
  const verified = owners.filter((o) => o.kyc_status === "verified").length;
  const pending = owners.filter((o) => o.kyc_status === "pending");

  return (
    <>
      <PageHeader
        title="Owner management"
        lead="The supply side. Verification status, the properties each owner has with us, and the running conversation — buyer identities never appear in any of it."
        action={<NewOwnerButton />}
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Owners on the book" value={String(owners.length)} />
        <StatTile label="KYC verified" value={`${verified} of ${owners.length}`} />
        <StatTile label="Properties under mandate" value={String(properties.length)} />
        <StatTile
          label="Payouts outstanding"
          value={formatINR(
            deals
              .filter((d) => d.status === "won" && !d.payout_settled)
              .reduce((s, d) => s + commission(d.value, d.commission_pct), 0),
          )}
        />
      </div>

      {pending.length > 0 ? (
        <div className="mb-4 rounded-3xl border border-sand-200 bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="grid h-6 w-6 place-items-center rounded-full text-[0.6875rem] font-bold text-white"
              style={{ background: "var(--color-status-warning)" }}
            >
              !
            </span>
            <h2 className="text-[0.875rem] font-bold text-brand-900">
              {pending.length} owners with KYC outstanding
            </h2>
          </div>
          <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-500">
            Their listings can stay in draft, but nothing publishes and no deal
            closes until ownership documents are on file.{" "}
            {pending.map((o) => o.name).join(", ")}.
          </p>
        </div>
      ) : null}

      <ul className="grid gap-4 lg:grid-cols-2">
        {owners.map((owner) => {
          const linked = owner.property_ids
            .map((id) => properties.find((p) => p.id === id))
            .filter((p): p is NonNullable<typeof p> => Boolean(p));
          const ownerDeals = deals.filter((d) => d.owner_id === owner.id);
          const closed = ownerDeals.filter((d) => d.status === "won");

          return (
            <li
              key={owner.id}
              className="flex flex-col rounded-3xl border border-sand-200 bg-white p-5 shadow-soft"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded bg-brand-800 text-[0.8125rem] font-bold text-white">
                    {owner.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[0.9375rem] font-bold tracking-tight text-brand-900">
                      {owner.name}
                    </span>
                    <span className="mt-0.5 block truncate text-[0.75rem] text-ink-500">
                      {owner.company} · {owner.city}
                    </span>
                  </span>
                </div>
                <KycBadge status={owner.kyc_status} />
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-sand-200 pt-4 text-[0.75rem]">
                <div className="min-w-0">
                  <dt className="text-[0.625rem] text-ink-300">Phone</dt>
                  <dd className="mt-0.5">
                    <a
                      href={`tel:${owner.phone.replace(/\s/g, "")}`}
                      className="font-semibold text-brand-800 hover:underline"
                    >
                      {owner.phone}
                    </a>
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-[0.625rem] text-ink-300">Email</dt>
                  <dd className="mt-0.5 truncate">
                    <a
                      href={`mailto:${owner.email}`}
                      className="font-semibold text-brand-800 hover:underline"
                    >
                      {owner.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-[0.625rem] text-ink-300">Verified</dt>
                  <dd className="mt-0.5 font-semibold text-brand-900">
                    {owner.verified_at ?? "Not yet"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[0.625rem] text-ink-300">Deals closed</dt>
                  <dd className="mt-0.5 font-semibold tabular-nums text-brand-900">
                    {closed.length}
                    {closed.length > 0
                      ? ` · ${formatINR(closed.reduce((s, d) => s + d.value, 0))}`
                      : ""}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 border-t border-sand-200 pt-4">
                <p className="text-[0.625rem] font-bold uppercase tracking-[0.12em] text-ink-300">
                  Properties
                </p>
                <ul className="mt-2.5 space-y-1.5">
                  {linked.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/admin/properties/${p.id}`}
                        className="flex items-center justify-between gap-3 rounded-xl bg-sand-50 px-3.5 py-2.5 transition-colors hover:bg-sand-100"
                      >
                        <span className="min-w-0 truncate text-[0.75rem] font-semibold text-brand-900">
                          {p.title}
                        </span>
                        <span className="shrink-0 text-[0.6875rem] text-ink-300">
                          {formatArea(p.area_sqft)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 flex-1 border-t border-sand-200 pt-4">
                <p className="text-[0.625rem] font-bold uppercase tracking-[0.12em] text-ink-300">
                  Communication log
                </p>
                <ul className="mt-2.5 space-y-2.5">
                  {owner.notes.map((n, i) => (
                    <li key={i} className="text-[0.75rem] leading-relaxed">
                      <p className="text-ink-500">{n.text}</p>
                      <p className="mt-0.5 text-[0.6875rem] text-ink-300">
                        {n.author} · {n.date}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 flex gap-2 border-t border-sand-200 pt-4">
                <LogOwnerNoteButton ownerId={owner.id} ownerName={owner.name} />
                <a
                  href={chaseDocsHref(owner.name, owner.email, owner.kyc_status)}
                  className="flex-1 rounded-lg border border-sand-300 px-4 py-2 text-center text-[0.75rem] font-semibold text-brand-900 transition-colors hover:bg-sand-100"
                >
                  {owner.kyc_status === "verified" ? "Email owner" : "Chase documents"}
                </a>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
