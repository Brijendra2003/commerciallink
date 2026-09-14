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
    text: "#0a6b0a",
    bg: "rgba(12,163,12,0.10)",
    glyph: "✓",
  },
  warning: {
    dot: "var(--color-status-warning)",
    text: "#7a5300",
    bg: "rgba(250,178,25,0.16)",
    glyph: "◔",
  },
  serious: {
    dot: "var(--color-status-serious)",
    text: "#9b4520",
    bg: "rgba(236,131,90,0.16)",
    glyph: "!",
  },
  critical: {
    dot: "var(--color-status-critical)",
    text: "#a02020",
    bg: "rgba(208,59,59,0.12)",
    glyph: "×",
  },
  active: {
    dot: "var(--color-viz-series-1)",
    text: "#0d5e52",
    bg: "rgba(15,143,125,0.12)",
    glyph: "→",
  },
  neutral: {
    dot: "#8a8578",
    text: "#5a5548",
    bg: "rgba(138,133,120,0.12)",
    glyph: "·",
  },
};

function Badge({ tone, label }: { tone: Tone; label: string }) {
  const t = TONES[tone];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem] font-bold tracking-tight"
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
