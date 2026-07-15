"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SelectField } from "@/components/ui/select";
import { allowedNextStatuses } from "@/lib/tickets/status-transitions";
import type { Role, TicketPriority, TicketStatus } from "@/lib/types";
import { PRIORITIES } from "@/lib/types";
import { titleCase } from "@/lib/utils";

export function TicketControls({ ticketId, role, status, priority, assignedAgentId, agents }: { ticketId: string; role: Role; status: TicketStatus; priority: TicketPriority; assignedAgentId: string | null; agents: { id: string; name: string }[] }) {
  const router = useRouter();
  async function patch(path: string, body: object) {
    const response = await fetch(`/api/tickets/${ticketId}/${path}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const result = await response.json() as { error?: { message: string } };
    if (!response.ok) { toast.error(result.error?.message ?? "Update failed"); return; }
    toast.success("Ticket updated");
    router.refresh();
  }
  const next = allowedNextStatuses(role, status);
  return <div className="grid min-w-full gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 sm:min-w-[28rem] sm:grid-cols-2 lg:min-w-[34rem]">
    {role === "admin" && <><label className="space-y-1.5"><span className="px-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Assigned agent</span><SelectField ariaLabel="Assigned agent" value={assignedAgentId ?? "__unassigned__"} onValueChange={(value) => void patch("assignment", { agentId: value === "__unassigned__" ? null : value })} options={[{ value: "__unassigned__", label: "Unassigned" }, ...agents.map((agent) => ({ value: agent.id, label: agent.name }))]} /></label><label className="space-y-1.5"><span className="px-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Priority</span><SelectField ariaLabel="Priority" value={priority} onValueChange={(value) => void patch("priority", { priority: value })} options={PRIORITIES.map((value) => ({ value, label: titleCase(value) }))} /></label></>}
    {next.length > 0 && <label className="space-y-1.5"><span className="px-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Move ticket to</span><SelectField ariaLabel="Status" placeholder="Choose next status" onValueChange={(value) => void patch("status", { status: value })} options={next.map((value) => ({ value, label: titleCase(value) }))} /></label>}
  </div>;
}
