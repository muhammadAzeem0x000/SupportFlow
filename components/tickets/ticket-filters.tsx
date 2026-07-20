import { Search } from "lucide-react";
import { SelectField } from "@/components/ui/select";
import type { TicketFilters as ActiveFilters } from "@/lib/tickets/filters";
import { CATEGORIES, PRIORITIES, STATUSES } from "@/lib/types";
import { titleCase } from "@/lib/utils";

export function TicketFilters({ customer = false, agents = [], filters }: { customer?: boolean; agents?: { id: string; name: string }[]; filters: ActiveFilters }) {
  const all = "__all__";
  return <form className="mb-4 border border-[#deded8] bg-white p-3">
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
      <label className="relative md:col-span-2"><span className="sr-only">Search ticket title</span><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><input name="q" defaultValue={filters.q} placeholder="Search ticket title" className="h-10 w-full rounded-lg border border-[#d8d9d4] bg-white pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400" /></label>
      {!customer && <SelectField name="view" defaultValue={filters.view} ariaLabel="Ticket view" options={[{ value: "all", label: "All tickets" }, { value: "mine", label: "My tickets" }, { value: "unassigned", label: "Unassigned" }]} />}
      <SelectField name="status" defaultValue={filters.status ?? all} ariaLabel="Status filter" options={[{ value: all, label: "All statuses" }, ...STATUSES.map((value) => ({ value, label: titleCase(value) }))]} />
      {!customer && <><SelectField name="priority" defaultValue={filters.priority ?? all} ariaLabel="Priority filter" options={[{ value: all, label: "All priorities" }, ...PRIORITIES.map((value) => ({ value, label: titleCase(value) }))]} /><SelectField name="category" defaultValue={filters.category ?? all} ariaLabel="Category filter" options={[{ value: all, label: "All categories" }, ...CATEGORIES.map((value) => ({ value, label: titleCase(value) }))]} />{agents.length > 0 && <SelectField name="agent" defaultValue={filters.agent ?? all} ariaLabel="Agent filter" options={[{ value: all, label: "Any agent" }, ...agents.map((agent) => ({ value: agent.id, label: agent.name }))]} />}</>}
      <button className="inline-flex h-10 items-center justify-center rounded-lg bg-[#18202b] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#3157d5]">Apply</button>
    </div>
  </form>;
}
