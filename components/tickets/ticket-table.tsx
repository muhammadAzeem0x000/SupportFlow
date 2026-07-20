import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PriorityBadge, SlaBadge, TicketStatusBadge } from "@/components/ui/badge";
import type { TicketSummary } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function TicketTable({ tickets, basePath }: { tickets: TicketSummary[]; basePath: string }) {
  if (!tickets.length) return <EmptyState title="No tickets found" description="Try changing the filters or create a new ticket." />;
  return <div className="overflow-hidden border border-[#deded8] bg-white">
    <div className="flex items-center justify-between border-b border-[#deded8] px-5 py-3.5"><div><h2 className="text-sm font-semibold text-slate-900">Queue</h2><p className="mt-0.5 text-[11px] text-slate-500">{tickets.length} records on this page</p></div></div>
    <div className="overflow-x-auto"><table className="min-w-full"><thead><tr className="border-b border-slate-100 bg-slate-50/60">{["Ticket", "Customer", "Status", "Priority", "Assigned", "SLA", "Created", ""].map((heading) => <th key={heading} className="whitespace-nowrap px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{heading}</th>)}</tr></thead>
      <tbody className="divide-y divide-slate-100">{tickets.map((ticket) => { const customer = ticket.customer?.full_name ?? "Unknown"; return <tr key={ticket.id} className="group transition-colors hover:bg-[#f7f8fb]"><td className="max-w-sm px-5 py-4"><Link className="block font-semibold text-slate-900 transition-colors group-hover:text-[#2444b4]" href={`${basePath}/${ticket.id}`}>{ticket.title}</Link><p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-slate-400">{ticket.id.slice(0, 8)} / {ticket.category}</p></td><td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-600">{customer}</td><td className="px-5 py-4"><TicketStatusBadge status={ticket.status} /></td><td className="px-5 py-4"><PriorityBadge priority={ticket.priority} /></td><td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">{ticket.agent?.full_name ?? <span className="text-slate-400">Unassigned</span>}</td><td className="whitespace-nowrap px-5 py-4"><SlaBadge dueAt={ticket.response_due_at} responseAt={ticket.first_agent_response_at} /></td><td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">{formatDate(ticket.created_at)}</td><td className="px-5 py-4"><Link aria-label={`Open ${ticket.title}`} href={`${basePath}/${ticket.id}`} className="flex h-8 w-8 items-center justify-center text-slate-400 transition-colors group-hover:text-[#3157d5]"><ArrowUpRight className="h-4 w-4" /></Link></td></tr>; })}</tbody>
    </table></div>
  </div>;
}
