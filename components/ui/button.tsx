import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "light";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight " +
  "transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] disabled:cursor-not-allowed disabled:opacity-55";

const variants: Record<Variant, string> = {
  primary:
    "bg-clay-500 text-white shadow-[0_10px_24px_-12px_rgba(224,101,58,0.9)] hover:bg-clay-600 hover:shadow-[0_16px_34px_-14px_rgba(224,101,58,0.95)] active:bg-clay-700",
  secondary:
    "bg-brand-900 text-sand-50 hover:bg-brand-800 shadow-[0_10px_24px_-14px_rgba(12,51,48,0.9)]",
  ghost:
    "border border-brand-900/15 bg-transparent text-brand-900 hover:border-brand-900/35 hover:bg-brand-900/5",
  light:
    "bg-white text-brand-900 shadow-soft hover:bg-sand-100",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-[0.8125rem]",
  md: "px-6 py-3 text-sm",
  lg: "px-7 py-3.5 text-[0.9375rem]",
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
