"use client";

import { useRef, useState } from "react";
import { File, Paperclip, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { validateAttachment } from "@/lib/validation/tickets";

type Attachment = { id: string; original_filename: string; size_bytes: number };
export function AttachmentList({ ticketId, initial }: { ticketId: string; initial: Attachment[] }) {
  const [items, setItems] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [selectedName, setSelectedName] = useState("");
  const input = useRef<HTMLInputElement>(null);
  async function upload() {
    const file = input.current?.files?.[0];
    if (!file) return;
    const issue = validateAttachment(file); if (issue) { toast.error(issue); return; }
    setUploading(true);
    const form = new FormData(); form.set("file", file);
    const response = await fetch(`/api/tickets/${ticketId}/attachments`, { method: "POST", body: form });
    const result = await response.json() as { attachment?: Attachment; error?: { message: string } };
    if (!response.ok || !result.attachment) toast.error(result.error?.message ?? "Upload failed.");
    else { setItems((current) => [...current, result.attachment!]); toast.success("Attachment uploaded"); if (input.current) input.current.value = ""; setSelectedName(""); }
    setUploading(false);
  }
  return <section className="overflow-hidden border border-[#deded8] bg-white"><div className="flex items-center justify-between border-b border-[#deded8] p-5"><div><h2 className="font-semibold text-slate-900">Attachments</h2><p className="mt-1 text-xs text-slate-500">Private files with secure links</p></div><Paperclip className="h-4 w-4 text-slate-400" /></div><div className="space-y-2 p-5">{items.length === 0 && <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 py-6 text-center text-sm text-slate-400">No files attached yet.</div>}{items.map((item) => <a key={item.id} target="_blank" href={`/api/tickets/${ticketId}/attachments/${item.id}`} className="group flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm transition hover:border-[#3157d5] hover:bg-blue-50/40"><span className="bg-slate-100 p-2 text-slate-500 transition group-hover:text-[#3157d5]"><File className="h-4 w-4" /></span><span className="min-w-0 flex-1 truncate font-medium text-slate-700">{item.original_filename}</span><span className="text-[11px] font-medium text-slate-400">{Math.ceil(item.size_bytes / 1024)} KB</span></a>)}</div><div className="border-t border-[#deded8] bg-[#fafaf8] p-4"><input ref={input} type="file" accept=".png,.jpg,.jpeg,.pdf,.txt" onChange={(event) => setSelectedName(event.target.files?.[0]?.name ?? "")} className="sr-only" /><button type="button" onClick={() => input.current?.click()} className="mb-3 flex w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2.5 text-xs font-semibold text-slate-500 transition hover:border-[#3157d5] hover:text-[#3157d5]">{selectedName || "Choose a file"}</button><Button type="button" disabled={uploading || !selectedName} onClick={upload} className="w-full"><Upload className="mr-2 h-4 w-4" />{uploading ? "Uploading..." : "Upload attachment"}</Button></div></section>;
}
