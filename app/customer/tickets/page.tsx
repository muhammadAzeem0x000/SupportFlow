import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { TicketFilters } from "@/components/tickets/ticket-filters";
import { TicketTable } from "@/components/tickets/ticket-table";
import { requireMember } from "@/lib/auth/current-member";
import { parseTicketFilters } from "@/lib/tickets/filters";
import { getTickets } from "@/lib/tickets/queries";
export default async function CustomerTickets({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){ const member=await requireMember(["customer"]); const filters=parseTicketFilters(await searchParams); const result=await getTickets(member,filters); return <><PageHeader eyebrow={member.organizationName} title="My support tickets" description="Track requests and continue conversations with the support team." action={<Link href="/customer/tickets/new" className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#3157d5] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#2444b4]"><Plus className="h-4 w-4"/>New ticket</Link>}/><TicketFilters customer filters={filters}/><TicketTable tickets={result.tickets} basePath="/customer/tickets"/></>; }
