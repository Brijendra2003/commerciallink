import { Photo } from "@/components/ui/photo";
import { Container } from "@/components/ui/section";
import { QuoteMark } from "@/components/ui/icons";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <Container className="py-10 sm:py-14">
      <div className="grid overflow-hidden rounded-[2.5rem] border border-brand-900/8 bg-white shadow-lift lg:grid-cols-[1fr_0.85fr]">
        <div className="order-2 p-7 sm:p-10 lg:order-1 lg:p-12">{children}</div>

        {/* Brand panel — carries the reference boards' testimonial-over-image
            treatment, and keeps the auth screens from feeling like a form dump. */}
        <div className="relative order-1 min-h-[13rem] bg-brand-900 lg:order-2 lg:min-h-full">
          <Photo
            publicId="photo-1497604401993-f2e922e5cb0a"
            alt="Commercial office campus"
            sizes="(max-width: 1024px) 100vw, 480px"
            width={900}
            className="opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/70 to-brand-900/30" />
          <div className="relative flex h-full flex-col justify-end p-8 lg:p-10">
            <QuoteMark className="h-5 w-7 text-clay-300" />
            <p className="mt-4 font-display text-[1.05rem] leading-relaxed text-sand-50">
              An account is what ties a listing to a verified owner, and a
              requirement to a real buyer. It is the reason nothing on this
              platform is anonymous.
            </p>
            <p className="mt-4 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-clay-300">
              The CommercialLink desk
            </p>
          </div>
        </div>
      </div>
    </Container>
  );
}
