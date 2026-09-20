"use client";

import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminDialog, DialogActions, DialogStatus } from "@/components/admin/admin-dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import {
  addOwnerNote,
  createDraftListing,
  createOwner,
  inviteStaffUser,
  settleDealPayout,
  type AdminActionState,
} from "@/lib/admin-actions";
import { PROPERTY_TYPES } from "@/lib/data/taxonomy";

const PRIMARY =
  "rounded-lg bg-brand-700 px-5 py-2.5 text-[0.8125rem] font-semibold text-white transition-colors hover:bg-brand-800";
const GHOST =
  "rounded-lg border border-sand-300 bg-white px-5 py-2.5 text-[0.8125rem] font-semibold text-brand-900 transition-colors hover:bg-sand-100";

/**
 * Closes a dialog once its action reports success. Adjusting state during
 * render — rather than from an effect — is the pattern React prescribes for
 * reacting to a changed value, and avoids a cascading re-render.
 */
function useCloseOnSuccess(
  state: AdminActionState | null,
  open: boolean,
  setOpen: (open: boolean) => void,
) {
  const [seen, setSeen] = useState<AdminActionState | null>(null);
  if (state !== seen) {
    setSeen(state);
    if (state?.ok && open) setOpen(false);
  }
}

/* ---------------------------------------------------------------- owners */

export function NewOwnerButton() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<AdminActionState | null, FormData>(
    createOwner,
    null,
  );
  useCloseOnSuccess(state, open, setOpen);

  const errors = state?.fieldErrors ?? {};

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={PRIMARY}>
        + Onboard owner
      </button>

      <AdminDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Onboard an owner"
        description="Creates the owner record with KYC pending. Listings can then be filed against it."
      >
        <form action={action} className="space-y-3.5">
          <Field label="Full name" name="owner-name" required error={errors.name}>
            <Input name="name" id="owner-name" required placeholder="Owner or signatory" />
          </Field>
          <Field label="Company" name="owner-company">
            <Input name="company" id="owner-company" placeholder="Optional" />
          </Field>
          <Field label="Phone" name="owner-phone" required error={errors.phone}>
            <Input name="phone" id="owner-phone" type="tel" required placeholder="+91 98XXX XXXXX" />
          </Field>
          <Field label="Email" name="owner-email" required error={errors.email}>
            <Input name="email" id="owner-email" type="email" required placeholder="owner@company.com" />
          </Field>
          <DialogStatus state={state} />
          <DialogActions
            onCancel={() => setOpen(false)}
            submitLabel="Create owner"
            pending={pending}
          />
        </form>
      </AdminDialog>
    </>
  );
}

export function LogOwnerNoteButton({
  ownerId,
  ownerName,
}: {
  ownerId: string;
  ownerName: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<AdminActionState | null, FormData>(
    addOwnerNote,
    null,
  );
  useCloseOnSuccess(state, open, setOpen);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex-1 rounded-lg border border-sand-300 px-4 py-2 text-[0.75rem] font-semibold text-brand-900 transition-colors hover:bg-sand-100"
      >
        Log a note
      </button>

      <AdminDialog
        open={open}
        onClose={() => setOpen(false)}
        title={`Note on ${ownerName}`}
        description="Visible to staff only. Owners never see the CRM."
      >
        <form action={action} className="space-y-3.5">
          <input type="hidden" name="owner_id" value={ownerId} />
          <Field label="Note" name="owner-note" required error={state?.fieldErrors?.text}>
            <Textarea
              name="text"
              id="owner-note"
              rows={4}
              required
              maxLength={2000}
              placeholder="Called to confirm the OC is in hand; sending the mandate letter Monday…"
            />
          </Field>
          <DialogStatus state={state} />
          <DialogActions onCancel={() => setOpen(false)} submitLabel="Save note" pending={pending} />
        </form>
      </AdminDialog>
    </>
  );
}

/* ------------------------------------------------------------- listings */

export function NewListingButton({
  owners,
}: {
  owners: { id: string; name: string; company: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<
    (AdminActionState & { ref?: string }) | null,
    FormData
  >(createDraftListing, null);

  // A created draft closes the dialog and opens the listing it just made.
  const [seen, setSeen] = useState<typeof state>(null);
  if (state !== seen) {
    setSeen(state);
    if (state?.ok && state.ref) {
      setOpen(false);
      router.push(`/admin/properties/${state.ref}`);
    }
  }

  const errors = state?.fieldErrors ?? {};

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={PRIMARY}>
        + New listing
      </button>

      <AdminDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Start a listing"
        description="Creates a draft and opens it, where the specifications, commercials and media are filled in."
      >
        <form action={action} className="space-y-3.5">
          <Field label="Working title" name="listing-title" required error={errors.title}>
            <Input
              name="title"
              id="listing-title"
              required
              placeholder="e.g. Grade-A office floor, Sunteck Icon"
            />
          </Field>

          {/* A listing must belong to an owner, so with none on the book the
              only sensible next step is to create one. */}
          {owners.length === 0 ? (
            <p className="rounded-lg border border-gold-500/40 bg-gold-100/60 px-4 py-3 text-[0.8125rem] leading-relaxed text-ink-700">
              No owners on the book yet. Every listing has to sit with one —
              onboard the owner first from{" "}
              <Link
                href="/admin/owners"
                className="font-semibold text-brand-700 underline underline-offset-4"
              >
                Owner management
              </Link>
              .
            </p>
          ) : (
            <Field label="Owner" name="listing-owner" required error={errors.owner_id}>
              <Select name="owner_id" id="listing-owner" defaultValue="" required>
                <option value="" disabled>
                  Select the owner
                </option>
                {owners.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                    {o.company ? ` · ${o.company}` : ""}
                  </option>
                ))}
              </Select>
            </Field>
          )}

          <div className="grid gap-3.5 sm:grid-cols-2">
            <Field label="Asset class" name="listing-type" required error={errors.type}>
              <Select name="type" id="listing-type" defaultValue="office" required>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Transaction" name="listing-purpose" required error={errors.purpose}>
              <Select name="purpose" id="listing-purpose" defaultValue="lease" required>
                <option value="lease">Lease</option>
                <option value="buy">Sale</option>
              </Select>
            </Field>
          </div>

          <DialogStatus state={state} />
          <DialogActions
            onCancel={() => setOpen(false)}
            submitLabel="Create draft"
            pending={pending}
            disabled={owners.length === 0}
          />
        </form>
      </AdminDialog>
    </>
  );
}

/* ---------------------------------------------------------------- sales */

export function SettleDealButton({ dealRef }: { dealRef: string }) {
  const [pending, start] = useTransition();
  const [failed, setFailed] = useState<string | null>(null);

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const result = await settleDealPayout(dealRef);
            setFailed(result.ok ? null : result.message);
          })
        }
        className="rounded bg-brand-700 px-3 py-1.5 text-[0.6875rem] font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Mark settled"}
      </button>
      {failed ? (
        <span role="alert" className="text-[0.625rem] font-medium text-clay-700">
          {failed}
        </span>
      ) : null}
    </span>
  );
}

export function ExportDealsButton({
  rows,
}: {
  rows: {
    ref: string;
    client: string;
    value: number;
    commission_pct: number;
    status: string;
    closed_at: string | null;
    payout_settled: boolean;
  }[];
}) {
  function exportCsv() {
    const header = [
      "ref",
      "client",
      "value_inr",
      "commission_pct",
      "commission_inr",
      "status",
      "closed_at",
      "payout_settled",
    ];
    const body = rows.map((d) => [
      d.ref,
      d.client,
      String(d.value),
      String(d.commission_pct),
      String(Math.round((d.value * d.commission_pct) / 100)),
      d.status,
      d.closed_at ?? "",
      d.payout_settled ? "yes" : "no",
    ]);

    const csv = [header, ...body]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `commerciallink-deals-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button type="button" onClick={exportCsv} className={GHOST}>
      Export report
    </button>
  );
}

/* -------------------------------------------------------------- staff */

export function InviteUserButton() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<AdminActionState | null, FormData>(
    inviteStaffUser,
    null,
  );
  useCloseOnSuccess(state, open, setOpen);

  const errors = state?.fieldErrors ?? {};

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={PRIMARY}>
        + Invite user
      </button>

      <AdminDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Invite a staff member"
        description="Sends a Supabase invitation and creates the staff record that grants console access."
      >
        <form action={action} className="space-y-3.5">
          <Field label="Full name" name="staff-name" required error={errors.name}>
            <Input name="name" id="staff-name" required placeholder="Their name" />
          </Field>
          <Field label="Work email" name="staff-email" required error={errors.email}>
            <Input
              name="email"
              id="staff-email"
              type="email"
              required
              placeholder="them@commerciallink.in"
            />
          </Field>
          <Field
            label="Role"
            name="staff-role"
            required
            error={errors.role}
            hint="Content editors manage listings; sales executives work the pipeline; super admins manage staff."
          >
            <Select name="role" id="staff-role" defaultValue="sales_exec" required>
              <option value="sales_exec">Sales executive</option>
              <option value="content_editor">Content editor</option>
              <option value="super_admin">Super admin</option>
            </Select>
          </Field>
          <DialogStatus state={state} />
          <DialogActions
            onCancel={() => setOpen(false)}
            submitLabel="Send invitation"
            pending={pending}
          />
        </form>
      </AdminDialog>
    </>
  );
}
