import { PageHeader } from "@/components/dashboard/page-header";
import { requireMember } from "@/lib/auth/current-member";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { titleCase } from "@/lib/utils";

export default async function TeamPage() {
  await requireMember(["admin"]);

  const supabase = await createClient();
  const admin = createAdminClient();
  const [memberResult, ticketResult, userResult] = await Promise.all([
    supabase
      .from("organization_members")
      .select("user_id,role,is_active,profiles(full_name)")
      .order("role"),
    supabase
      .from("tickets")
      .select("assigned_agent_id")
      .not("assigned_agent_id", "is", null),
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);

  const usersById = new Map(
    userResult.data.users.map((user) => [user.id, user]),
  );
  const assignmentsByAgent = new Map<string, number>();

  for (const ticket of ticketResult.data ?? []) {
    if (!ticket.assigned_agent_id) continue;
    assignmentsByAgent.set(
      ticket.assigned_agent_id,
      (assignmentsByAgent.get(ticket.assigned_agent_id) ?? 0) + 1,
    );
  }

  const rows = (memberResult.data ?? []).map((member) => ({
    ...member,
    name:
      (member.profiles as unknown as { full_name: string } | null)?.full_name ??
      "User",
    email: usersById.get(member.user_id)?.email ?? "—",
    assigned: assignmentsByAgent.get(member.user_id) ?? 0,
  }));

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Team"
        description="A read-only view of active organization members and agent workload."
      />
      <div className="overflow-hidden border border-[#deded8] bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {["Member", "Email", "Role", "Status", "Assigned tickets"].map(
                (label) => (
                  <th
                    key={label}
                    className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {label}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.user_id}>
                <td className="px-5 py-4 text-sm font-semibold">{row.name}</td>
                <td className="px-5 py-4 text-sm text-slate-500">{row.email}</td>
                <td className="px-5 py-4 text-sm">{titleCase(row.role)}</td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${
                      row.is_active
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-slate-100 text-slate-500"
                    }`}
                  >
                    {row.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-slate-600">
                  {row.role === "agent" ? row.assigned : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
