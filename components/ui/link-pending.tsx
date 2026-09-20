"use client";

import { useLinkStatus } from "next/link";
import { Loader } from "@/components/ui/loader";

/**
 * Pending marks for <Link> navigations. Both must render *inside* the Link
 * they report on — that is how `useLinkStatus` finds its navigation.
 *
 * Neither reserves layout: a prefetched destination resolves before the
 * 120ms delay in `.pending-veil` elapses, so a fast click shows nothing
 * rather than flashing an indicator on and straight back off.
 */

/**
 * Covers a button-shaped link's label with the link's own background and
 * centres the mark on it, so the control neither resizes nor loses its
 * shape while the route loads.
 */
export function LinkPendingVeil() {
  const { pending } = useLinkStatus();
  return (
    <span className={`pending-veil ${pending ? "is-pending" : ""}`}>
      <Loader size="xs" />
    </span>
  );
}

/**
 * Swaps a nav item's leading icon for the mark. The icon slot is already a
 * fixed size, so the row holds still — and a section's own icon turning
 * into a spinner reads as "this one is opening" without extra chrome.
 */
export function NavPendingIcon({
  icon,
  className = "",
}: {
  icon: React.ReactNode;
  className?: string;
}) {
  const { pending } = useLinkStatus();
  if (!pending) return icon;
  return (
    <span className={`grid h-4 w-4 shrink-0 place-items-center ${className}`}>
      <Loader size="xs" />
    </span>
  );
}
