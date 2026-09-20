import type {
  DealStatus,
  KycStatus,
  LeadStatus,
  RequirementStatus,
} from "@/lib/admin-types";
import type { PropertyStatus } from "@/lib/types";
import { LEAD_STATUS_LABEL } from "@/lib/data/crm";

type Tone = "good" | "warning" | "serious" | "critical" | "neutral" | "active";

/**
 * Status colour is a reserved channel — it never doubles as series identity.
 * Every badge pairs the colour with a glyph and a label, so meaning never
 * rests on hue alone (which is also what keeps the sub-3:1 light-surface
 * steps legal).
 */
const TONES: Record<Tone, { dot: string; text: string; bg: string; glyph: string }> = {
  good: {
    dot: "var(--color-status-good)",
    text: "#125236",
    bg: "rgba(23,115,74,0.10)",
    glyph: "✓",
  },
  warning: {
    dot: "var(--color-status-warning)",
    text: "#7d5611",
    bg: "rgba(169,118,26,0.14)",
    glyph: "◔",
  },
  serious: {
    dot: "var(--color-status-serious)",
    text: "#8c4116",
    bg: "rgba(180,85,29,0.12)",
    glyph: "!",
  },
  critical: {
    dot: "var(--color-status-critical)",
    text: "#8f1a26",
    bg: "rgba(176,32,47,0.10)",
    glyph: "×",
  },
  active: {
    dot: "var(--color-brand-600)",
    text: "#17406f",
    bg: "rgba(29,84,144,0.10)",
    glyph: "→",
  },
  neutral: {
    dot: "var(--color-ink-300)",
    text: "#52627a",
    bg: "rgba(82,98,122,0.10)",
    glyph: "·",
  },
};

function Badge({ tone, label }: { tone: Tone; label: string }) {
  const t = TONES[tone];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[0.6875rem] font-semibold tracking-tight"
      style={{ background: t.bg, color: t.text }}
    >
      <span aria-hidden="true" style={{ color: t.dot }}>
        {t.glyph}
      </span>
      {label}
    </span>
  );
}

const LEAD_TONE: Record<LeadStatus, Tone> = {
  new: "warning",
  contacted: "active",
  qualified: "active",
  site_visit: "active",
  negotiation: "serious",
  won: "good",
  lost: "critical",
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return <Badge tone={LEAD_TONE[status]} label={LEAD_STATUS_LABEL[status]} />;
}

const PROPERTY_LABEL: Record<PropertyStatus, string> = {
  draft: "Draft",
  pending_review: "Pending review",
  published: "Published",
  archived: "Archived",
  sold: "Sold",
  leased: "Leased",
};

const PROPERTY_TONE: Record<PropertyStatus, Tone> = {
  draft: "neutral",
  pending_review: "warning",
  published: "good",
  archived: "neutral",
  sold: "active",
  leased: "active",
};

export function PropertyStatusBadge({ status }: { status: PropertyStatus }) {
  return <Badge tone={PROPERTY_TONE[status]} label={PROPERTY_LABEL[status]} />;
}

export function KycBadge({ status }: { status: KycStatus }) {
  const map: Record<KycStatus, { tone: Tone; label: string }> = {
    verified: { tone: "good", label: "KYC verified" },
    pending: { tone: "warning", label: "KYC pending" },
    rejected: { tone: "critical", label: "KYC rejected" },
  };
  return <Badge {...map[status]} />;
}

export function DealStatusBadge({ status }: { status: DealStatus }) {
  const map: Record<DealStatus, { tone: Tone; label: string }> = {
    in_progress: { tone: "active", label: "In progress" },
    won: { tone: "good", label: "Won" },
    lost: { tone: "critical", label: "Lost" },
  };
  return <Badge {...map[status]} />;
}

export function RequirementBadge({ status }: { status: RequirementStatus }) {
  const map: Record<RequirementStatus, { tone: Tone; label: string }> = {
    open: { tone: "warning", label: "Open" },
    matched: { tone: "active", label: "Matched" },
    closed: { tone: "neutral", label: "Closed" },
  };
  return <Badge {...map[status]} />;
}
