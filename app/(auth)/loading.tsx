import { LoadingPanel } from "@/components/ui/loader";

/** Sign-in, sign-up and reset all sit on the same narrow card. */
export default function LoadingAuth() {
  return <LoadingPanel label="Loading…" className="min-h-[18rem]" />;
}
