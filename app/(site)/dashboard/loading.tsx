import { Container } from "@/components/ui/section";

export default function LoadingDashboard() {
  return (
    <Container className="py-10 sm:py-14">
      <div className="mb-8 border-b border-sand-200 pb-7">
        <div className="h-3 w-32 animate-pulse rounded-full bg-brand-900/10" />
        <div className="mt-4 h-8 w-64 animate-pulse rounded-lg bg-brand-900/10" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-3xl border border-brand-900/8 bg-white shadow-soft"
          />
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="h-72 animate-pulse rounded-3xl bg-white/70" />
        <div className="h-72 animate-pulse rounded-3xl bg-white/70" />
      </div>
      <span className="sr-only" role="status">
        Loading your dashboard…
      </span>
    </Container>
  );
}
