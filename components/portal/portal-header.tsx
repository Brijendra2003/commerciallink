import { Kicker } from "@/components/ui/section";
import { signOutPortalUser } from "@/lib/portal-actions";
import type { PortalSession } from "@/lib/portal";

export function PortalHeader({ session }: { session: PortalSession }) {
  const firstName = session.name.split(" ")[0];

  return (
    <header className="mb-8 flex flex-col gap-5 border-b border-sand-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <Kicker className="mb-3">
          {session.role === "owner" ? "Owner dashboard" : "Buyer dashboard"}
        </Kicker>
        <h1 className="font-display text-[1.9rem] leading-[1.12] tracking-[-0.025em] text-brand-900 sm:text-[2.3rem]">
          Welcome back,{" "}
          <span className="italic text-brand-700">{firstName}.</span>
        </h1>
        <p className="mt-2.5 text-[0.875rem] text-ink-500">
          {session.company ? `${session.company} · ` : ""}
          {session.email}
        </p>
      </div>

      <form action={signOutPortalUser} className="shrink-0">
        <button
          type="submit"
          className="rounded-full border border-brand-900/15 px-5 py-2.5 text-[0.8125rem] font-semibold text-brand-900 transition-colors hover:bg-white"
        >
          Sign out
        </button>
      </form>
    </header>
  );
}

/** Shown until the address on the account is confirmed. */
export function VerifyEmailNotice({ email }: { email: string }) {
  return (
    <div
      role="status"
      className="mb-6 flex items-start gap-3 rounded-3xl border p-5"
      style={{
        borderColor: "rgba(250,178,25,0.35)",
        background: "rgba(250,178,25,0.10)",
      }}
    >
      <span
        aria-hidden="true"
        className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[0.75rem] font-bold text-white"
        style={{ background: "var(--color-status-warning)" }}
      >
        !
      </span>
      <div>
        <p className="text-[0.875rem] font-bold text-brand-900">
          Confirm your email to submit
        </p>
        <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-500">
          We sent a link to {email}. Until it&apos;s confirmed you can browse
          here, but new listings and requirements are held.
        </p>
      </div>
    </div>
  );
}
