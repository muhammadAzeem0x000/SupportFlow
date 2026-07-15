import { Search, SlidersHorizontal } from "lucide-react";
import { SelectField } from "@/components/ui/select";
import type { TicketFilters as ActiveFilters } from "@/lib/tickets/filters";
import { CATEGORIES, PRIORITIES, STATUSES } from "@/lib/types";
import { titleCase } from "@/lib/utils";

export function TicketFilters({ customer = false, agents = [], filters }: { customer?: boolean; agents?: { id: string; name: string }[]; filters: ActiveFilters }) {
  const all = "__all__";
  return <form className="mb-6 rounded-2xl border border-white/80 bg-white/90 p-4 shadow-[0_10px_35px_rgba(15,23,42,0.07)] backdrop-blur sm:p-5">
    <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800"><span className="rounded-lg bg-indigo-50 p-2 text-indigo-600"><SlidersHorizontal className="h-4 w-4" /></span>Refine tickets</div>
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
      <label className="relative md:col-span-2"><span className="sr-only">Search ticket title</span><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><input name="q" defaultValue={filters.q} placeholder="Search by ticket title..." className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-3 text-sm text-slate-700 placeholder:text-slate-400" /></label>
      {!customer && <SelectField name="view" defaultValue={filters.view} ariaLabel="Ticket view" options={[{ value: "all", label: "All tickets" }, { value: "mine", label: "My tickets" }, { value: "unassigned", label: "Unassigned" }]} />}
      <SelectField name="status" defaultValue={filters.status ?? all} ariaLabel="Status filter" options={[{ value: all, label: "All statuses" }, ...STATUSES.map((value) => ({ value, label: titleCase(value) }))]} />
      {!customer && <><SelectField name="priority" defaultValue={filters.priority ?? all} ariaLabel="Priority filter" options={[{ value: all, label: "All priorities" }, ...PRIORITIES.map((value) => ({ value, label: titleCase(value) }))]} /><SelectField name="category" defaultValue={filters.category ?? all} ariaLabel="Category filter" options={[{ value: all, label: "All categories" }, ...CATEGORIES.map((value) => ({ value, label: titleCase(value) }))]} />{agents.length > 0 && <SelectField name="agent" defaultValue={filters.agent ?? all} ariaLabel="Agent filter" options={[{ value: all, label: "Any agent" }, ...agents.map((agent) => ({ value: agent.id, label: agent.name }))]} />}</>}
      <button className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-indigo-600 hover:shadow-indigo-600/20">Apply filters</button>
    </div>
  </form>;
}
