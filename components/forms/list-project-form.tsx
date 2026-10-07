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
import {
  MediaUploader,
  completedAssets,
  isUploading,
  newDraftRef,
  type MediaItem,
} from "@/components/ui/media-uploader";
import { MAX_FLOOR_PLANS, MAX_PHOTOS } from "@/lib/media";
import {
  AMENITY_OPTIONS,
  BHK_OPTIONS,
  FURNISHING_BY_SEGMENT,
  FURNISHING_LABEL,
  MICRO_MARKETS,
  OWNER_DOCUMENTS,
  PROJECT_CATEGORIES,
  SEGMENTS,
  TENANCY_STATUSES,
  ZONES,
  isLandType,
  reraRequired,
  typesInSegment,
} from "@/lib/data/taxonomy";
import { submitPropertyListing } from "@/lib/actions";
import { formatINR } from "@/lib/format";
import type { LeadSubmission, PropertySegment } from "@/lib/types";

export interface ListingAccount {
  name: string;
  email: string;
  phone: string;
  accountType: "owner" | "broker" | "developer";
}

/**
 * One screen, about a dozen controls.
 *
 * The six-tab version this replaces asked for roughly forty fields across a
 * staged wizard. Most listers are not property professionals — they stalled on
 * "listing title", guessed at "handover condition" and abandoned somewhere
 * around step four. So:
 *
 *  - The title is composed server-side from type + configuration + building +
 *    locality. Nobody is asked to write marketing copy to get started.
 *  - Carpet area, floors, deposit, amenities and the rest moved into one
 *    optional, collapsed section. Nothing was removed from the schema.
 *  - Choosing "New project (under construction)" reveals the RERA field and
 *    makes it required — the one conditional rule on the form.
 *  - The description is optional. A blank one is filled with a generated
 *    summary and the desk writes the real copy on review.
 */
export function ListProjectForm({ account }: { account: ListingAccount }) {
  const [state, action, pending] = useActionState<LeadSubmission | null, FormData>(
    submitPropertyListing,
    null,
  );
  const [dismissed, setDismissed] = useState<LeadSubmission | null>(null);
  const [showInvalid, setShowInvalid] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  const [segment, setSegment] = useState<PropertySegment>("residential");
  const [type, setType] = useState("apartment");
  const [category, setCategory] = useState("");
  const [purpose, setPurpose] = useState("");
  const [price, setPrice] = useState("");
  const [showMore, setShowMore] = useState(false);

  const [photos, setPhotos] = useState<MediaItem[]>([]);
  const [plans, setPlans] = useState<MediaItem[]>([]);
  // Groups this submission's files in one Cloudinary draft folder until the
  // listing row exists and they can be filed under the property.
  const [draftRef] = useState(newDraftRef);

  const formRef = useRef<HTMLFormElement>(null);

  const errors = state?.fieldErrors ?? {};
  const residential = segment === "residential";
  const land = isLandType(type);
  const needsRera = reraRequired(category);
  const wantsSale = purpose === "buy";
  const wantsLease = purpose === "lease";
  const priceValue = Number(price.replace(/[₹,\s]/g, ""));

  /** Switching segment invalidates the type, so it resets to that segment's
   *  first option rather than leaving an impossible pair selected. */
  function switchSegment(next: PropertySegment) {
    setSegment(next);
    setType(typesInSegment(next)[0].value);
  }

  function checkMedia(): string | null {
    if (isUploading(photos, plans)) {
      return "Your photographs are still uploading. They finish in a moment.";
    }
    if ([...photos, ...plans].some((i) => i.status === "error")) {
      return "Some files didn't upload. Remove or replace the ones marked in red.";
    }
    if (completedAssets(photos).length === 0) {
      return "Add at least one photograph.";
    }
    return null;
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    // Submitting through the `action` prop would reset every field after a
    // validation error. Dispatching manually keeps what the lister typed, and
    // lets the uploaded media ride along.
    event.preventDefault();
    setClientError(null);

    const form = event.currentTarget;
    const invalidControl = Array.from(
      form.querySelectorAll<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >("input, select, textarea"),
    ).find((control) => !control.checkValidity());

    if (invalidControl) {
      setShowInvalid(true);
      setClientError("Some required details are missing — they are marked below.");
      invalidControl.focus();
      invalidControl.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const mediaIssue = checkMedia();
    if (mediaIssue) {
      setClientError(mediaIssue);
      return;
    }

    const data = new FormData(form);
    // Photographs and plans are already on Cloudinary; only their identifiers
    // travel with the form.
    data.set(
      "media",
      JSON.stringify([...completedAssets(photos), ...completedAssets(plans)]),
    );
    data.set("draft_ref", draftRef);
    startTransition(() => action(data));
  }

  function reset() {
    setPhotos([]);
    setPlans([]);
    setCategory("");
    setPurpose("");
    setPrice("");
    setShowMore(false);
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
      className={`scroll-mt-28 space-y-6 ${showInvalid ? "validate-visible" : ""}`}
    >
      {/* ------------------------------------------- 1. Residential or not */}
      <fieldset>
        <legend className="mb-2 text-[0.8125rem] font-semibold text-ink-700">
          What are you listing?
          <span aria-hidden="true" className="ml-0.5 text-clay-600">
            *
          </span>
        </legend>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {SEGMENTS.map((s) => (
            <label
              key={s.value}
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-sand-300 bg-white p-4 transition-colors hover:bg-sand-50 has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50"
            >
              <input
                type="radio"
                name="segment"
                value={s.value}
                checked={segment === s.value}
                onChange={() => switchSegment(s.value)}
                className="control-box mt-0.5 rounded-full"
              />
              <span className="min-w-0">
                <span className="block text-[0.875rem] font-semibold tracking-tight text-brand-900">
                  {s.label}
                </span>
                <span className="mt-1 block text-[0.75rem] leading-relaxed text-ink-500">
                  {s.blurb}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* ----------------------------------------- 2. Category, type, deal */}
      <Grid>
        <Field
          label="Category"
          name="category"
          required
          error={errors.category}
          hint={
            PROJECT_CATEGORIES.find((c) => c.value === category)?.blurb ??
            "This is what buyers filter on first."
          }
        >
          <Select
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            error={errors.category}
          >
            <option value="" disabled>
              Select a category
            </option>
            {PROJECT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label={residential ? "Property type" : "Asset type"}
          name="property_type"
          required
          error={errors.property_type}
        >
          <Select
            name="property_type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
            error={errors.property_type}
          >
            {typesInSegment(segment).map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </Field>
      </Grid>

      {/* The one conditional rule on this form: a new project under
          construction cannot be listed without its RERA registration. */}
      {needsRera ? (
        <div className="rounded-lg border border-brand-200 bg-brand-50/60 p-4 sm:p-5">
          <p className="text-[0.8125rem] font-semibold text-brand-900">
            RERA registration
          </p>
          <p className="mt-1 text-[0.75rem] leading-relaxed text-ink-500">
            An under-construction project must be registered with MahaRERA
            before it can be advertised. We publish the number on the listing.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              label="MahaRERA number"
              name="rera_number"
              required
              error={errors.rera_number}
              hint="As registered, e.g. P99000051284."
            >
              {/* `Input` spreads props after its own className, so passing
                  one here replaces the base classes — the error border has to
                  be re-stated or it is silently dropped. */}
              <Input
                name="rera_number"
                required
                maxLength={30}
                placeholder="P99000051284"
                error={errors.rera_number}
                className={`field-input uppercase ${
                  errors.rera_number ? "border-clay-500" : ""
                }`}
              />
            </Field>
            <Field
              label="Committed possession"
              name="possession_by"
              required
              error={errors.possession_by}
              hint="The handover date in the agreement."
            >
              <Input
                name="possession_by"
                type="date"
                required
                error={errors.possession_by}
              />
            </Field>
          </div>
        </div>
      ) : null}

      <Grid>
        <Field
          label={residential ? "Sell or rent out?" : "Sell or lease?"}
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
            <option value="buy">{residential ? "Sell" : "Outright sale"}</option>
            <option value="lease">{residential ? "Rent out" : "Lease"}</option>
          </Select>
        </Field>

        <Field
          label="Location"
          name="market"
          required
          error={errors.market}
          hint="We cover Mira Road to Dahanu Road on the Western line."
        >
          <Select name="market" defaultValue="" required error={errors.market}>
            <option value="" disabled>
              Select the station area
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
      </Grid>

      {/* --------------------------------------- 3. Building, size, config */}
      <Grid>
        <Field
          label={land ? "Layout / survey reference" : "Building or project name"}
          name="building_name"
          required
          error={errors.building_name}
          hint="This becomes part of the listing title."
        >
          <Input
            name="building_name"
            required
            maxLength={120}
            placeholder={land ? "e.g. Survey 118/2, Saphale East" : "e.g. Sunrise Heights"}
            error={errors.building_name}
          />
        </Field>

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
            placeholder="e.g. 1,050"
            error={errors.area_sqft}
          />
        </Field>

        {residential && !land ? (
          <Field
            label="Configuration"
            name="bedrooms"
            required
            error={errors.bedrooms}
          >
            <Select name="bedrooms" defaultValue="" required error={errors.bedrooms}>
              <option value="" disabled>
                Select
              </option>
              {BHK_OPTIONS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </Select>
          </Field>
        ) : null}

        {wantsSale ? (
          <Field
            label="Expected price (₹)"
            name="price"
            error={errors.price}
            hint={
              priceValue >= 10_000
                ? `= ${formatINR(priceValue)}. Leave blank for price on request.`
                : "Leave blank for price on request."
            }
          >
            <Input
              name="price"
              inputMode="numeric"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 82,00,000"
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
              placeholder="e.g. 24"
              error={errors.rent_psf}
            />
          </Field>
        ) : null}
      </Grid>

      {/* ----------------------------------------------- 4. Photographs */}
      <MediaUploader
        kind="image"
        label="Photographs"
        required
        showCover
        draftRef={draftRef}
        value={photos}
        onChange={setPhotos}
        error={errors.photos}
        hint={`At least one, up to ${MAX_PHOTOS}. The first is the cover. Phone photographs are fine — they are resized for you.`}
      />

      {/* ------------------------------------------- 5. Optional detail */}
      <div className="rounded-lg border border-sand-200 bg-sand-50/60">
        <button
          type="button"
          onClick={() => setShowMore(!showMore)}
          aria-expanded={showMore}
          className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left sm:px-5"
        >
          <span>
            <span className="block text-[0.8125rem] font-semibold text-brand-900">
              Add more details
            </span>
            <span className="mt-0.5 block text-[0.75rem] text-ink-500">
              Optional. Our team fills in anything you skip before the listing
              goes live.
            </span>
          </span>
          <svg
            viewBox="0 0 16 16"
            aria-hidden="true"
            className={`h-4 w-4 shrink-0 text-ink-500 transition-transform ${
              showMore ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m3.5 6 4.5 4.5L12.5 6" />
          </svg>
        </button>

        {/* Kept mounted so nothing typed here is lost on collapse — hidden
            inputs still submit. */}
        <div hidden={!showMore} className="space-y-4 border-t border-sand-200 p-4 sm:p-5">
          <Grid>
            <Field label="Address or landmark" name="address">
              <Input
                name="address"
                maxLength={240}
                autoComplete="street-address"
                placeholder="e.g. Beverly Park Road, near Shanti Park"
              />
            </Field>
            <Field label="PIN code" name="pincode" error={errors.pincode}>
              <Input
                name="pincode"
                inputMode="numeric"
                maxLength={6}
                autoComplete="postal-code"
                placeholder="401107"
                error={errors.pincode}
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
                placeholder="e.g. 745"
                error={errors.carpet_area_sqft}
              />
            </Field>

            <Field
              label={residential ? "Handover condition" : "Fit-out condition"}
              name="furnishing"
            >
              <Select
                name="furnishing"
                defaultValue={FURNISHING_BY_SEGMENT[segment][0]}
                key={segment}
              >
                {FURNISHING_BY_SEGMENT[segment].map((f) => (
                  <option key={f} value={f}>
                    {FURNISHING_LABEL[f]}
                  </option>
                ))}
              </Select>
            </Field>

            {!land ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Floor" name="floor" hint="e.g. 7th, Ground">
                    <Input name="floor" maxLength={40} placeholder="7th" />
                  </Field>
                  <Field
                    label="Total floors"
                    name="total_floors"
                    error={errors.total_floors}
                  >
                    <Input
                      name="total_floors"
                      inputMode="numeric"
                      placeholder="14"
                      error={errors.total_floors}
                    />
                  </Field>
                </div>

                {residential ? (
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Bathrooms" name="bathrooms" error={errors.bathrooms}>
                      <Input
                        name="bathrooms"
                        inputMode="numeric"
                        placeholder="2"
                        error={errors.bathrooms}
                      />
                    </Field>
                    <Field label="Balconies" name="balconies" error={errors.balconies}>
                      <Input
                        name="balconies"
                        inputMode="numeric"
                        placeholder="1"
                        error={errors.balconies}
                      />
                    </Field>
                  </div>
                ) : null}

                <Field
                  label="Age of property (years)"
                  name="property_age_years"
                  error={errors.property_age_years}
                  hint="Leave blank for a new project."
                >
                  <Input
                    name="property_age_years"
                    inputMode="numeric"
                    placeholder="e.g. 8"
                    error={errors.property_age_years}
                  />
                </Field>

                <Field label="Parking slots" name="parking_slots" error={errors.parking_slots}>
                  <Input
                    name="parking_slots"
                    inputMode="numeric"
                    placeholder="e.g. 1"
                    error={errors.parking_slots}
                  />
                </Field>
              </>
            ) : (
              <Field
                label="Zoning / permitted use"
                name="zoning"
                hint="e.g. NA — Residential (R-1), MIDC industrial."
              >
                <Input name="zoning" maxLength={120} placeholder="e.g. NA — Residential (R-1)" />
              </Field>
            )}

            {wantsLease ? (
              <>
                <Field
                  label="Security deposit (months)"
                  name="security_deposit_months"
                  error={errors.security_deposit_months}
                >
                  <Input
                    name="security_deposit_months"
                    inputMode="numeric"
                    placeholder="e.g. 3"
                    error={errors.security_deposit_months}
                  />
                </Field>
                <Field
                  label="Maintenance (₹ / sq.ft. / month)"
                  name="maintenance_psf"
                  error={errors.maintenance_psf}
                >
                  <Input
                    name="maintenance_psf"
                    inputMode="decimal"
                    placeholder="e.g. 2.5"
                    error={errors.maintenance_psf}
                  />
                </Field>
              </>
            ) : null}

            <Field
              label="Current occupancy"
              name="tenancy_status"
              hint="Shared with our team only, never published."
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
          </Grid>

          <CheckboxGroup legend="Amenities" name="amenities" options={AMENITY_OPTIONS} />

          <Field label="Other amenities" name="amenities_other" hint="Comma separated.">
            <Input
              name="amenities_other"
              maxLength={400}
              placeholder="e.g. EV charging, temple nearby"
            />
          </Field>

          <MediaUploader
            kind="floor_plan"
            label="Floor plan"
            draftRef={draftRef}
            value={plans}
            onChange={setPlans}
            error={errors.floor_plans}
            hint={`Optional, up to ${MAX_FLOOR_PLANS}. A photograph of the printed plan works.`}
          />

          <CheckboxGroup
            legend="Documents you hold"
            hint="Not uploaded here — our team collects these on the verification call."
            name="documents"
            options={OWNER_DOCUMENTS}
          />

          <Field
            label="Private notes for our team"
            name="notes"
            hint="Never published. Price flexibility, approvals, anything we should know."
          >
            <Textarea
              name="notes"
              rows={3}
              maxLength={2000}
              placeholder="Negotiable by about 3%. Society NOC already in hand…"
            />
          </Field>
        </div>
      </div>

      {/* --------------------------------------- 6. Description & submit */}
      <Field
        label="Anything buyers should know?"
        name="description"
        error={errors.description}
        hint="Optional. A line or two is plenty — we write the full listing copy for you."
      >
        <Textarea
          name="description"
          rows={4}
          maxLength={5000}
          placeholder="Corner flat, cross-ventilated, eight minutes' walk from the station. Sold with the wardrobes and the fitted kitchen."
          error={errors.description}
        />
      </Field>

      <div className="rounded-lg border border-sand-200 bg-sand-50 px-4 py-3.5 text-[0.8125rem] text-ink-500">
        Listing as{" "}
        <span className="font-semibold text-brand-900">{account.name}</span> ·{" "}
        {account.phone} · {account.email}. Enquiries on this project will appear
        under <span className="font-semibold text-brand-900">Leads</span> in
        your dashboard.
      </div>

      <Consent error={errors.consent} />

      {clientError || (state && !state.ok) ? (
        <p
          role="alert"
          className="rounded-lg border border-clay-100 bg-clay-50 px-4 py-3 text-[0.8125rem] font-medium text-clay-700"
        >
          {clientError ?? state?.message}
        </p>
      ) : null}

      <div className="flex flex-col-reverse items-start gap-3 border-t border-sand-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[0.75rem] leading-relaxed text-ink-300">
          Nothing publishes until our team verifies the details.
        </p>
        <Button type="submit" size="lg" loading={pending} arrow>
          {pending ? "Submitting…" : "Submit for verification"}
        </Button>
      </div>
    </form>
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
