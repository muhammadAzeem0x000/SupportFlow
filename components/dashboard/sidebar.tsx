"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, LogOut, Plus, Ticket, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { CurrentMember } from "@/lib/types";
import { cn, titleCase } from "@/lib/utils";

export function DashboardSidebar({ member }: { member: CurrentMember }) {
  const pathname = usePathname();
  const links = member.role !== "customer"
    ? [
        { href: "/dashboard", label: "Overview", icon: BarChart3 },
        { href: "/dashboard/tickets", label: "Tickets", icon: Ticket },
        ...(member.role === "admin" ? [{ href: "/dashboard/team", label: "Team", icon: Users }] : []),
      ]
    : [
        { href: "/customer/tickets", label: "My tickets", icon: Ticket },
        { href: "/customer/tickets/new", label: "Create ticket", icon: Plus },
      ];

  const active = (href: string) => pathname === href || (href.includes("tickets") && pathname.startsWith(`${href}/`));

  async function logout() {
    await createClient().auth.signOut();
    window.location.assign("/login");
  }

  return (
    <aside className="z-30 flex w-full flex-col border-b border-slate-800 bg-[#111927] text-white lg:fixed lg:inset-y-0 lg:w-64 lg:border-b-0 lg:border-r">
      <div className="flex h-17 items-center gap-3 border-b border-white/10 px-5">
        <span className="flex h-8 w-8 items-center justify-center border border-white/30 text-[11px] font-bold">SF</span>
        <div><span className="block text-sm font-semibold">SupportFlow</span><span className="block text-[9px] uppercase tracking-[0.18em] text-slate-500">Ticket operations</span></div>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-3 py-3 lg:flex-1 lg:flex-col lg:px-4 lg:py-6">
        <p className="mb-2 hidden px-2 font-mono text-[9px] uppercase tracking-[0.18em] text-slate-600 lg:block">Navigation</p>
        {links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={cn("flex shrink-0 items-center gap-3 border-l-2 border-transparent px-3 py-2.5 text-sm text-slate-400 transition-colors hover:bg-white/[0.04] hover:text-white", active(href) && "border-[#7892f5] bg-white/[0.06] text-white")}><Icon className={cn("h-4 w-4", active(href) ? "text-[#9cafff]" : "text-slate-500")} />{label}</Link>)}
        <button onClick={logout} className="flex shrink-0 items-center gap-3 border-l-2 border-transparent px-3 py-2.5 text-sm text-slate-400 hover:text-white lg:hidden"><LogOut className="h-4 w-4" />Sign out</button>
      </nav>

      <div className="hidden border-t border-white/10 px-5 py-4 lg:block">
        <p className="truncate text-sm font-medium text-slate-200">{member.fullName}</p>
        <p className="mt-0.5 truncate text-[11px] text-slate-500">{member.organizationName} / {titleCase(member.role)}</p>
        <button onClick={logout} className="mt-4 flex items-center gap-2 text-xs text-slate-500 transition-colors hover:text-white"><LogOut className="h-3.5 w-3.5" />Sign out</button>
      </div>
    </aside>
  );
}
