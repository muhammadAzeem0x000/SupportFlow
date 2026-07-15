import { z } from "zod";
import { CATEGORIES, PRIORITIES, STATUSES } from "@/lib/types";

const schema = z.object({
  q: z.string().trim().max(120).catch(""),
  status: z.enum(STATUSES).optional().catch(undefined),
  priority: z.enum(PRIORITIES).optional().catch(undefined),
  category: z.enum(CATEGORIES).optional().catch(undefined),
  agent: z.string().uuid().optional().catch(undefined),
  view: z.enum(["all", "mine", "unassigned"]).default("all").catch("all"),
  page: z.coerce.number().int().positive().default(1).catch(1),
});
export type TicketFilters = z.infer<typeof schema>;
export function parseTicketFilters(input: Record<string, string | string[] | undefined>): TicketFilters {
  const flat = Object.fromEntries(Object.entries(input).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]));
  return schema.parse(flat);
}
