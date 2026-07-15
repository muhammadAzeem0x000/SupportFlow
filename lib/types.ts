export const ROLES = ["admin", "agent", "customer"] as const;
export const CATEGORIES = ["technical", "billing", "account", "general"] as const;
export const PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export const STATUSES = ["open", "in_progress", "resolved", "closed"] as const;

export type Role = (typeof ROLES)[number];
export type TicketCategory = (typeof CATEGORIES)[number];
export type TicketPriority = (typeof PRIORITIES)[number];
export type TicketStatus = (typeof STATUSES)[number];

export interface CurrentMember {
  id: string;
  userId: string;
  organizationId: string;
  organizationName: string;
  fullName: string;
  email: string;
  role: Role;
  isActive: boolean;
}

export interface TicketSummary {
  id: string;
  title: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  response_due_at: string;
  first_agent_response_at: string | null;
  created_at: string;
  created_by: string;
  assigned_agent_id: string | null;
  customer?: { full_name: string } | null;
  agent?: { full_name: string } | null;
}

export interface CommentRecord {
  id: string;
  ticket_id: string;
  author_id: string;
  body: string | null;
  created_at: string;
  author?: { full_name: string } | null;
}

export interface AppErrorBody {
  error: { code: string; message: string; fieldErrors?: Record<string, string[]> };
}
