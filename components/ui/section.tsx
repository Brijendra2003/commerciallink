import type { ReactNode } from "react";

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1180px] px-5 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}

export function Kicker({
  children,
  tone = "clay",
  className = "",
}: {
  children: ReactNode;
  tone?: "clay" | "brand" | "light";
  className?: string;
}) {
  const tones = {
    clay: "text-clay-600",
    brand: "text-brand-600",
    light: "text-clay-300",
  };
  return (
    <p className={`kicker ${tones[tone]} ${className}`}>{children}</p>
  );
}

/**
 * Headline with an italic serif accent clause — the device every reference
 * board uses to keep a heading from reading as a plain label.
 */
export function SectionHeading({
  kicker,
  title,
  accent,
  lead,
  align = "left",
  tone = "dark",
  className = "",
}: {
  kicker?: string;
  title: string;
  accent?: string;
  lead?: string;
  align?: "left" | "center";
  tone?: "dark" | "light";
  className?: string;
}) {
  const centered = align === "center";
  return (
    <div
      className={[
        centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl",
        className,
      ].join(" ")}
    >
      {kicker ? (
        <Kicker tone={tone === "light" ? "light" : "clay"} className="mb-3">
          {kicker}
        </Kicker>
      ) : null}
      <h2
        className={`font-display text-[1.75rem] leading-[1.15] tracking-[-0.02em] sm:text-[2.25rem] lg:text-[2.6rem] ${
          tone === "light" ? "text-sand-50" : "text-brand-900"
        }`}
      >
        {title}
        {accent ? (
          <>
            {" "}
            <span
              className={`italic ${
                tone === "light" ? "text-clay-300" : "accent-underline text-brand-700"
              }`}
            >
              {accent}
            </span>
          </>
        ) : null}
      </h2>
      {lead ? (
        <p
          className={`mt-4 text-[0.9375rem] leading-relaxed sm:text-base ${
            tone === "light" ? "text-sand-200/80" : "text-ink-500"
          }`}
        >
          {lead}
        </p>
      ) : null}
    </div>
  );
}

export function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`py-16 sm:py-20 lg:py-24 ${className}`}>
      {children}
    </section>
  );
}
