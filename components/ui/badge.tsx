import type { TicketPriority, TicketStatus } from "@/lib/types";
import { cn, titleCase } from "@/lib/utils";
import { calculateSlaStatus } from "@/lib/tickets/sla";

const statusStyles: Record<TicketStatus,string> = { open:"border-blue-200 bg-blue-50 text-blue-700", in_progress:"border-amber-200 bg-amber-50 text-amber-700", resolved:"border-emerald-200 bg-emerald-50 text-emerald-700", closed:"border-slate-200 bg-slate-100 text-slate-600" };
const priorityStyles: Record<TicketPriority,string> = { low:"border-slate-200 text-slate-500", medium:"border-sky-200 text-sky-700", high:"border-orange-200 text-orange-700", urgent:"border-rose-200 text-rose-700" };
function Badge({ children, className }: { children: React.ReactNode; className?: string }) { return <span className={cn("inline-flex rounded-md border px-2 py-0.5 text-[11px] font-semibold",className)}>{children}</span>; }
export function TicketStatusBadge({ status }: { status: TicketStatus }) { return <Badge className={statusStyles[status]}>{titleCase(status)}</Badge>; }
export function PriorityBadge({ priority }: { priority: TicketPriority }) { return <Badge className={priorityStyles[priority]}>{titleCase(priority)}</Badge>; }
export function SlaBadge({ dueAt, responseAt }: { dueAt:string; responseAt:string|null }) { const sla=calculateSlaStatus(dueAt,responseAt); return <Badge className={sla.state === "overdue" || sla.state === "missed" ? "border-rose-200 bg-rose-50 text-rose-700" : sla.state === "met" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-violet-200 bg-violet-50 text-violet-700"}>{sla.label}</Badge>; }
