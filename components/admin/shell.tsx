"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Logo } from "@/components/site/logo";
import { signOut } from "@/lib/auth-actions";
import type { AdminSession } from "@/lib/auth";

const ROLE_LABEL = {
  super_admin: "Super admin",
  sales_exec: "Sales executive",
  content_editor: "Content editor",
} as const;

const NAV = [
  { href: "/admin", label: "Dashboard", exact: true, icon: "grid" },
  { href: "/admin/leads", label: "Leads", icon: "funnel", badge: "core" },
  { href: "/admin/requirements", label: "Requirements", icon: "clipboard" },
  { href: "/admin/properties", label: "Properties", icon: "building" },
  { href: "/admin/sales", label: "Sales", icon: "rupee" },
  { href: "/admin/owners", label: "Owners", icon: "users" },
  { href: "/admin/analytics", label: "Analytics", icon: "chart" },
  { href: "/admin/settings", label: "Users & Access", icon: "shield" },
] as const;

const PATHS: Record<string, string> = {
  grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  funnel: "M3.5 5h17l-6.5 7.5V20l-4-2.5v-5z",
  clipboard: "M9 4.5h6M8 6.5H6.5A1.5 1.5 0 0 0 5 8v11.5A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V8a1.5 1.5 0 0 0-1.5-1.5H16M9 3.5h6v3H9zM8.5 12h7M8.5 16h4",
  building: "M4 20V6.5L11 3l7 3.5V20M4 20h16M9 20v-5h4.5v5M8 9h2M14 9h2M8 12h2M14 12h2",
  rupee: "M7 4.5h10M7 8.5h10M15.5 4.5c0 3-2 4-5 4h-.5l7 11H14L7.5 8.5",
  users: "M8.5 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2.5 20v-1.5a6 6 0 0 1 12 0V20M15.5 6.2a3 3 0 0 1 0 5.6M17 13.5a5.5 5.5 0 0 1 4.5 5.4V20",
  chart: "M4 20h16M7 20v-6M11.5 20V8M16 20v-9M20.5 20V5",
  shield: "M12 3 5 5.8v5.4c0 4.3 2.9 8.3 7 9.8 4.1-1.5 7-5.5 7-9.8V5.8ZM9 12l2.2 2.2L15.4 10",
};

function Icon({ name, className = "h-4 w-4" }: { name: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

export function AdminShell({
  children,
  session,
}: {
  children: ReactNode;
  session: AdminSession;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const nav = (
    <nav aria-label="Admin sections" className="flex flex-1 flex-col">
      <ul className="space-y-0.5">
        {NAV.map((item) => {
          const active =
            "exact" in item && item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.8125rem] font-semibold transition-colors ${
                  active
                    ? "bg-brand-800 text-sand-50"
                    : "text-sand-200/65 hover:bg-white/6 hover:text-sand-50"
                }`}
              >
                <Icon
                  name={item.icon}
                  className={`h-4 w-4 shrink-0 ${active ? "text-brand-100" : ""}`}
                />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {"badge" in item && item.badge ? (
                  <span className="rounded bg-brand-600 px-1.5 py-0.5 text-[0.5625rem] font-bold uppercase tracking-wider text-white">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto space-y-3 pt-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-xl border border-sand-200/15 px-3 py-2.5 text-[0.75rem] font-semibold text-sand-200/70 transition-colors hover:border-sand-200/30 hover:text-sand-50"
        >
          <svg
            viewBox="0 0 16 16"
            className="h-3.5 w-3.5 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9.5 2.5h4v4M13.5 2.5 7 9M12 9.5v3a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3" />
          </svg>
          View public site
        </Link>

        <div className="rounded-xl bg-white/6 px-3 py-2.5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded bg-brand-600 text-[0.6875rem] font-bold text-white">
              {session.initials}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[0.75rem] font-bold text-sand-50">
                {session.name}
              </span>
              <span className="block text-[0.625rem] uppercase tracking-[0.1em] text-sand-200/50">
                {ROLE_LABEL[session.role]}
              </span>
            </span>
          </div>

          {session.demo ? (
            <p className="mt-2.5 border-t border-white/10 pt-2.5 text-[0.625rem] leading-relaxed text-brand-100">
              Demo mode — no Supabase credentials, so the panel is unlocked and
              reading mock data.
            </p>
          ) : (
            <form action={signOut} className="mt-2.5 border-t border-sand-200/12 pt-2.5">
              <button
                type="submit"
                className="w-full text-left text-[0.6875rem] font-semibold text-sand-200/60 transition-colors hover:text-white"
              >
                Sign out
              </button>
            </form>
          )}
        </div>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-sand-100 lg:pl-[15.5rem]">
      {/* Desktop rail. Fixed rather than sticky, and scrollable in its own
          right: the nav plus the account card runs taller than a short
          viewport, which previously clipped the logo and the sign-out. */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[15.5rem] flex-col overflow-y-auto overscroll-contain bg-brand-900 p-5 lg:flex">
        <div className="mb-8 px-1">
          <Logo tone="light" />
        </div>
        {nav}
      </aside>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-sand-1005 backdrop-blur-sm"
          />
          <aside className="relative flex h-full w-[16rem] max-w-[82vw] flex-col overflow-y-auto overscroll-contain bg-brand-900 p-5">
            <div className="mb-8 px-1">
              <Logo tone="light" />
            </div>
            {nav}
          </aside>
        </div>
      ) : null}

      <div className="flex min-h-screen min-w-0 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-sand-200 bg-sand-100/90 px-4 backdrop-blur-md sm:px-6 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="grid h-9 w-9 place-items-center rounded-lg border border-sand-300 text-brand-900"
          >
            <svg
              viewBox="0 0 16 16"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" />
            </svg>
          </button>
          <span className="font-display text-[0.9375rem] font-semibold text-brand-900">
            Admin
          </span>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
