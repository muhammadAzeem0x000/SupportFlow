"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Headphones, LogOut, PlusCircle, Sparkles, Ticket, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { CurrentMember } from "@/lib/types";
import { cn, titleCase } from "@/lib/utils";

export function DashboardSidebar({ member }: { member: CurrentMember }) {
  const pathname = usePathname();
  const staff = member.role !== "customer";
  const links = staff
    ? [
        { href: "/dashboard", label: "Overview", icon: BarChart3 },
        { href: "/dashboard/tickets", label: "Tickets", icon: Ticket },
        ...(member.role === "admin" ? [{ href: "/dashboard/team", label: "Team", icon: Users }] : []),
      ]
    : [
        { href: "/customer/tickets", label: "My tickets", icon: Ticket },
        { href: "/customer/tickets/new", label: "Create ticket", icon: PlusCircle },
      ];

  async function logout() {
    await createClient().auth.signOut();
    window.location.assign("/login");
  }

  const active = (href: string) => pathname === href || (href.includes("tickets") && pathname.startsWith(`${href}/`));
  const initials = member.fullName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  return (
    <aside className="relative z-30 flex w-full flex-col overflow-hidden border-b border-white/10 bg-[#0b1020] text-white shadow-2xl shadow-slate-950/20 lg:fixed lg:inset-y-0 lg:w-72 lg:border-b-0 lg:border-r">
      <div className="pointer-events-none absolute -left-24 top-12 h-56 w-56 rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="relative flex h-20 items-center gap-3 border-b border-white/[0.06] px-5 lg:px-6">
        <span className="rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-2.5 shadow-lg shadow-indigo-500/25"><Headphones className="h-5 w-5" /></span>
        <div><span className="block text-lg font-bold tracking-tight">SupportFlow</span><span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-300"><Sparkles className="h-2.5 w-2.5" />Support workspace</span></div>
      </div>
      <nav className="relative flex gap-1.5 overflow-x-auto px-3 py-3 lg:flex-1 lg:flex-col lg:px-4 lg:py-6">
        <p className="mb-2 hidden px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600 lg:block">Workspace</p>
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={cn("group relative flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-white", active(href) && "bg-gradient-to-r from-indigo-500/20 to-violet-500/10 text-white ring-1 ring-inset ring-indigo-400/20")}>
            <span className={cn("absolute inset-y-2 left-0 w-0.5 rounded-full bg-indigo-400 opacity-0", active(href) && "opacity-100")} />
            <Icon className={cn("h-[18px] w-[18px] transition group-hover:text-indigo-300", active(href) && "text-indigo-300")} />{label}
          </Link>
        ))}
        <button onClick={logout} className="flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-white lg:hidden"><LogOut className="h-[18px] w-[18px]" />Sign out</button>
      </nav>
      <div className="relative hidden p-4 lg:block">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.05] p-3.5 backdrop-blur">
          <div className="flex items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-violet-600 text-xs font-bold shadow-lg shadow-indigo-950/40">{initials}</span><div className="min-w-0"><p className="truncate text-sm font-semibold">{member.fullName}</p><p className="truncate text-[11px] text-slate-400">{member.organizationName}</p></div></div>
          <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-3"><span className="rounded-full bg-indigo-400/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-300">{titleCase(member.role)}</span><button onClick={logout} aria-label="Sign out" className="rounded-lg p-2 text-slate-500 transition hover:bg-white/[0.07] hover:text-white"><LogOut className="h-4 w-4" /></button></div>
        </div>
      </div>
    </aside>
  );
}
