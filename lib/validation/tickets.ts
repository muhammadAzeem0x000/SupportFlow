import { z } from "zod";
import { CATEGORIES, PRIORITIES, STATUSES } from "@/lib/types";

export const ticketInputSchema = z.object({
  title: z.string().trim().min(5).max(120),
  description: z.string().trim().min(20).max(5000),
  category: z.enum(CATEGORIES),
  priority: z.enum(PRIORITIES),
});
export const commentInputSchema = z.object({ body: z.string().trim().max(3000).optional().default("") }).refine((data) => data.body.length > 0, { path: ["body"], message: "Write a comment or attach a file." });
export const statusInputSchema = z.object({ status: z.enum(STATUSES) });
export const priorityInputSchema = z.object({ priority: z.enum(PRIORITIES) });
export const assignmentInputSchema = z.object({ agentId: z.string().uuid().nullable() });

export const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "application/pdf", "text/plain"] as const;
export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export function validateAttachment(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (file.size > MAX_FILE_SIZE) return "Files must be 5 MB or smaller.";
  if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number]) || !["png", "jpg", "jpeg", "pdf", "txt"].includes(extension ?? "")) return "Only PNG, JPG, JPEG, PDF, and TXT files are supported.";
  return null;
}
