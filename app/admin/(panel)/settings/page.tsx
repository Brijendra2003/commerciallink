import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader, Panel } from "@/components/admin/page-header";
import { InviteUserButton } from "@/components/admin/quick-actions";
import { getAdminSession } from "@/lib/auth";
import { getAdmins, getAuditLog, getLeads } from "@/lib/data/queries";
import type { AdminRole } from "@/lib/admin-types";

export const metadata: Metadata = { title: "Users & Access" };

const ROLE_LABEL: Record<AdminRole, string> = {
  super_admin: "Super admin",
  sales_exec: "Sales executive",
  content_editor: "Content editor",
};

const PERMISSIONS: {
  capability: string;
  super_admin: boolean;
  sales_exec: boolean;
  content_editor: boolean;
}[] = [
  { capability: "View assigned leads", super_admin: true, sales_exec: true, content_editor: false },
  { capability: "View all leads", super_admin: true, sales_exec: false, content_editor: false },
  { capability: "See buyer contact details", super_admin: true, sales_exec: true, content_editor: false },
  { capability: "See owner contact details", super_admin: true, sales_exec: true, content_editor: false },
  { capability: "Reassign leads", super_admin: true, sales_exec: false, content_editor: false },
  { capability: "Create & edit listings", super_admin: true, sales_exec: false, content_editor: true },
  { capability: "Approve owner submissions", super_admin: true, sales_exec: false, content_editor: false },
  { capability: "Record deals & commission", super_admin: true, sales_exec: true, content_editor: false },
  { capability: "Export lead data", super_admin: true, sales_exec: true, content_editor: false },
  { capability: "Manage users & roles", super_admin: true, sales_exec: false, content_editor: false },
];

export default async function SettingsPage() {
  const [session, admins, auditLog, leads] = await Promise.all([
    getAdminSession(),
    getAdmins(),
    getAuditLog(),
    getLeads(),
  ]);

  // The layout already gates the panel; this keeps the invite control off the
  // page for roles that the action would refuse anyway.
  if (!session) notFound();

  return (
    <>
      <PageHeader
        title="Users & access"
        lead="Role-based access control, and the audit trail behind it. In production these roles map to Supabase RLS policies, so a permission removed here is enforced at the database, not just in the UI."
        action={session.role === "super_admin" ? <InviteUserButton /> : null}
      />

      <div className="grid gap-4 xl:grid-cols-[1.15fr_1fr]">
        <Panel title="Team" padded={false}>
          <ul className="divide-y divide-sand-200">
            {admins.map((user) => {
              const assigned = leads.filter(
                (l) => l.assigned_to === user.id && !["won", "lost"].includes(l.status),
              ).length;

              return (
                <li key={user.id} className="flex items-center gap-4 px-5 py-4">
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-[0.75rem] font-bold ${
                      user.is_active
                        ? "bg-brand-800 text-brand-100"
                        : "bg-sand-200 text-ink-300"
                    }`}
                  >
                    {user.initials}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-[0.875rem] font-bold text-brand-900">
                        {user.name}
                      </span>
                      <span className="rounded-full bg-sand-100 px-2 py-0.5 text-[0.625rem] font-bold text-ink-500">
                        {ROLE_LABEL[user.role]}
                      </span>
                      {!user.is_active ? (
                        <span
                          className="rounded-full px-2 py-0.5 text-[0.625rem] font-bold"
                          style={{
                            background: "rgba(138,133,120,0.14)",
                            color: "#5a5548",
                          }}
                        >
                          · Deactivated
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block truncate text-[0.75rem] text-ink-300">
                      {user.email} · last seen {user.last_seen.replace("T", " ")}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    {user.role === "sales_exec" ? (
                      <>
                        <span className="block text-[0.875rem] font-bold tabular-nums text-brand-800">
                          {assigned}
                        </span>
                        <span className="block text-[0.625rem] text-ink-300">
                          open leads
                        </span>
                      </>
                    ) : (
                      <span className="text-[0.75rem] text-ink-300">—</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel title="Permission matrix" padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[26rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-sand-200 bg-sand-50">
                  <th
                    scope="col"
                    className="px-5 py-3 text-[0.625rem] font-bold uppercase tracking-[0.12em] text-ink-300"
                  >
                    Capability
                  </th>
                  {(Object.keys(ROLE_LABEL) as AdminRole[]).map((role) => (
                    <th
                      key={role}
                      scope="col"
                      className="px-3 py-3 text-center text-[0.625rem] font-bold uppercase tracking-[0.12em] text-ink-300"
                    >
                      {ROLE_LABEL[role].split(" ")[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERMISSIONS.map((p) => (
                  <tr key={p.capability} className="border-b border-sand-200 last:border-0">
                    <td className="px-5 py-2.5 text-[0.8125rem] text-ink-500">
                      {p.capability}
                    </td>
                    {(["super_admin", "sales_exec", "content_editor"] as const).map(
                      (role) => (
                        <td key={role} className="px-3 py-2.5 text-center">
                          {p[role] ? (
                            <span
                              className="text-[0.875rem] font-bold"
                              style={{ color: "var(--color-status-good)" }}
                              title="Allowed"
                            >
                              ✓<span className="sr-only">Allowed</span>
                            </span>
                          ) : (
                            <span className="text-[0.875rem] text-ink-300" title="Denied">
                              —<span className="sr-only">Denied</span>
                            </span>
                          )}
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="border-t border-sand-200 px-5 py-3.5 text-[0.6875rem] leading-relaxed text-ink-300">
            Buyer and owner contact fields sit behind an admin-role RLS policy.
            A content editor cannot read them through the UI or a direct API
            call — that is the database-level guarantee from Section 6, not a UI
            convention.
          </p>
        </Panel>
      </div>

      <div className="mt-4">
        <Panel title="Audit log" padded={false}>
          <ul className="divide-y divide-sand-200">
            {auditLog.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-5 py-3"
              >
                <span className="text-[0.8125rem] font-bold text-brand-900">
                  {entry.actor}
                </span>
                <span className="text-[0.8125rem] text-ink-500">{entry.action}</span>
                <span className="min-w-0 flex-1 truncate text-[0.75rem] text-ink-300">
                  {entry.target}
                </span>
                <span className="shrink-0 text-[0.6875rem] tabular-nums text-ink-300">
                  {entry.created_at}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
