import { PageHeader } from "@/components/dashboard/page-header";
import { TicketFilters } from "@/components/tickets/ticket-filters";
import { TicketTable } from "@/components/tickets/ticket-table";
import { requireMember } from "@/lib/auth/current-member";
import { parseTicketFilters } from "@/lib/tickets/filters";
import { getAgents, getTickets } from "@/lib/tickets/queries";
export default async function TicketsPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){ const member=await requireMember(["admin","agent"]); const filters=parseTicketFilters(await searchParams); const [result,agents]=await Promise.all([getTickets(member,filters),getAgents()]); return <><PageHeader eyebrow="Workspace" title="Support tickets" description={`${result.count} tickets match your current view.`}/><TicketFilters agents={member.role==="admin"?agents:[]}/><TicketTable tickets={result.tickets} basePath="/dashboard/tickets"/></>; }
