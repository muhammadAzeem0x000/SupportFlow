import { AppError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import type { CurrentMember, Role } from "@/lib/types";

export async function requireApiMember(roles?: Role[]): Promise<{ member: CurrentMember; supabase: Awaited<ReturnType<typeof createClient>> }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new AppError("UNAUTHENTICATED", "Please sign in to continue.", 401);
  const { data } = await supabase.from("organization_members").select("id, organization_id, role, is_active, organizations(name), profiles(full_name)").eq("user_id", user.id).maybeSingle();
  if (!data || !data.is_active) throw new AppError("FORBIDDEN", "Your organization membership is inactive or unavailable.", 403);
  if (roles && !roles.includes(data.role as Role)) throw new AppError("FORBIDDEN", "You do not have permission to perform this action.", 403);
  const member: CurrentMember = { id: data.id, userId: user.id, organizationId: data.organization_id, organizationName: (data.organizations as unknown as { name: string } | null)?.name ?? "Organization", fullName: (data.profiles as unknown as { full_name: string } | null)?.full_name ?? "User", email: user.email ?? "", role: data.role as Role, isActive: true };
  return { member, supabase };
}
