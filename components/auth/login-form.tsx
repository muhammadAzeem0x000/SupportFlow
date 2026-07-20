"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const demoAccounts = [
  { label: "Admin", email: "admin@acme.demo" },
  { label: "Agent", email: "agent@acme.demo" },
  { label: "Customer", email: "customer@acme.demo" },
];

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function selectDemoAccount(accountEmail: string) {
    setEmail(accountEmail);
    setPassword("SupportFlowDemo2026!");
    setError("");
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const body = (await response.json()) as { destination?: string; error?: { message: string } };
    if (!response.ok || !body.destination) {
      setError(body.error?.message ?? "The email or password is incorrect.");
      setLoading(false);
      return;
    }
    window.location.assign(body.destination);
  }

  return (
    <form onSubmit={submit}>
      <fieldset className="mb-6">
        <legend className="mb-2 text-xs font-medium text-slate-500">Quick demo access</legend>
        <div className="grid grid-cols-3 border border-[#d8d9d4] bg-white">
          {demoAccounts.map((account) => <button key={account.email} type="button" onClick={() => selectDemoAccount(account.email)} className="border-r border-[#d8d9d4] px-3 py-2.5 text-xs font-semibold text-slate-600 transition-colors last:border-r-0 hover:bg-[#eef2ff] hover:text-[#2444b4]">{account.label}</button>)}
        </div>
      </fieldset>

      <div className="space-y-5">
        <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Email</span><input name="email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 w-full rounded-lg border border-[#d8d9d4] bg-white px-3.5 text-sm" placeholder="admin@acme.demo" /></label>
        <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Password</span><input name="password" type="password" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 w-full rounded-lg border border-[#d8d9d4] bg-white px-3.5 text-sm" placeholder="Enter password" /></label>
        {error && <p role="alert" className="border-l-2 border-rose-500 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">{error}</p>}
        <Button disabled={loading} className="h-11 w-full">{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</> : "Sign in"}</Button>
      </div>
    </form>
  );
}
