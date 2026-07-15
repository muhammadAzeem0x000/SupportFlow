"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LoginForm(){ const [loading,setLoading]=useState(false); const [error,setError]=useState("");
  async function submit(event:React.FormEvent<HTMLFormElement>){ event.preventDefault(); setLoading(true); setError(""); const form=new FormData(event.currentTarget); const res=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:String(form.get("email")),password:String(form.get("password"))})}); const body=(await res.json()) as {destination?:string;error?:{message:string}}; if(!res.ok||!body.destination){setError(body.error?.message??"The email or password is incorrect.");setLoading(false);return;} window.location.assign(body.destination); }
  return <form onSubmit={submit} className="space-y-5"><label className="block"><span className="mb-2 block text-sm font-medium">Email</span><input name="email" type="email" required autoComplete="email" className="h-12 w-full rounded-xl border border-slate-300 px-4 shadow-sm" placeholder="admin@acme.demo"/></label><label className="block"><span className="mb-2 block text-sm font-medium">Password</span><input name="password" type="password" required autoComplete="current-password" className="h-12 w-full rounded-xl border border-slate-300 px-4 shadow-sm" placeholder="••••••••"/></label>{error&&<p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}<Button disabled={loading} className="h-12 w-full">{loading?<><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Signing in…</>:"Sign in to SupportFlow"}</Button></form>;
}
