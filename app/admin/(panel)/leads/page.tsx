import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { LeadBoard } from "@/components/admin/leads/lead-board";
import { pipelineValue } from "@/lib/data/crm";
import { getAdmins, getLeads, getRequirements } from "@/lib/data/queries";
import { formatINR } from "@/lib/format";

export const metadata: Metadata = { title: "Lead Management" };

function one(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [sp, leads, admins, requirements] = await Promise.all([
    searchParams,
    getLeads(),
    getAdmins(),
    getRequirements(),
  ]);

  return (
    <>
      <PageHeader
        title="Lead management"
        lead={`${leads.length} leads in the book, ${formatINR(
          pipelineValue(leads),
        )} of open pipeline. Drag a card between columns to move it through the stages, or open one for the full activity trail.`}
      />
      <LeadBoard
        initialLeads={leads}
        admins={admins}
        requirements={requirements}
        initialStatus={one(sp.status)}
        initialLeadId={one(sp.lead) || undefined}
      />
    </>
  );
}
