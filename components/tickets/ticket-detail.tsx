import { Calendar, Hash, Tag, User } from "lucide-react";
import { AttachmentList } from "@/components/attachments/attachment-list";
import { CommentThread } from "@/components/comments/comment-thread";
import { PriorityBadge, SlaBadge, TicketStatusBadge } from "@/components/ui/badge";
import { TicketControls } from "@/components/tickets/ticket-controls";
import { TicketTimeline } from "@/components/tickets/ticket-timeline";
import type { CommentRecord, CurrentMember, TicketPriority, TicketStatus } from "@/lib/types";
import { formatDate, titleCase } from "@/lib/utils";

type Detail = { id: string; title: string; description: string; category: string; priority: string; status: string; response_due_at: string; first_agent_response_at: string | null; created_at: string; assigned_agent_id: string | null; customer: { full_name: string } | null; agent: { full_name: string } | null; comments: unknown[]; attachments: Array<{ id: string; original_filename: string; size_bytes: number }>; events: unknown[] };

export function TicketDetail({ ticket, member, agents }: { ticket: Detail; member: CurrentMember; agents: { id: string; name: string }[] }) {
  return <>
    <div className="relative mb-6 overflow-hidden rounded-3xl border border-white/80 bg-white/90 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-indigo-100/80 blur-3xl" />
      <div className="relative p-6 sm:p-8"><div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-start"><div className="max-w-3xl"><div className="mb-4 flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500"><Hash className="h-3 w-3" />{ticket.id.slice(0, 8)}</span><TicketStatusBadge status={ticket.status as TicketStatus} /><PriorityBadge priority={ticket.priority as TicketPriority} /><SlaBadge dueAt={ticket.response_due_at} responseAt={ticket.first_agent_response_at} /></div><h1 className="text-2xl font-bold tracking-[-0.03em] text-slate-950 sm:text-3xl">{ticket.title}</h1><div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600"><span className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white/70 px-2.5 py-1.5"><Tag className="h-3.5 w-3.5 text-indigo-500" />{titleCase(ticket.category)}</span><span className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white/70 px-2.5 py-1.5"><User className="h-3.5 w-3.5 text-indigo-500" />{ticket.customer?.full_name}</span><span className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white/70 px-2.5 py-1.5"><Calendar className="h-3.5 w-3.5 text-indigo-500" />{formatDate(ticket.created_at)}</span></div></div><TicketControls ticketId={ticket.id} role={member.role} status={ticket.status as TicketStatus} priority={ticket.priority as TicketPriority} assignedAgentId={ticket.assigned_agent_id} agents={agents} /></div>
        <div className="mt-7 border-t border-slate-100 pt-6"><h2 className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">Issue description</h2><p className="max-w-4xl whitespace-pre-wrap text-sm leading-7 text-slate-600">{ticket.description}</p></div>
      </div>
    </div>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(20rem,.75fr)]"><CommentThread ticketId={ticket.id} initialComments={ticket.comments as CommentRecord[]} currentUserId={member.userId} /><div className="space-y-6"><AttachmentList ticketId={ticket.id} initial={ticket.attachments} /><TicketTimeline events={ticket.events as Parameters<typeof TicketTimeline>[0]["events"]} /></div></div>
  </>;
}
