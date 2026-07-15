import type { Role, TicketStatus } from "@/lib/types";

const transitions: Record<TicketStatus, TicketStatus[]> = {
  open: ["in_progress", "resolved"],
  in_progress: ["resolved"],
  resolved: ["in_progress", "closed"],
  closed: [],
};

export function isValidTransition(from: TicketStatus, to: TicketStatus) { return transitions[from].includes(to); }
export function canRoleTransition(role: Role, from: TicketStatus, to: TicketStatus) {
  if (!isValidTransition(from, to)) return false;
  if (role === "admin") return true;
  if (role === "agent") return (from === "open" && to === "in_progress") || (from === "in_progress" && to === "resolved") || (from === "resolved" && to === "in_progress");
  return from === "resolved" && to === "closed";
}
export function allowedNextStatuses(role: Role, from: TicketStatus) {
  return transitions[from].filter((to) => canRoleTransition(role, from, to));
}
