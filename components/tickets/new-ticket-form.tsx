"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { FileUp, Send } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select";
import { CATEGORIES, PRIORITIES } from "@/lib/types";
import { titleCase } from "@/lib/utils";
import { ticketInputSchema, validateAttachment } from "@/lib/validation/tickets";

type Input = z.infer<typeof ticketInputSchema>;
export function NewTicketForm() {
  const [file, setFile] = useState<File | null>(null);
  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<Input>({ resolver: zodResolver(ticketInputSchema), defaultValues: { category: "technical", priority: "medium" } });
  async function submit(input: Input) {
    if (file) { const issue = validateAttachment(file); if (issue) { toast.error(issue); return; } }
    const response = await fetch("/api/tickets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
    const body = await response.json() as { ticket?: { id: string }; error?: { message: string } };
    if (!response.ok || !body.ticket) { toast.error(body.error?.message ?? "Ticket creation failed."); return; }
    if (file) { const form = new FormData(); form.set("file", file); const upload = await fetch(`/api/tickets/${body.ticket.id}/attachments`, { method: "POST", body: form }); if (!upload.ok) toast.warning("Ticket created, but the attachment could not be uploaded."); }
    toast.success("Ticket created");
    window.location.assign(`/customer/tickets/${body.ticket.id}`);
  }
  const field = "h-12 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 text-sm text-slate-800 placeholder:text-slate-400";
  return <form onSubmit={handleSubmit(submit)} className="overflow-hidden rounded-3xl border border-white/80 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
    <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50/80 to-violet-50/60 px-6 py-5 sm:px-8"><p className="font-semibold text-slate-900">Tell us what happened</p><p className="mt-1 text-sm text-slate-500">Clear details help the team respond faster.</p></div>
    <div className="space-y-6 p-6 sm:p-8">
      <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-800">Title</span><input {...register("title")} className={field} placeholder="A short summary of the issue" />{errors.title && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.title.message}</p>}</label>
      <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-800">Description</span><textarea {...register("description")} rows={7} className="w-full rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-sm leading-6 text-slate-800 placeholder:text-slate-400" placeholder="What happened? What did you expect? Add any useful context." />{errors.description && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.description.message}</p>}</label>
      <div className="grid gap-5 sm:grid-cols-2"><label><span className="mb-2 block text-sm font-semibold text-slate-800">Category</span><Controller name="category" control={control} render={({ field }) => <SelectField ariaLabel="Category" value={field.value} onValueChange={field.onChange} options={CATEGORIES.map((value) => ({ value, label: titleCase(value) }))} />} /></label><label><span className="mb-2 block text-sm font-semibold text-slate-800">Priority</span><Controller name="priority" control={control} render={({ field }) => <SelectField ariaLabel="Priority" value={field.value} onValueChange={field.onChange} options={PRIORITIES.map((value) => ({ value, label: titleCase(value) }))} />} /></label></div>
      <label className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-4 transition hover:border-indigo-400 hover:bg-indigo-50/40"><span className="rounded-xl bg-white p-3 text-indigo-600 shadow-sm"><FileUp className="h-5 w-5" /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-slate-800">{file?.name ?? "Add an attachment"}</span><span className="mt-0.5 block text-xs text-slate-500">PNG, JPG, PDF or TXT up to 5 MB</span></span><input type="file" accept=".png,.jpg,.jpeg,.pdf,.txt" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="sr-only" /></label>
      <div className="flex justify-end border-t border-slate-100 pt-6"><Button disabled={isSubmitting} className="min-w-40">{isSubmitting ? "Creating..." : <><Send className="mr-2 h-4 w-4" />Create ticket</>}</Button></div>
    </div>
  </form>;
}
