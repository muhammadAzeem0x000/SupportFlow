import { titleCase } from "@/lib/utils";

interface TicketChartsProps {
  status: Record<string, number>;
  priority: Record<string, number>;
}

const priorityColors: Record<string, string> = {
  urgent: "bg-rose-500",
  high: "bg-amber-500",
  medium: "bg-blue-500",
  low: "bg-slate-400",
};

export function TicketCharts({ status, priority }: TicketChartsProps) {
  const statusData = Object.entries(status);
  const priorityData = Object.entries(priority);
  const statusMax = Math.max(1, ...statusData.map(([, value]) => value));
  const priorityTotal = priorityData.reduce((total, [, value]) => total + value, 0);

  return (
    <div className="grid gap-4 lg:grid-cols-[1.45fr_.55fr]">
      <section className="border border-[#deded8] bg-white p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
          Workload
        </p>
        <h2 className="mt-1 font-semibold">Tickets by status</h2>
        <div className="mt-7 space-y-5">
          {statusData.map(([name, value]) => (
            <div key={name} className="grid grid-cols-[7rem_1fr_2rem] items-center gap-3">
              <span className="text-sm text-slate-600">{titleCase(name)}</span>
              <div className="h-2 bg-slate-100">
                <div
                  className="h-full bg-[#3157d5]"
                  style={{ width: `${(value / statusMax) * 100}%` }}
                />
              </div>
              <span className="text-right font-mono text-xs font-semibold text-slate-700">
                {value}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="border border-[#deded8] bg-white p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
          Mix
        </p>
        <div className="mt-1 flex items-end justify-between">
          <h2 className="font-semibold">Priority</h2>
          <span className="font-mono text-2xl font-semibold text-slate-900">
            {priorityTotal}
          </span>
        </div>
        <div className="mt-6 divide-y divide-slate-100 border-y border-slate-100">
          {priorityData.map(([name, value]) => (
            <div key={name} className="flex items-center gap-3 py-3">
              <span
                className={`h-2.5 w-2.5 ${priorityColors[name] ?? "bg-slate-400"}`}
              />
              <span className="text-sm text-slate-600">{titleCase(name)}</span>
              <span className="ml-auto font-mono text-xs font-semibold text-slate-700">
                {value}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
