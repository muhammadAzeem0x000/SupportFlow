"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Headphones, LogOut, PlusCircle, Ticket, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { CurrentMember } from "@/lib/types";
import { cn, titleCase } from "@/lib/utils";

export function DashboardSidebar({ member }: { member: CurrentMember }) {
  const pathname=usePathname();
  const staff = member.role !== "customer";
  const links = staff ? [{href:"/dashboard",label:"Overview",icon:BarChart3},{href:"/dashboard/tickets",label:"Tickets",icon:Ticket},...(member.role === "admin" ? [{href:"/dashboard/team",label:"Team",icon:Users}] : [])] : [{href:"/customer/tickets",label:"My tickets",icon:Ticket},{href:"/customer/tickets/new",label:"Create ticket",icon:PlusCircle}];
  async function logout(){ await createClient().auth.signOut(); window.location.assign("/login"); }
  return <aside className="flex w-full flex-col border-b border-slate-200 bg-slate-950 text-white lg:fixed lg:inset-y-0 lg:w-64 lg:border-b-0 lg:border-r lg:border-slate-800">
    <div className="flex h-16 items-center gap-3 px-5"><span className="rounded-xl bg-indigo-500 p-2"><Headphones className="h-5 w-5"/></span><span className="text-lg font-bold">SupportFlow</span></div>
    <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:py-4">{links.map(({href,label,icon:Icon})=><Link key={href} href={href} className={cn("flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white", pathname===href || (href.includes("tickets") && pathname.startsWith(href+"/")) ? "bg-indigo-500/20 text-indigo-200" : "")}><Icon className="h-4 w-4"/>{label}</Link>)}</nav>
    <div className="hidden border-t border-slate-800 p-4 lg:block"><p className="truncate text-sm font-semibold">{member.fullName}</p><p className="truncate text-xs text-slate-400">{member.organizationName} · {titleCase(member.role)}</p><button onClick={logout} className="mt-4 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"><LogOut className="h-4 w-4"/>Sign out</button></div>
  </aside>;
}
