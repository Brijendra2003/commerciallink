import Link from "next/link";

export function Logo({
  tone = "dark",
  className = "",
}: {
  tone?: "dark" | "light";
  className?: string;
}) {
  const word = tone === "light" ? "text-sand-50" : "text-brand-900";
  const sub = tone === "light" ? "text-sand-200/60" : "text-ink-300";

  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2.5 ${className}`}
      aria-label="CommercialLink — home"
    >
      <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-[0.7rem] bg-brand-800 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-rotate-6">
        <svg viewBox="0 0 24 24" className="h-[1.15rem] w-[1.15rem]" aria-hidden="true">
          <path
            d="M4 20V9.2L11 5l7 4.2V20"
            fill="none"
            stroke="var(--color-clay-300)"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 20v-5.4h4.6V20"
            fill="none"
            stroke="var(--color-sand-50)"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className={`font-display text-[1.05rem] tracking-[-0.015em] ${word}`}>
          Commercial<span className="italic text-clay-500">Link</span>
        </span>
        <span className={`mt-1 text-[0.5625rem] font-semibold uppercase tracking-[0.22em] ${sub}`}>
          Advisory Desk
        </span>
      </span>
    </Link>
  );
}
