import Link from "next/link";
import { Logo } from "@/components/site/logo";
import { Photo } from "@/components/ui/photo";
import { QuoteMark } from "@/components/ui/icons";
import { site } from "@/lib/data/site";

/**
 * Standalone chrome for log in / sign up / password reset. Deliberately outside
 * the (site) group: no marketing header, footer or WhatsApp button competing
 * with the one thing this screen is for.
 */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_0.9fr]">
      <main id="main" className="flex flex-col px-5 py-6 sm:px-10 lg:px-14">
        <div className="flex items-center justify-between gap-4">
          <Logo />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded px-3 py-2 text-[0.8125rem] font-semibold text-ink-500 transition-colors hover:text-brand-800"
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10 3 5 8l5 5" />
            </svg>
            Back to site
          </Link>
        </div>

        <div className="flex flex-1 items-center py-10">
          <div className="w-full">{children}</div>
        </div>

        <p className="text-center text-[0.6875rem] text-ink-300">
          © {new Date().getFullYear()} {site.name}
        </p>
      </main>

      {/* Brand panel — the testimonial-over-image treatment. Hidden on small
          screens so the form is the first thing a phone user sees. */}
      <aside className="relative hidden bg-brand-900 lg:block">
        <Photo
          publicId="photo-1497604401993-f2e922e5cb0a"
          alt="Commercial office campus"
          sizes="45vw"
          width={1200}
          priority
          className="opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/70 to-brand-900/30" />
        <div className="relative flex h-full flex-col justify-end p-12">
          <QuoteMark className="h-5 w-7 text-brand-100" />
          <p className="mt-4 max-w-md font-display text-[1.125rem] leading-relaxed text-white">
            An account is what ties a listing to a verified owner, and a
            requirement to a real buyer. It is the reason nothing on this
            platform is anonymous.
          </p>
          <p className="mt-4 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-brand-100">
            The CommercialLink desk
          </p>
        </div>
      </aside>
    </div>
  );
}
