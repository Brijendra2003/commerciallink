import Link from "next/link";

export function Logo({
  tone = "dark",
  className = "",
}: {
  tone?: "dark" | "light";
  className?: string;
}) {
  const word = tone === "light" ? "text-white" : "text-brand-900";
  const mark = tone === "light" ? "text-brand-100" : "text-brand-600";
  const sub = tone === "light" ? "text-sand-200/55" : "text-ink-300";

  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2.5 ${className}`}
      aria-label="CommercialLink — home"
    >
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded ${
          tone === "light" ? "bg-white/10" : "bg-brand-800"
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-[1.1rem] w-[1.1rem]" aria-hidden="true">
          <path
            d="M3.5 20.5V8.4L11 4.2l7.5 4.2v12.1"
            fill="none"
            stroke="#fff"
            strokeWidth="1.7"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />
          <path
            d="M8.6 20.5v-5.9h4.8v5.9"
            fill="none"
            stroke="var(--color-brand-100)"
            strokeWidth="1.7"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={`font-display text-[1.0625rem] font-semibold tracking-[-0.02em] ${word}`}
        >
          Commercial<span className={mark}>Link</span>
        </span>
        <span
          className={`mt-1 text-[0.5625rem] font-semibold uppercase tracking-[0.2em] ${sub}`}
        >
          Advisory
        </span>
      </span>
    </Link>
  );
}
