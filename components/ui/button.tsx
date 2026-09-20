import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "light";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn inline-flex items-center justify-center gap-2 rounded-lg font-semibold " +
  "transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-55";

/**
 * One saturated blue carries every primary action. The dark navy is for
 * actions sitting on a light surface that must not compete with a primary,
 * and `light` is the inverse for use on navy bands.
 */
const variants: Record<Variant, string> = {
  primary: "bg-brand-700 text-white hover:bg-brand-800 active:bg-brand-900",
  secondary: "bg-brand-900 text-white hover:bg-brand-800",
  ghost:
    "border border-sand-300 bg-white text-brand-900 hover:border-ink-300 hover:bg-sand-100",
  light: "bg-white text-brand-900 hover:bg-sand-100",
};

const sizes: Record<Size, string> = {
  sm: "px-3.5 py-2 text-[0.8125rem]",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-[0.9375rem]",
};

function classes(variant: Variant, size: Size, className?: string) {
  return [base, variants[variant], sizes[size], className]
    .filter(Boolean)
    .join(" ");
}

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/btn:translate-x-0.5 ${className}`}
    >
      <path
        d="M2.5 8h11m0 0-4.2-4.2M13.5 8l-4.2 4.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface ButtonLinkProps extends Omit<ComponentProps<typeof Link>, "className"> {
  variant?: Variant;
  size?: Size;
  className?: string;
  arrow?: boolean;
  children: ReactNode;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  arrow = false,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={classes(variant, size, className)} {...props}>
      {children}
      {arrow ? <Arrow /> : null}
    </Link>
  );
}

interface ButtonProps extends ComponentProps<"button"> {
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  arrow = false,
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={classes(variant, size, className)} {...props}>
      {children}
      {arrow ? <Arrow /> : null}
    </button>
  );
}
