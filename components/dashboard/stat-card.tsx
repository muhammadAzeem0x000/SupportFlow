import type { LucideIcon } from "lucide-react";

export function StatCard({ label, value, icon: Icon, tone = "indigo" }: { label: string; value: number; icon: LucideIcon; tone?: "indigo" | "amber" | "emerald" | "rose" }) {
  const tones = { indigo: "bg-[#3157d5]", amber: "bg-amber-500", emerald: "bg-emerald-600", rose: "bg-rose-600" };
  return <div className="border border-[#deded8] bg-white p-5"><div className="flex items-start justify-between"><span className={`mt-1 h-2 w-2 ${tones[tone]}`} /><Icon className="h-4 w-4 text-slate-400" /></div><p className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-[#18202b]">{value}</p><p className="mt-1 text-xs font-medium text-slate-500">{label}</p></div>;
}
