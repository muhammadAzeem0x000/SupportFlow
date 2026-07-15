import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { requireMember } from "@/lib/auth/current-member";
export default async function CustomerLayout({children}:{children:React.ReactNode}){ const member=await requireMember(["customer"]); return <div className="min-h-screen"><DashboardSidebar member={member}/><main className="px-4 py-7 sm:px-7 lg:ml-72 lg:px-10 lg:py-10"><div className="mx-auto max-w-[95rem]">{children}</div></main></div>; }
