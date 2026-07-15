import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { CurrentMember, Role } from "@/lib/types";

export const getCurrentMember = cache(async (): Promise<CurrentMember | null> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("organization_members").select("id, organization_id, role, is_active, organizations(name), profiles(full_name)").eq("user_id", user.id).maybeSingle();
  if (!data) return null;
  const organization = data.organizations as unknown as { name: string } | null;
  const profile = data.profiles as unknown as { full_name: string } | null;
  return { id: data.id, userId: user.id, organizationId: data.organization_id, organizationName: organization?.name ?? "Organization", fullName: profile?.full_name ?? "User", email: user.email ?? "", role: data.role as Role, isActive: data.is_active };
});

export async function requireMember(roles?: Role[]) {
  const member = await getCurrentMember();
  if (!member) redirect("/login");
  if (!member.isActive) redirect("/login?error=inactive");
  if (roles && !roles.includes(member.role)) redirect(member.role === "customer" ? "/customer/tickets" : "/dashboard");
  return member;
}
