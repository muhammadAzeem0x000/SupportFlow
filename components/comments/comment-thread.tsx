"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Send, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { CommentRecord } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

type ConnectionState = "connecting" | "live" | "recovering" | "offline";

export function CommentThread({ ticketId, initialComments, currentUserId }: { ticketId: string; initialComments: CommentRecord[]; currentUserId: string }) {
  const [comments, setComments] = useState(initialComments);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [connection, setConnection] = useState<ConnectionState>("connecting");

  useEffect(() => {
    const supabase = createClient();
    let disposed = false;
    let channel: ReturnType<typeof supabase.channel> | undefined;

    const markOnline = () => setConnection((current) => current === "live" ? current : "recovering");
    const markOffline = () => setConnection("offline");
    window.addEventListener("online", markOnline);
    window.addEventListener("offline", markOffline);

    async function connect() {
      const { data: { session } } = await supabase.auth.getSession();
      if (disposed) return;
      if (!session?.access_token) { setConnection("offline"); return; }

      await supabase.realtime.setAuth(session.access_token);
      if (disposed) return;

      channel = supabase
        .channel(`ticket:${ticketId}:comments`, { config: { private: true } })
        .on("broadcast", { event: "INSERT" }, async (message) => {
          const incoming = message.payload as Omit<CommentRecord, "author">;
          const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", incoming.author_id).maybeSingle();
          if (!disposed) setComments((current) => current.some((item) => item.id === incoming.id) ? current : [...current, { ...incoming, author: profile }]);
        })
        .subscribe((status) => {
          if (disposed) return;
          if (status === "SUBSCRIBED") setConnection("live");
          else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") setConnection(navigator.onLine ? "recovering" : "offline");
          else if (status === "CLOSED") setConnection(navigator.onLine ? "recovering" : "offline");
        });
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.access_token) queueMicrotask(() => void supabase.realtime.setAuth(session.access_token));
    });
    void connect();

    return () => {
      disposed = true;
      window.removeEventListener("online", markOnline);
      window.removeEventListener("offline", markOffline);
      authListener.subscription.unsubscribe();
      if (channel) void supabase.removeChannel(channel);
    };
  }, [ticketId]);

  async function send(event: React.FormEvent) {
    event.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    const response = await fetch(`/api/tickets/${ticketId}/comments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body }) });
    const result = await response.json() as { comment?: CommentRecord; error?: { message: string } };
    if (!response.ok) { toast.error(result.error?.message ?? "Comment could not be sent."); setSending(false); return; }
    if (result.comment) setComments((current) => current.some((item) => item.id === result.comment!.id) ? current : [...current, { ...result.comment!, author: { full_name: "You" } }]);
    setBody("");
    setSending(false);
  }

  const connectionMeta = {
    live: { label: "Live", icon: Wifi, className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
    connecting: { label: "Connecting", icon: RefreshCw, className: "bg-slate-50 text-slate-600 ring-slate-200" },
    recovering: { label: "Reconnecting", icon: RefreshCw, className: "bg-amber-50 text-amber-700 ring-amber-200" },
    offline: { label: "Offline", icon: WifiOff, className: "bg-rose-50 text-rose-700 ring-rose-200" },
  }[connection];
  const ConnectionIcon = connectionMeta.icon;

  return <section className="overflow-hidden rounded-2xl border border-white/80 bg-white/90 shadow-[0_12px_40px_rgba(15,23,42,0.07)] backdrop-blur">
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-white to-indigo-50/40 p-5"><div><h2 className="font-semibold text-slate-900">Conversation</h2><p className="mt-1 text-xs text-slate-500">Replies from everyone with access to this ticket.</p></div><span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset", connectionMeta.className)}><ConnectionIcon className={cn("h-3 w-3", (connection === "connecting" || connection === "recovering") && "animate-spin")} />{connectionMeta.label}</span></div>
    {connection !== "live" && <div className="border-b border-amber-100 bg-amber-50/60 px-5 py-2.5 text-xs text-amber-800">Live updates are reconnecting automatically. You can still send replies normally.</div>}
    <div className="max-h-[36rem] space-y-5 overflow-y-auto bg-slate-50/40 p-5 sm:p-6">{comments.length === 0 && <p className="py-10 text-center text-sm text-slate-400">No replies yet. Start the conversation below.</p>}{comments.map((comment) => { const own = comment.author_id === currentUserId; return <div key={comment.id} className={cn("flex", own ? "justify-end" : "justify-start")}><div className={cn("max-w-[88%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[78%]", own ? "rounded-br-md bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-indigo-500/15" : "rounded-bl-md border border-slate-200/80 bg-white text-slate-800")}><div className="mb-1.5 flex items-center gap-2 text-[11px] opacity-70"><span className="font-bold">{comment.author?.full_name ?? "SupportFlow user"}</span><span>·</span><time>{formatDate(comment.created_at)}</time></div><p className="whitespace-pre-wrap text-sm leading-6">{comment.body}</p></div></div>; })}</div>
    <form onSubmit={send} className="border-t border-slate-100 bg-white p-4 sm:p-5"><textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={3000} rows={3} className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 text-sm leading-6 placeholder:text-slate-400" placeholder="Write a helpful reply..." /><div className="mt-3 flex items-center justify-between"><span className="text-xs font-medium text-slate-400">{body.length}/3000</span><Button disabled={sending || !body.trim()}>{sending ? "Sending..." : <><Send className="mr-2 h-4 w-4" />Send reply</>}</Button></div></form>
  </section>;
}
