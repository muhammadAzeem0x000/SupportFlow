import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentMember } from "@/lib/auth/current-member";

const productNotes = [
  "Tenant boundaries enforced in PostgreSQL",
  "Role-specific ticket workflows",
  "Private files and live conversations",
];

export default async function LoginPage() {
  const member = await getCurrentMember();
  if (member?.isActive) redirect(member.role === "customer" ? "/customer/tickets" : "/dashboard");

  return (
    <main className="grid min-h-screen bg-[#f5f4f0] lg:grid-cols-[minmax(30rem,.88fr)_minmax(34rem,1.12fr)]">
      <section className="login-grid relative hidden min-h-screen flex-col justify-between overflow-hidden bg-[#111927] p-12 text-white lg:flex xl:p-16">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center border border-white/30 text-xs font-bold tracking-tight">SF</span>
          <div><p className="text-sm font-semibold tracking-wide">SupportFlow</p><p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Ticket operations</p></div>
        </div>

        <div className="max-w-xl">
          <p className="mb-5 font-mono text-xs uppercase tracking-[0.18em] text-[#8da4ff]">Built for the handoff</p>
          <h1 className="text-5xl font-semibold leading-[1.06] tracking-[-0.045em] xl:text-6xl">One queue.<br />Clear ownership.</h1>
          <p className="mt-7 max-w-lg text-base leading-7 text-slate-400">A compact support desk for teams that need the customer, the conversation, and the next action in one place.</p>
        </div>

        <div className="grid border-y border-white/10 sm:grid-cols-3">
          {productNotes.map((note, index) => <div key={note} className="border-white/10 py-4 pr-4 sm:border-r sm:px-4 sm:first:pl-0 sm:last:border-r-0"><span className="mb-3 block font-mono text-[10px] text-slate-600">0{index + 1}</span><p className="text-xs leading-5 text-slate-400">{note}</p></div>)}
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="w-full max-w-lg">
          <div className="mb-12 flex items-center gap-3 lg:hidden"><span className="flex h-9 w-9 items-center justify-center bg-[#111927] text-xs font-bold text-white">SF</span><span className="font-semibold">SupportFlow</span></div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#3157d5]">Workspace access</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-[#18202b]">Sign in to continue</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">Choose a demo role or enter the credentials manually.</p>
          <div className="my-8 border-y border-[#deded8] py-6">
            <LoginForm />
          </div>
          <div className="flex items-start gap-2.5 text-xs leading-5 text-slate-500"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" /><p>Demo password: <code className="font-mono text-slate-700">SupportFlowDemo2026!</code></p></div>
        </div>
      </section>
    </main>
  );
}
