import { differenceInHours, formatDistanceToNowStrict } from "date-fns";
import type { TicketPriority } from "@/lib/types";

export const SLA_HOURS: Record<TicketPriority, number> = { low: 72, medium: 48, high: 24, urgent: 4 };

export function calculateResponseDueAt(priority: TicketPriority, createdAt = new Date()) {
  return new Date(createdAt.getTime() + SLA_HOURS[priority] * 3_600_000);
}

export type SlaState = "pending" | "overdue" | "met" | "missed";
export function calculateSlaStatus(responseDueAt: string | Date, firstResponseAt: string | Date | null, now = new Date()) {
  const due = new Date(responseDueAt);
  if (firstResponseAt) {
    const response = new Date(firstResponseAt);
    return { state: (response <= due ? "met" : "missed") as SlaState, label: response <= due ? "SLA met" : "SLA missed" };
  }
  if (now > due) return { state: "overdue" as const, label: `Overdue by ${formatDistanceToNowStrict(due, { addSuffix: false })}` };
  return { state: "pending" as const, label: `Due in ${formatDistanceToNowStrict(due, { addSuffix: false })}`, hoursRemaining: differenceInHours(due, now) };
}
