import type { PropertyType } from "@/lib/types";

type IconProps = { className?: string };

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Svg({
  className = "h-5 w-5",
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} {...stroke}>
      {children}
    </svg>
  );
}

export function OfficeIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 21h18M5 21V5.5A1.5 1.5 0 0 1 6.5 4h7A1.5 1.5 0 0 1 15 5.5V21M15 10h3.5A1.5 1.5 0 0 1 20 11.5V21" />
      <path d="M8 8h4M8 12h4M8 16h4M17.5 14h1M17.5 17.5h1" />
    </Svg>
  );
}

export function RetailIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 9.5 5.4 5A1.5 1.5 0 0 1 6.8 4h10.4a1.5 1.5 0 0 1 1.4 1L20 9.5" />
      <path d="M4 9.5h16M4 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0M5.5 12v8.5h13V12" />
      <path d="M9.5 20.5V15h5v5.5" />
    </Svg>
  );
}

export function WarehouseIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M2.5 10.5 12 5l9.5 5.5V21H2.5z" />
      <path d="M7 21v-6.5h10V21M7 17.5h10" />
    </Svg>
  );
}

export function IndustrialIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 21h18M4 21V11l5 3V11l5 3V8l6 3.5V21" />
      <path d="M4 11V6.5h2.5V11" />
    </Svg>
  );
}

export function LandIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="m3 17 4.5-2.5L12 17l4.5-2.5L21 17" />
      <path d="m3 20.5 4.5-2.5L12 20.5l4.5-2.5L21 20.5M12 3.5v7M12 3.5 9 6M12 3.5 15 6" />
    </Svg>
  );
}

export function CoworkingIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="8.5" cy="7" r="2.5" />
      <circle cx="16" cy="8.5" r="2" />
      <path d="M3.5 19v-1.5a5 5 0 0 1 5-5h0a5 5 0 0 1 5 5V19M15 13.2a4 4 0 0 1 5.5 3.7V19" />
    </Svg>
  );
}

/* ---- Residential ---------------------------------------------------- */

export function ApartmentIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 21h18M5.5 21V4.5A1.5 1.5 0 0 1 7 3h7a1.5 1.5 0 0 1 1.5 1.5V21" />
      <path d="M8.5 6.5h1.5M12 6.5h1.5M8.5 10h1.5M12 10h1.5M8.5 13.5h1.5M12 13.5h1.5M9.75 21v-3.5h1.5V21" />
      <path d="M15.5 11h3A1.5 1.5 0 0 1 20 12.5V21M17.5 14.5h1M17.5 17.5h1" />
    </Svg>
  );
}

export function StudioIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="1.5" />
      <path d="M3.5 12.5h10M13.5 5.5v13M16 9h2M16 15h2" />
    </Svg>
  );
}

export function PenthouseIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 21h18M6 21V9.5h12V21" />
      <path d="M6 9.5V6h8.5v3.5M9 13h2.5M14 13h2.5M9 17h2.5M14 17h2.5" />
      <path d="M18 6.5h3v3" />
    </Svg>
  );
}

export function VillaIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M2.5 11 12 4l9.5 7" />
      <path d="M5 9.5V21h14V9.5M9.5 21v-6h5v6M8 12.5h2M14 12.5h2" />
    </Svg>
  );
}

export function RowHouseIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M2 21h20M3 21v-9l4-3 4 3v9M13 21v-9l4-3 4 3v9" />
      <path d="M5.5 21v-4h3v4M15.5 21v-4h3v4" />
    </Svg>
  );
}

export function PlotIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3.5 7.5 12 4.5l8.5 3v9L12 19.5l-8.5-3z" />
      <path d="M12 4.5v15M3.5 7.5 12 10.5l8.5-3" />
    </Svg>
  );
}

export const PROPERTY_TYPE_ICON: Record<
  PropertyType,
  (p: IconProps) => React.JSX.Element
> = {
  // Residential
  apartment: ApartmentIcon,
  studio: StudioIcon,
  penthouse: PenthouseIcon,
  villa: VillaIcon,
  row_house: RowHouseIcon,
  // A bungalow reads the same as a villa at 20 px; a separate glyph would be
  // distinction without difference.
  bungalow: VillaIcon,
  plot: PlotIcon,
  // Commercial
  office: OfficeIcon,
  retail: RetailIcon,
  warehouse: WarehouseIcon,
  industrial: IndustrialIcon,
  land: LandIcon,
  coworking: CoworkingIcon,
};

export function PinIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 21s6.5-5.4 6.5-10.2A6.5 6.5 0 0 0 5.5 10.8C5.5 15.6 12 21 12 21Z" />
      <circle cx="12" cy="10.5" r="2.4" />
    </Svg>
  );
}

export function AreaIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
      <path d="M8 3.5v3M16 17.5v3M3.5 16h3M17.5 8h3" />
    </Svg>
  );
}

export function ShieldIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 3 5 5.8v5.4c0 4.3 2.9 8.3 7 9.8 4.1-1.5 7-5.5 7-9.8V5.8Z" />
      <path d="m9 12 2.2 2.2L15.4 10" />
    </Svg>
  );
}

export function CheckIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="m4.5 12.5 4.5 4.5L19.5 6.5" />
    </Svg>
  );
}

export function SearchIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </Svg>
  );
}

export function PhoneIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6.2 3.5h2.9l1.5 3.7-1.9 1.4a11 11 0 0 0 4.7 4.7l1.4-1.9 3.7 1.5v2.9a2 2 0 0 1-2.2 2A15.6 15.6 0 0 1 4.2 5.7a2 2 0 0 1 2-2.2Z" />
    </Svg>
  );
}

export function MailIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="m3.6 7 8.4 6 8.4-6" />
    </Svg>
  );
}

export function WhatsAppIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3.5 20.5 4.9 16A8 8 0 1 1 8 19.1Z" />
      <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5.6 0 1-.5 1-1.1l-1.6-.8-.9.9a5.4 5.4 0 0 1-2.5-2.5l.9-.9-.8-1.6c-.6 0-1.1.4-1.1 1Z" />
    </Svg>
  );
}

export function DocumentIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M13.5 3.5H7a1.5 1.5 0 0 0-1.5 1.5v14A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5V8.5Z" />
      <path d="M13.5 3.5v5h5M9 13h6M9 16.5h4" />
    </Svg>
  );
}

export function CalendarIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 9.5h17M8 3.5V6.5M16 3.5V6.5" />
    </Svg>
  );
}

export function QuoteMark({ className = "h-7 w-7" }: IconProps) {
  return (
    <svg viewBox="0 0 32 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M0 24V13.6C0 6.4 3.9 1.5 11.2 0l1.4 3.6C8 5 5.7 7.5 5.5 11.2H12V24Zm19.4 0V13.6C19.4 6.4 23.3 1.5 30.6 0L32 3.6c-4.6 1.4-6.9 3.9-7.1 7.6h6.5V24Z" />
    </svg>
  );
}
