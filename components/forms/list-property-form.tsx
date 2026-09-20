"use client";

import { startTransition, useActionState, useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Consent,
  Field,
  Input,
  Select,
  SubmissionSuccess,
  Textarea,
} from "@/components/ui/field";
import { FilePicker, type PickedFile } from "@/components/ui/file-picker";
import {
  AMENITY_OPTIONS,
  FURNISHING_LABEL,
  MICRO_MARKETS,
  OWNER_DOCUMENTS,
  POSSESSION_LABEL,
  PROPERTY_TYPES,
  TENANCY_STATUSES,
  ZONES,
} from "@/lib/data/taxonomy";
import { submitPropertyListing } from "@/lib/actions";
import { formatINR } from "@/lib/format";
import type { LeadSubmission } from "@/lib/types";

/** Keep in step with MAX_PHOTOS / MAX_FLOOR_PLANS in lib/storage.ts. */
const MAX_PHOTOS = 12;
const MAX_FLOOR_PLANS = 4;
/** Stays under serverActions.bodySizeLimit in next.config.ts. */
const MAX_TOTAL_BYTES = 20 * 1024 * 1024;

export interface ListingOwner {
  name: string;
  email: string;
  phone: string;
}

export function ListPropertyForm({ owner }: { owner?: ListingOwner | null }) {
  const [state, action, pending] = useActionState<LeadSubmission | null, FormData>(
    submitPropertyListing,
    null,
  );
  const [dismissed, setDismissed] = useState<LeadSubmission | null>(null);
  const [purpose, setPurpose] = useState("");
  const [price, setPrice] = useState("");
  const [photos, setPhotos] = useState<PickedFile[]>([]);
  const [plans, setPlans] = useState<PickedFile[]>([]);
  const [brochure, setBrochure] = useState<PickedFile[]>([]);
  const [clientError, setClientError] = useState<string | null>(null);

  const errors = state?.fieldErrors ?? {};
  const wantsSale = purpose === "buy" || purpose === "either";
  const wantsLease = purpose === "lease" || purpose === "either";
  const priceValue = Number(price.replace(/[₹,\s]/g, ""));

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    // Submitting through the `action` prop would reset every field after a
    // validation error. Dispatching manually keeps what the owner typed, and
    // lets the picked files (held in state) ride along.
    event.preventDefault();
    setClientError(null);

    const all = [...photos, ...plans, ...brochure];
    const total = all.reduce((sum, f) => sum + f.file.size, 0);
    if (photos.length === 0) {
      setClientError("Add at least one photo of the property.");
      document.getElementById("media")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (total > MAX_TOTAL_BYTES) {
      setClientError(
        `Attachments add up to ${(total / 1024 / 1024).toFixed(1)} MB — the limit is 20 MB. Remove a few photos or use a smaller brochure.`,
      );
      return;
    }

    const data = new FormData(event.currentTarget);
    for (const p of photos) data.append("photos", p.file);
    for (const p of plans) data.append("floor_plans", p.file);
    for (const p of brochure) data.append("brochure", p.file);
    startTransition(() => action(data));
  }

  function reset() {
    setPhotos([]);
    setPlans([]);
    setBrochure([]);
    setPurpose("");
    setPrice("");
    setDismissed(state);
  }

  if (state?.ok && state !== dismissed && !pending) {
    return <SubmissionSuccess message={state.message} reference={state.reference} onReset={reset} />;
  }

  return (
    <form key={dismissed?.reference ?? "form"} onSubmit={onSubmit} noValidate className="space-y-8">
      {/* ---------------------------------------------------------------- */}
      <Section number={1} title="The property">
        <Field
          label="Listing title"
          name="title"
          required
          error={errors.title}
          hint="Building, floor and what it is — e.g. “4th floor office, Sunteck Icon, BKC”."
        >
          <Input name="title" required maxLength={120} placeholder="e.g. Grade-A office floor, Sunteck Icon" error={errors.title} />
        </Field>

        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field label="Property type" name="property_type" required error={errors.property_type}>
            <Select name="property_type" defaultValue="" required error={errors.property_type}>
              <option value="" disabled>Select a type</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Select>
          </Field>

          <Field label="Sell or lease" name="purpose" required error={errors.purpose}>
            <Select
              name="purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              required
              error={errors.purpose}
            >
              <option value="" disabled>Select</option>
              <option value="lease">Lease it out</option>
              <option value="buy">Sell outright</option>
              <option value="either">Open to either</option>
            </Select>
          </Field>

          <Field label="Possession" name="possession" required error={errors.possession}>
            <Select name="possession" defaultValue="ready" error={errors.possession}>
              {Object.entries(POSSESSION_LABEL).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </Select>
          </Field>

          <Field label="Handover condition" name="furnishing" required error={errors.furnishing}>
            <Select name="furnishing" defaultValue="bare_shell" error={errors.furnishing}>
              {Object.entries(FURNISHING_LABEL).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </Select>
          </Field>

          <Field label="Current occupancy" name="tenancy_status" hint="Shared with our desk only.">
            <Select name="tenancy_status" defaultValue="">
              <option value="">Prefer to discuss</option>
              {TENANCY_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </Field>

          <Field label="Age of property" name="property_age_years" error={errors.property_age_years} hint="In years. 0 for new construction.">
            <Input name="property_age_years" inputMode="numeric" placeholder="e.g. 8" error={errors.property_age_years} />
          </Field>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section number={2} title="Location">
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field label="Micro-market" name="market" required error={errors.market}>
            <Select name="market" defaultValue="" required error={errors.market}>
              <option value="" disabled>Select a micro-market</option>
              {ZONES.map((z) => (
                <optgroup key={z.value} label={z.label}>
                  {MICRO_MARKETS.filter((m) => m.zone === z.value).map((m) => (
                    <option key={m.name} value={m.name}>{m.name}</option>
                  ))}
                </optgroup>
              ))}
            </Select>
          </Field>

          <Field label="Building / project name" name="building_name">
            <Input name="building_name" maxLength={120} placeholder="e.g. Sunteck Icon" />
          </Field>

          <Field label="Street address" name="address" required error={errors.address} className="sm:col-span-2">
            <Input name="address" required maxLength={240} autoComplete="street-address" placeholder="e.g. Plot C-20, G Block, Bandra Kurla Complex" error={errors.address} />
          </Field>

          <Field label="PIN code" name="pincode" error={errors.pincode}>
            <Input name="pincode" inputMode="numeric" maxLength={6} autoComplete="postal-code" placeholder="400051" error={errors.pincode} />
          </Field>

          <div className="grid grid-cols-2 gap-3.5">
            <Field label="Floor" name="floor" hint="e.g. 4th, Ground">
              <Input name="floor" maxLength={40} placeholder="4th" />
            </Field>
            <Field label="Total floors" name="total_floors" error={errors.total_floors}>
              <Input name="total_floors" inputMode="numeric" placeholder="12" error={errors.total_floors} />
            </Field>
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section number={3} title="Size & commercials">
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field label="Built-up area (sq.ft.)" name="area_sqft" required error={errors.area_sqft}>
            <Input name="area_sqft" inputMode="numeric" required placeholder="e.g. 18,400" error={errors.area_sqft} />
          </Field>
          <Field label="Carpet area (sq.ft.)" name="carpet_area_sqft" error={errors.carpet_area_sqft}>
            <Input name="carpet_area_sqft" inputMode="numeric" placeholder="e.g. 13,800" error={errors.carpet_area_sqft} />
          </Field>

          {wantsSale ? (
            <Field
              label="Expected sale price (₹)"
              name="price"
              error={errors.price}
              hint={
                priceValue >= 10_000
                  ? `= ${formatINR(priceValue)}. Leave blank for price on request.`
                  : "Total price. Leave blank for price on request."
              }
            >
              <Input
                name="price"
                inputMode="numeric"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 25,00,00,000"
                error={errors.price}
              />
            </Field>
          ) : null}

          {wantsLease ? (
            <Field label="Expected rent (₹ / sq.ft. / month)" name="rent_psf" error={errors.rent_psf} hint="Leave blank for price on request.">
              <Input name="rent_psf" inputMode="decimal" placeholder="e.g. 285" error={errors.rent_psf} />
            </Field>
          ) : null}

          <Field label="Maintenance (₹ / sq.ft. / month)" name="maintenance_psf" error={errors.maintenance_psf}>
            <Input name="maintenance_psf" inputMode="decimal" placeholder="e.g. 18" error={errors.maintenance_psf} />
          </Field>

          {wantsLease ? (
            <>
              <Field label="Security deposit (months of rent)" name="security_deposit_months" error={errors.security_deposit_months}>
                <Input name="security_deposit_months" inputMode="numeric" placeholder="e.g. 6" error={errors.security_deposit_months} />
              </Field>
              <Field label="Lock-in period (months)" name="lock_in_months" error={errors.lock_in_months}>
                <Input name="lock_in_months" inputMode="numeric" placeholder="e.g. 36" error={errors.lock_in_months} />
              </Field>
            </>
          ) : null}

          <Field label="Available from" name="available_from" error={errors.available_from}>
            <Input name="available_from" type="date" error={errors.available_from} />
          </Field>
        </div>
        {!purpose ? (
          <p className="text-[0.75rem] text-ink-300">
            Choose “Sell or lease” above to see the price fields.
          </p>
        ) : null}
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section number={4} title="Specifications & amenities">
        <div className="grid gap-3.5 sm:grid-cols-3">
          <Field label="Parking slots" name="parking_slots" error={errors.parking_slots}>
            <Input name="parking_slots" inputMode="numeric" placeholder="e.g. 20" error={errors.parking_slots} />
          </Field>
          <Field label="Power load (kVA)" name="power_load_kva" error={errors.power_load_kva}>
            <Input name="power_load_kva" inputMode="numeric" placeholder="e.g. 250" error={errors.power_load_kva} />
          </Field>
          <Field label="Ceiling height (ft)" name="ceiling_height_ft" error={errors.ceiling_height_ft}>
            <Input name="ceiling_height_ft" inputMode="decimal" placeholder="e.g. 12" error={errors.ceiling_height_ft} />
          </Field>
        </div>

        <Field label="Zoning / permitted use" name="zoning" hint="e.g. Commercial (C2), IT/ITeS, MIDC industrial.">
          <Input name="zoning" maxLength={120} placeholder="e.g. Commercial — IT/ITeS permitted" />
        </Field>

        <CheckboxGroup legend="Amenities" name="amenities" options={AMENITY_OPTIONS} />

        <Field label="Other amenities" name="amenities_other" hint="Comma separated.">
          <Input name="amenities_other" maxLength={400} placeholder="e.g. EV charging, rooftop terrace" />
        </Field>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section number={5} title="Description & documents">
        <Field
          label="Describe the property"
          name="description"
          required
          error={errors.description}
          hint="This becomes the public listing copy after our edit. Separate paragraphs with a blank line."
        >
          <Textarea
            name="description"
            rows={6}
            required
            maxLength={5000}
            placeholder="Full-floor Grade-A office with floor-to-ceiling glazing, a 72-seat fitted layout and dedicated server room. Two minutes from the BKC metro station…"
            error={errors.description}
          />
        </Field>

        <CheckboxGroup
          legend="Documents you have ready"
          hint="Not uploaded here — our onboarding team collects these on the verification call."
          name="documents"
          options={OWNER_DOCUMENTS}
        />

        <Field
          label="Private notes for our desk"
          name="notes"
          hint="Never published. Approvals, restrictions, flexibility on price or term."
        >
          <Textarea name="notes" rows={3} maxLength={2000} placeholder="Fire NOC valid to 2028. Willing to offer a fit-out contribution for a 9-year term…" />
        </Field>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section number={6} title="Photos & files" id="media">
        <FilePicker
          label="Photos"
          required
          accept="image/jpeg,image/png,image/webp"
          max={MAX_PHOTOS}
          value={photos}
          onChange={setPhotos}
          showCover
          error={errors.photos}
          hint="JPG, PNG or WebP. The first photo is the cover — use the arrows to reorder. Phone photos are fine; we reshoot before publishing."
        />
        <FilePicker
          label="Floor plans"
          accept="image/jpeg,image/png,image/webp"
          max={MAX_FLOOR_PLANS}
          value={plans}
          onChange={setPlans}
          error={errors.floor_plans}
          hint="Optional. Images of the layout or a photo of the plan."
        />
        <FilePicker
          label="Brochure"
          kind="pdf"
          accept="application/pdf"
          max={1}
          value={brochure}
          onChange={setBrochure}
          error={errors.brochure}
          hint="Optional PDF, up to 12 MB. Shared with buyers only after a qualified enquiry."
        />
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section number={7} title="About you">
        {owner ? (
          <div className="rounded-2xl border border-sand-200 bg-sand-50 px-4 py-3.5 text-[0.8125rem] text-ink-500">
            Submitting as <span className="font-semibold text-brand-900">{owner.name}</span> ·{" "}
            {owner.email} · {owner.phone}. It will appear in your dashboard.
          </div>
        ) : (
          <>
            <div className="grid gap-3.5 sm:grid-cols-2">
              <Field label="Full name" name="name" required error={errors.name}>
                <Input name="name" required autoComplete="name" placeholder="Your name" error={errors.name} />
              </Field>
              <Field label="Company" name="company">
                <Input name="company" autoComplete="organization" placeholder="Optional" />
              </Field>
              <Field label="Phone" name="phone" required error={errors.phone}>
                <Input name="phone" type="tel" required autoComplete="tel" placeholder="+91 98XXX XXXXX" error={errors.phone} />
              </Field>
              <Field label="Email" name="email" required error={errors.email}>
                <Input name="email" type="email" required autoComplete="email" placeholder="you@company.com" error={errors.email} />
              </Field>
            </div>
            <p className="text-[0.75rem] text-ink-300">
              Have an owner account?{" "}
              <a href="/login?next=/list-your-property" className="font-semibold text-brand-700 underline underline-offset-4">
                Log in
              </a>{" "}
              to track this submission from your dashboard.
            </p>
          </>
        )}
        <Consent error={errors.consent} />
      </Section>

      {clientError || (state && !state.ok) ? (
        <p role="alert" className="rounded-2xl bg-clay-50 px-4 py-3 text-[0.8125rem] font-medium text-clay-700">
          {clientError ?? state?.message}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={pending} className="w-full" arrow={!pending}>
        {pending ? "Uploading & submitting…" : "Submit Property for Review"}
      </Button>

      <p className="text-center text-[0.6875rem] leading-relaxed text-ink-300">
        Submitting creates a pending listing. Nothing goes live until our team
        has verified ownership documents with you.
      </p>
    </form>
  );
}

function Section({
  number,
  title,
  id,
  children,
}: {
  number: number;
  title: string;
  id?: string;
  children: ReactNode;
}) {
  return (
    <fieldset id={id} className={`scroll-mt-24 space-y-3.5 ${number > 1 ? "border-t border-sand-200 pt-7" : ""}`}>
      <legend className="kicker mb-3 text-clay-600">
        {number} · {title}
      </legend>
      {children}
    </fieldset>
  );
}

function CheckboxGroup({
  legend,
  hint,
  name,
  options,
}: {
  legend: string;
  hint?: string;
  name: string;
  options: string[];
}) {
  return (
    <div>
      <p className="mb-2 text-[0.8125rem] font-semibold text-brand-900">{legend}</p>
      <div className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
        {options.map((option) => (
          <label key={option} className="flex cursor-pointer items-center gap-2.5 text-[0.8125rem] text-ink-500">
            <input
              type="checkbox"
              name={name}
              value={option}
              className="h-4 w-4 shrink-0 cursor-pointer rounded border-sand-300 accent-clay-500"
            />
            {option}
          </label>
        ))}
      </div>
      {hint ? <p className="mt-2 text-[0.75rem] text-ink-300">{hint}</p> : null}
    </div>
  );
}
