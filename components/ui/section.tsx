import type { ReactNode } from "react";

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1200px] px-5 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}

export function Kicker({
  children,
  tone = "brand",
  className = "",
}: {
  children: ReactNode;
  /** `clay` is kept for callers that predate the palette change. */
  tone?: "clay" | "brand" | "light";
  className?: string;
}) {
  const tones = {
    clay: "text-brand-600",
    brand: "text-brand-600",
    light: "text-brand-100",
  };
  return <p className={`kicker ${tones[tone]} ${className}`}>{children}</p>;
}

/**
 * Section heading. `accent` continues the title in the brand blue — a weight
 * and colour shift rather than the italic serif clause this replaced, which
 * read as editorial styling instead of a product.
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
        <Kicker tone={tone === "light" ? "light" : "brand"} className="mb-3">
          {kicker}
        </Kicker>
      ) : null}
      <h2
        className={`font-display text-[1.5rem] font-semibold leading-[1.18] tracking-[-0.02em] sm:text-[1.875rem] lg:text-[2.125rem] ${
          tone === "light" ? "text-white" : "text-brand-900"
        }`}
      >
        {title}
        {accent ? (
          <>
            {" "}
            <span className={tone === "light" ? "text-brand-100" : "text-brand-600"}>
              {accent}
            </span>
          </>
        ) : null}
      </h2>
      {lead ? (
        <p
          className={`mt-4 text-[0.9375rem] leading-relaxed ${
            tone === "light" ? "text-sand-200/75" : "text-ink-500"
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
    <section id={id} className={`py-14 sm:py-16 lg:py-20 ${className}`}>
      {children}
    </section>
  );
}
