import { OwnerDashboard } from "@/components/portal/owner-dashboard";
import { BuyerDashboard } from "@/components/portal/buyer-dashboard";
import { Container } from "@/components/ui/section";
import { PortalHeader } from "@/components/portal/portal-header";
import { getPortalSession } from "@/lib/portal";
import {
  getBuyerEnquiries,
  getBuyerRequirements,
  getOwnerListings,
} from "@/lib/data/portal-queries";

export default async function DashboardPage() {
  // The layout already guaranteed this; re-reading is free (React `cache`).
  const session = await getPortalSession();
  if (!session) return null;

  return (
    <Container className="py-10 sm:py-14">
      <PortalHeader session={session} />

      {session.role === "owner" ? (
        <OwnerDashboard
          session={session}
          listings={await getOwnerListings(session)}
        />
      ) : (
        <BuyerDashboard
          session={session}
          enquiries={await getBuyerEnquiries(session)}
          requirements={await getBuyerRequirements(session)}
        />
      )}
    </Container>
  );
}
