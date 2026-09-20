"use client";

import {
  startTransition,
  useActionState,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
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
  MediaUploader,
  completedAssets,
  isUploading,
  newDraftRef,
  type MediaItem,
} from "@/components/ui/media-uploader";
import { MAX_FLOOR_PLANS, MAX_PHOTOS, MAX_VIDEOS } from "@/lib/media";
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

export interface ListingOwner {
  name: string;
  email: string;
  phone: string;
}

/**
 * The seven-part scroll this replaced asked for everything at once, which
 * reads as a questionnaire rather than an onboarding. The fields and the
 * submitted payload are unchanged — they are now staged, so an owner sees
 * one decision at a time and knows how much is left.
 *
 * Every step stays mounted (hidden, not unmounted) so one FormData still
 * carries the whole submission and nothing typed is lost on navigation.
 */
const STEPS = [
  { title: "Property", blurb: "What the asset is, and how you want to transact." },
  { title: "Location", blurb: "Where it sits, down to the floor." },
  { title: "Commercials", blurb: "Area, pricing and the terms you expect." },
  { title: "Specifications", blurb: "Services, fit-out and building amenities." },
  { title: "Media", blurb: "Photography, plans and documents you hold." },
  { title: "Review", blurb: "Description, your details, and submit." },
] as const;

export function ListPropertyForm({ owner }: { owner?: ListingOwner | null }) {
  const [state, action, pending] = useActionState<LeadSubmission | null, FormData>(
    submitPropertyListing,
    null,
  );
  const [dismissed, setDismissed] = useState<LeadSubmission | null>(null);
  const [step, setStep] = useState(0);
  const [showInvalid, setShowInvalid] = useState(false);
  const [purpose, setPurpose] = useState("");
  const [price, setPrice] = useState("");
  const [photos, setPhotos] = useState<MediaItem[]>([]);
  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [plans, setPlans] = useState<MediaItem[]>([]);
  const [brochure, setBrochure] = useState<PickedFile[]>([]);
  // Groups this submission's files in one Cloudinary draft folder until the
  // listing row exists and they can be filed under the property.
  const [draftRef] = useState(newDraftRef);
  const [clientError, setClientError] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const stepRefs = useRef<(HTMLFieldSetElement | null)[]>([]);

  const errors = state?.fieldErrors ?? {};
  const wantsSale = purpose === "buy" || purpose === "either";
  const wantsLease = purpose === "lease" || purpose === "either";
  const priceValue = Number(price.replace(/[₹,\s]/g, ""));
  const last = STEPS.length - 1;

  /** Each step hands its fieldset back here on mount, so validation can scope
   *  itself to one step's controls. */
  function registerStep(index: number, node: HTMLFieldSetElement | null) {
    stepRefs.current[index] = node;
  }

  /**
   * Native validity on the controls inside one step. Returns the first
   * control that fails so the caller can put the cursor on it.
   */
  function firstInvalidIn(index: number) {
    const scope = stepRefs.current[index];
    if (!scope) return null;
    const controls = Array.from(
      scope.querySelectorAll<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >("input, select, textarea"),
    );
    return controls.find((control) => !control.checkValidity()) ?? null;
  }

  function goTo(next: number) {
    setStep(next);
    setShowInvalid(false);
    setClientError(null);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function onContinue() {
    const invalid = firstInvalidIn(step);
    if (invalid) {
      setShowInvalid(true);
      setClientError("Some required details are missing — they are marked below.");
      invalid.focus();
      return;
    }
    if (step === 4) {
      const mediaIssue = checkMedia();
      if (mediaIssue) {
        setClientError(mediaIssue);
        return;
      }
    }
    goTo(Math.min(step + 1, last));
  }

  /** The media step's own rules — uploads must have finished, and a listing
   *  without a photograph is not reviewable. */
  function checkMedia(): string | null {
    if (isUploading(photos, videos, plans)) {
      return "Uploads are still running. They finish in a moment.";
    }
    if ([...photos, ...videos, ...plans].some((i) => i.status === "error")) {
      return "Some files didn't upload. Remove or replace the ones marked in red.";
    }
    if (completedAssets(photos).length === 0) {
      return "Add at least one photograph of the property.";
    }
    return null;
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    // Submitting through the `action` prop would reset every field after a
    // validation error. Dispatching manually keeps what the owner typed, and
    // lets the picked files (held in state) ride along.
    event.preventDefault();
    setClientError(null);

    // A gap on an earlier step has to take the owner back to it, not fail here.
    for (let i = 0; i < STEPS.length; i += 1) {
      const invalid = firstInvalidIn(i);
      if (invalid) {
        setStep(i);
        setShowInvalid(true);
        setClientError(
          `Step ${i + 1} — ${STEPS[i].title} — is missing a required detail.`,
        );
        requestAnimationFrame(() => invalid.focus());
        return;
      }
    }

    const mediaIssue = checkMedia();
    if (mediaIssue) {
      setStep(4);
      setClientError(mediaIssue);
      return;
    }

    const data = new FormData(event.currentTarget);
    // Photos, videos and floor plans are already on Cloudinary; only their
    // identifiers travel with the form. The brochure still uploads here
    // because it is filed in a private bucket, not a public CDN.
    data.set(
      "media",
      JSON.stringify([
        ...completedAssets(photos),
        ...completedAssets(videos),
        ...completedAssets(plans),
      ]),
    );
    data.set("draft_ref", draftRef);
    for (const p of brochure) data.append("brochure", p.file);
    startTransition(() => action(data));
  }

  function reset() {
    setPhotos([]);
    setVideos([]);
    setPlans([]);
    setBrochure([]);
    setPurpose("");
    setPrice("");
    setStep(0);
    setDismissed(state);
  }

  if (state?.ok && state !== dismissed && !pending) {
    return (
      <SubmissionSuccess
        message={state.message}
        reference={state.reference}
        onReset={reset}
      />
    );
  }

  return (
    <form
      ref={formRef}
      key={dismissed?.reference ?? "form"}
      onSubmit={onSubmit}
      noValidate
      className={`scroll-mt-28 ${showInvalid ? "validate-visible" : ""}`}
    >
      <div className="grid gap-8 lg:grid-cols-[13rem_1fr] lg:gap-10">
        <StepRail current={step} onSelect={goTo} />

        <div className="min-w-0">
          <header className="border-b border-sand-200 pb-4">
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-brand-600 tnum">
              Step {step + 1} of {STEPS.length}
            </p>
            <h3 className="mt-1.5 font-display text-[1.25rem] font-semibold tracking-[-0.015em] text-brand-900">
              {STEPS[step].title}
            </h3>
            <p className="mt-1 text-[0.8125rem] text-ink-500">{STEPS[step].blurb}</p>
          </header>

          <div className="pt-6">
            {/* ------------------------------------------------ 1. Property */}
            <Step index={0} current={step} register={registerStep} label="Property">
              <Field
                label="Listing title"
                name="title"
                required
                error={errors.title}
                hint="Building, floor and asset type — e.g. “4th floor office, Sunteck Icon, BKC”."
              >
                <Input
                  name="title"
                  required
                  maxLength={120}
                  placeholder="e.g. Grade-A office floor, Sunteck Icon"
                  error={errors.title}
                />
              </Field>

              <Grid>
                <Field
                  label="Property type"
                  name="property_type"
                  required
                  error={errors.property_type}
                >
                  <Select
                    name="property_type"
                    defaultValue=""
                    required
                    error={errors.property_type}
                  >
                    <option value="" disabled>
                      Select a type
                    </option>
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field
                  label="Transaction type"
                  name="purpose"
                  required
                  error={errors.purpose}
                >
                  <Select
                    name="purpose"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    required
                    error={errors.purpose}
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    <option value="lease">Lease</option>
                    <option value="buy">Outright sale</option>
                    <option value="either">Either, open to offers</option>
                  </Select>
                </Field>

                <Field
                  label="Possession"
                  name="possession"
                  required
                  error={errors.possession}
                >
                  <Select name="possession" defaultValue="ready" error={errors.possession}>
                    {Object.entries(POSSESSION_LABEL).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field
                  label="Handover condition"
                  name="furnishing"
                  required
                  error={errors.furnishing}
                >
                  <Select
                    name="furnishing"
                    defaultValue="bare_shell"
                    error={errors.furnishing}
                  >
                    {Object.entries(FURNISHING_LABEL).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field
                  label="Current occupancy"
                  name="tenancy_status"
                  hint="Shared with our desk only, never published."
                >
                  <Select name="tenancy_status" defaultValue="">
                    <option value="">Prefer to discuss</option>
                    {TENANCY_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field
                  label="Age of property"
                  name="property_age_years"
                  error={errors.property_age_years}
                  hint="In years. Enter 0 for new construction."
                >
                  <Input
                    name="property_age_years"
                    inputMode="numeric"
                    placeholder="e.g. 8"
                    error={errors.property_age_years}
                  />
                </Field>
              </Grid>
            </Step>

            {/* ------------------------------------------------ 2. Location */}
            <Step index={1} current={step} register={registerStep} label="Location">
              <Grid>
                <Field label="Micro-market" name="market" required error={errors.market}>
                  <Select name="market" defaultValue="" required error={errors.market}>
                    <option value="" disabled>
                      Select a micro-market
                    </option>
                    {ZONES.map((z) => (
                      <optgroup key={z.value} label={z.label}>
                        {MICRO_MARKETS.filter((m) => m.zone === z.value).map((m) => (
                          <option key={m.name} value={m.name}>
                            {m.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </Select>
                </Field>

                <Field label="Building / project name" name="building_name">
                  <Input name="building_name" maxLength={120} placeholder="e.g. Sunteck Icon" />
                </Field>

                <Field
                  label="Street address"
                  name="address"
                  required
                  error={errors.address}
                  className="sm:col-span-2"
                >
                  <Input
                    name="address"
                    required
                    maxLength={240}
                    autoComplete="street-address"
                    placeholder="e.g. Plot C-20, G Block, Bandra Kurla Complex"
                    error={errors.address}
                  />
                </Field>

                <Field label="PIN code" name="pincode" error={errors.pincode}>
                  <Input
                    name="pincode"
                    inputMode="numeric"
                    maxLength={6}
                    autoComplete="postal-code"
                    placeholder="400051"
                    error={errors.pincode}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Floor" name="floor" hint="e.g. 4th, Ground">
                    <Input name="floor" maxLength={40} placeholder="4th" />
                  </Field>
                  <Field
                    label="Total floors"
                    name="total_floors"
                    error={errors.total_floors}
                  >
                    <Input
                      name="total_floors"
                      inputMode="numeric"
                      placeholder="12"
                      error={errors.total_floors}
                    />
                  </Field>
                </div>
              </Grid>
            </Step>

            {/* --------------------------------------------- 3. Commercials */}
            <Step index={2} current={step} register={registerStep} label="Commercials">
              {!purpose ? (
                <p className="rounded-lg border border-sand-200 bg-sand-50 px-4 py-3 text-[0.8125rem] text-ink-500">
                  Set the transaction type on step 1 and the relevant pricing
                  fields appear here.
                </p>
              ) : null}

              <Grid>
                <Field
                  label="Built-up area (sq.ft.)"
                  name="area_sqft"
                  required
                  error={errors.area_sqft}
                >
                  <Input
                    name="area_sqft"
                    inputMode="numeric"
                    required
                    placeholder="e.g. 18,400"
                    error={errors.area_sqft}
                  />
                </Field>
                <Field
                  label="Carpet area (sq.ft.)"
                  name="carpet_area_sqft"
                  error={errors.carpet_area_sqft}
                >
                  <Input
                    name="carpet_area_sqft"
                    inputMode="numeric"
                    placeholder="e.g. 13,800"
                    error={errors.carpet_area_sqft}
                  />
                </Field>

                {wantsSale ? (
                  <Field
                    label="Expected sale price (₹)"
                    name="price"
                    error={errors.price}
                    hint={
                      priceValue >= 10_000
                        ? `= ${formatINR(priceValue)}. Leave blank for price on request.`
                        : "Total consideration. Leave blank for price on request."
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
                  <Field
                    label="Expected rent (₹ / sq.ft. / month)"
                    name="rent_psf"
                    error={errors.rent_psf}
                    hint="Leave blank for rent on request."
                  >
                    <Input
                      name="rent_psf"
                      inputMode="decimal"
                      placeholder="e.g. 285"
                      error={errors.rent_psf}
                    />
                  </Field>
                ) : null}

                <Field
                  label="Maintenance (₹ / sq.ft. / month)"
                  name="maintenance_psf"
                  error={errors.maintenance_psf}
                >
                  <Input
                    name="maintenance_psf"
                    inputMode="decimal"
                    placeholder="e.g. 18"
                    error={errors.maintenance_psf}
                  />
                </Field>

                {wantsLease ? (
                  <>
                    <Field
                      label="Security deposit (months of rent)"
                      name="security_deposit_months"
                      error={errors.security_deposit_months}
                    >
                      <Input
                        name="security_deposit_months"
                        inputMode="numeric"
                        placeholder="e.g. 6"
                        error={errors.security_deposit_months}
                      />
                    </Field>
                    <Field
                      label="Lock-in period (months)"
                      name="lock_in_months"
                      error={errors.lock_in_months}
                    >
                      <Input
                        name="lock_in_months"
                        inputMode="numeric"
                        placeholder="e.g. 36"
                        error={errors.lock_in_months}
                      />
                    </Field>
                  </>
                ) : null}

                <Field
                  label="Available from"
                  name="available_from"
                  error={errors.available_from}
                >
                  <Input name="available_from" type="date" error={errors.available_from} />
                </Field>
              </Grid>
            </Step>

            {/* ------------------------------------------ 4. Specifications */}
            <Step index={3} current={step} register={registerStep} label="Specifications">
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Parking slots" name="parking_slots" error={errors.parking_slots}>
                  <Input
                    name="parking_slots"
                    inputMode="numeric"
                    placeholder="e.g. 20"
                    error={errors.parking_slots}
                  />
                </Field>
                <Field
                  label="Power load (kVA)"
                  name="power_load_kva"
                  error={errors.power_load_kva}
                >
                  <Input
                    name="power_load_kva"
                    inputMode="numeric"
                    placeholder="e.g. 250"
                    error={errors.power_load_kva}
                  />
                </Field>
                <Field
                  label="Ceiling height (ft)"
                  name="ceiling_height_ft"
                  error={errors.ceiling_height_ft}
                >
                  <Input
                    name="ceiling_height_ft"
                    inputMode="decimal"
                    placeholder="e.g. 12"
                    error={errors.ceiling_height_ft}
                  />
                </Field>
              </div>

              <Field
                label="Zoning / permitted use"
                name="zoning"
                hint="e.g. Commercial (C2), IT/ITeS, MIDC industrial."
              >
                <Input
                  name="zoning"
                  maxLength={120}
                  placeholder="e.g. Commercial — IT/ITeS permitted"
                />
              </Field>

              <CheckboxGroup legend="Amenities" name="amenities" options={AMENITY_OPTIONS} />

              <Field label="Other amenities" name="amenities_other" hint="Comma separated.">
                <Input
                  name="amenities_other"
                  maxLength={400}
                  placeholder="e.g. EV charging, rooftop terrace"
                />
              </Field>
            </Step>

            {/* -------------------------------------------------- 5. Media */}
            <Step index={4} current={step} register={registerStep} label="Media">
              <MediaUploader
                kind="image"
                label="Photographs"
                required
                showCover
                draftRef={draftRef}
                value={photos}
                onChange={setPhotos}
                error={errors.photos}
                hint={`Up to ${MAX_PHOTOS}. The first is the cover — use the arrows to reorder. Phone photographs are fine and are resized for you; we reshoot before publishing.`}
              />
              <MediaUploader
                kind="video"
                label="Video walkthrough"
                draftRef={draftRef}
                value={videos}
                onChange={setVideos}
                error={errors.videos}
                hint={`Optional, up to ${MAX_VIDEOS}. A steady walk through the floor plate converts far better than stills alone.`}
              />
              <MediaUploader
                kind="floor_plan"
                label="Floor plans"
                draftRef={draftRef}
                value={plans}
                onChange={setPlans}
                error={errors.floor_plans}
                hint={`Optional, up to ${MAX_FLOOR_PLANS}. An image of the layout, or a photograph of the printed plan.`}
              />
              <FilePicker
                label="Brochure"
                kind="pdf"
                accept="application/pdf"
                max={1}
                value={brochure}
                onChange={setBrochure}
                error={errors.brochure}
                hint="Optional PDF, up to 12 MB. Released to buyers only after a qualified enquiry."
              />

              <CheckboxGroup
                legend="Ownership documents you hold"
                hint="Not uploaded here — our onboarding team collects these on the verification call."
                name="documents"
                options={OWNER_DOCUMENTS}
              />
            </Step>

            {/* ------------------------------------------------- 6. Review */}
            <Step index={5} current={step} register={registerStep} label="Review">
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

              <Field
                label="Private notes for our desk"
                name="notes"
                hint="Never published. Approvals, restrictions, flexibility on price or term."
              >
                <Textarea
                  name="notes"
                  rows={3}
                  maxLength={2000}
                  placeholder="Fire NOC valid to 2028. Willing to offer a fit-out contribution for a 9-year term…"
                />
              </Field>

              <div className="border-t border-sand-200 pt-6">
                <p className="mb-3 text-[0.8125rem] font-semibold text-ink-700">
                  Your details
                </p>
                {owner ? (
                  <div className="rounded-lg border border-sand-200 bg-sand-50 px-4 py-3.5 text-[0.8125rem] text-ink-500">
                    Submitting as{" "}
                    <span className="font-semibold text-brand-900">{owner.name}</span> ·{" "}
                    {owner.email} · {owner.phone}. This listing will appear in your
                    dashboard.
                  </div>
                ) : (
                  <>
                    <Grid>
                      <Field label="Full name" name="name" required error={errors.name}>
                        <Input
                          name="name"
                          required
                          autoComplete="name"
                          placeholder="Your name"
                          error={errors.name}
                        />
                      </Field>
                      <Field label="Company" name="company">
                        <Input
                          name="company"
                          autoComplete="organization"
                          placeholder="Optional"
                        />
                      </Field>
                      <Field label="Phone" name="phone" required error={errors.phone}>
                        <Input
                          name="phone"
                          type="tel"
                          required
                          autoComplete="tel"
                          placeholder="+91 98XXX XXXXX"
                          error={errors.phone}
                        />
                      </Field>
                      <Field label="Email" name="email" required error={errors.email}>
                        <Input
                          name="email"
                          type="email"
                          required
                          autoComplete="email"
                          placeholder="you@company.com"
                          error={errors.email}
                        />
                      </Field>
                    </Grid>
                    <p className="mt-3 text-[0.75rem] text-ink-300">
                      Have an owner account?{" "}
                      <a
                        href="/login?next=/list-your-property"
                        className="font-semibold text-brand-700 underline underline-offset-4"
                      >
                        Log in
                      </a>{" "}
                      to track this submission from your dashboard.
                    </p>
                  </>
                )}
              </div>

              <div className="border-t border-sand-200 pt-6">
                <Consent error={errors.consent} />
              </div>
            </Step>
          </div>

          {clientError || (state && !state.ok) ? (
            <p
              role="alert"
              className="mt-6 rounded-lg border border-clay-100 bg-clay-50 px-4 py-3 text-[0.8125rem] font-medium text-clay-700"
            >
              {clientError ?? state?.message}
            </p>
          ) : null}

          {/* Step controls. The submit button exists only on the last step, so
              Enter anywhere earlier advances rather than submits a part-filled
              listing. */}
          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-sand-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => goTo(step - 1)}
                  className="rounded-lg border border-sand-300 bg-white px-5 py-2.5 text-sm font-semibold text-brand-900 transition-colors hover:bg-sand-100"
                >
                  Back
                </button>
              ) : null}
              <p className="text-[0.75rem] text-ink-300">
                {step === last
                  ? "Nothing publishes until we verify your documents."
                  : `${STEPS.length - step - 1} step${
                      STEPS.length - step - 1 === 1 ? "" : "s"
                    } remaining`}
              </p>
            </div>

            {step === last ? (
              <Button type="submit" size="lg" disabled={pending} arrow={!pending}>
                {pending ? "Uploading & submitting…" : "Submit for review"}
              </Button>
            ) : (
              <Button type="button" size="lg" onClick={onContinue} arrow>
                Continue
              </Button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}

/** Vertical progress rail on desktop, a compact meter on small screens. */
function StepRail({
  current,
  onSelect,
}: {
  current: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="lg:border-r lg:border-sand-200 lg:pr-6">
      {/* Mobile: a single bar plus the current label — a six-item rail would
          eat the viewport before the first question. */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between text-[0.75rem] font-semibold text-ink-500">
          <span>
            {STEPS[current].title}
            <span className="ml-2 font-normal text-ink-300 tnum">
              {current + 1}/{STEPS.length}
            </span>
          </span>
          <span className="text-ink-300 tnum">
            {Math.round(((current + 1) / STEPS.length) * 100)}%
          </span>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-sand-200">
          <div
            className="h-full bg-brand-600 transition-[width] duration-300"
            style={{ width: `${((current + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <ol className="hidden lg:block">
        {STEPS.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={s.title} className="relative pb-6 last:pb-0">
              {i < STEPS.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={`absolute left-[0.6875rem] top-6 h-full w-px ${
                    done ? "bg-brand-600" : "bg-sand-200"
                  }`}
                />
              ) : null}
              <button
                type="button"
                // Earlier steps stay reachable; later ones are gated by the
                // Continue button so validation cannot be skipped.
                onClick={() => (i <= current ? onSelect(i) : undefined)}
                aria-current={active ? "step" : undefined}
                disabled={i > current}
                className="group relative flex items-start gap-3 text-left disabled:cursor-default"
              >
                <span
                  className={`grid h-[1.375rem] w-[1.375rem] shrink-0 place-items-center rounded-full border text-[0.6875rem] font-bold tnum ${
                    done
                      ? "border-brand-600 bg-brand-600 text-white"
                      : active
                        ? "border-brand-600 bg-white text-brand-700"
                        : "border-sand-300 bg-white text-ink-300"
                  }`}
                >
                  {done ? (
                    <svg
                      viewBox="0 0 16 16"
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m3.5 8.5 3 3 6-6.5" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </span>
                <span
                  className={`pt-0.5 text-[0.8125rem] font-semibold ${
                    active
                      ? "text-brand-900"
                      : done
                        ? "text-ink-500 group-hover:text-brand-800"
                        : "text-ink-300"
                  }`}
                >
                  {s.title}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/**
 * One step. Kept in the DOM when inactive — `hidden` fields still submit, so
 * the payload is complete regardless of which step is on screen.
 */
function Step({
  index,
  current,
  register,
  label,
  children,
}: {
  index: number;
  current: number;
  /** Hands the element back to the form, which owns the step registry. */
  register: (index: number, node: HTMLFieldSetElement | null) => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <fieldset
      ref={(node) => register(index, node)}
      hidden={index !== current}
      className="space-y-4"
    >
      <legend className="sr-only">{label}</legend>
      {children}
    </fieldset>
  );
}

function Grid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
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
      <p className="mb-2.5 text-[0.8125rem] font-semibold text-ink-700">{legend}</p>
      <div className="grid gap-x-4 gap-y-2.5 sm:grid-cols-2">
        {options.map((option) => (
          <label
            key={option}
            className="flex cursor-pointer items-center gap-2.5 text-[0.8125rem] text-ink-500"
          >
            <input type="checkbox" name={name} value={option} className="control-box" />
            {option}
          </label>
        ))}
      </div>
      {hint ? (
        <p className="mt-2.5 text-[0.75rem] leading-relaxed text-ink-300">{hint}</p>
      ) : null}
    </div>
  );
}
