import { OwnerDashboard } from "@/components/portal/owner-dashboard";
import { BuyerDashboard } from "@/components/portal/buyer-dashboard";
import { Container } from "@/components/ui/section";
import { PortalHeader } from "@/components/portal/portal-header";
import { getPortalSession } from "@/lib/portal";
import {
  getBuyerEnquiries,
  getBuyerRequirements,
  getOwnerLeads,
  getOwnerListings,
} from "@/lib/data/portal-queries";

/**
 * The two lister reads run together — they are independent, and the leads
 * query is the slower of the pair.
 *
 * A leads failure must not take the dashboard down with it: the RLS policy
 * that makes it readable arrived in 0006_projects_and_leads.sql, so a database
 * that has not had that migration applied yet should still render the
 * projects list.
 */
async function listerData(session: NonNullable<Awaited<ReturnType<typeof getPortalSession>>>) {
  const [listings, leads] = await Promise.all([
    getOwnerListings(session),
    getOwnerLeads().catch((error) => {
      console.error("[dashboard] owner leads unavailable", error);
      return [];
    }),
  ]);
  return { listings, leads };
}

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
          {...await listerData(session)}
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
