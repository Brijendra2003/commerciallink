/**
 * Organic section dividers. The reference boards never butt two colour fields
 * together with a straight line — each band flows into the next on a curve.
 * `fill` takes any CSS colour; these render as a block, not an overlay.
 */

export function WaveTop({
  fill,
  className = "",
}: {
  fill: string;
  className?: string;
}) {
  return (
    <div className={`pointer-events-none -mb-px w-full ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 1440 96"
        preserveAspectRatio="none"
        className="block h-12 w-full sm:h-16 lg:h-24"
      >
        <path
          d="M0 96h1440V26c-160 34-330 50-520 44C700 63 520 24 340 12 232 5 116 10 0 30Z"
          fill={fill}
        />
      </svg>
    </div>
  );
}

export function WaveBottom({
  fill,
  className = "",
}: {
  fill: string;
  className?: string;
}) {
  return (
    <div className={`pointer-events-none -mt-px w-full ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 1440 96"
        preserveAspectRatio="none"
        className="block h-12 w-full sm:h-16 lg:h-24"
      >
        <path
          d="M0 0h1440v66c-140-32-300-44-480-36-210 9-400 52-610 60C230 96 116 84 0 58Z"
          fill={fill}
        />
      </svg>
    </div>
  );
}

/** Soft blurred colour field used behind hero and CTA bands. */
export function Blob({
  className = "",
  color = "var(--color-clay-100)",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute rounded-full blur-3xl ${className}`}
      style={{ background: color }}
    />
  );
}
