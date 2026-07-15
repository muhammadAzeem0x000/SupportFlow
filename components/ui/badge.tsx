import type { TicketPriority, TicketStatus } from "@/lib/types";
import { cn, titleCase } from "@/lib/utils";
import { calculateSlaStatus } from "@/lib/tickets/sla";

const statusStyles: Record<TicketStatus,string> = { open:"bg-blue-50 text-blue-700 ring-blue-200", in_progress:"bg-amber-50 text-amber-700 ring-amber-200", resolved:"bg-emerald-50 text-emerald-700 ring-emerald-200", closed:"bg-slate-100 text-slate-600 ring-slate-200" };
const priorityStyles: Record<TicketPriority,string> = { low:"bg-slate-100 text-slate-600 ring-slate-200", medium:"bg-sky-50 text-sky-700 ring-sky-200", high:"bg-orange-50 text-orange-700 ring-orange-200", urgent:"bg-rose-50 text-rose-700 ring-rose-200" };
function Badge({ children, className }: { children: React.ReactNode; className?: string }) { return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",className)}>{children}</span>; }
export function TicketStatusBadge({ status }: { status: TicketStatus }) { return <Badge className={statusStyles[status]}>{titleCase(status)}</Badge>; }
export function PriorityBadge({ priority }: { priority: TicketPriority }) { return <Badge className={priorityStyles[priority]}>{titleCase(priority)}</Badge>; }
export function SlaBadge({ dueAt, responseAt }: { dueAt:string; responseAt:string|null }) { const sla=calculateSlaStatus(dueAt,responseAt); return <Badge className={sla.state === "overdue" || sla.state === "missed" ? "bg-rose-50 text-rose-700 ring-rose-200" : sla.state === "met" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-violet-50 text-violet-700 ring-violet-200"}>{sla.label}</Badge>; }
