"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Bot, Loader2, Send, ShieldCheck, Sparkles } from "lucide-react";

type ChatMessage = { id: string; role: "assistant" | "user"; content: string; pending?: boolean };

const starter: ChatMessage[] = [
  { id: "ai-welcome", role: "assistant", content: "Hello — I'm King Sparkon AI. I can help with barcode scanning, tickets, products, jobs, tips, affiliates, and your dashboard. How can I help today?" },
];

const quickActions = ["Barcode tracking", "QR ticket support", "Owner features", "Dev Hub help"] as const;
const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");

export function KingSparkonAIWorkspace() {
  const [messages, setMessages] = useState<ChatMessage[]>(starter);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [conversationId, setConversationId] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);
  const hasUser = useMemo(() => messages.some((m) => m.role === "user"), [messages]);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("king-sparkon-chatbot-conversation-id") : null;
    if (stored) setConversationId(stored);
    else {
      // eslint-disable-next-line react-hooks/purity -- stable id generation on mount, not during render
      const id = `kst-ui-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setConversationId(id);
      if (typeof window !== "undefined") window.localStorage.setItem("king-sparkon-chatbot-conversation-id", id);
    }
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    // eslint-disable-next-line react-hooks/purity -- id generation for chat messages on user action, not render
    const userId = `m-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    // eslint-disable-next-line react-hooks/purity -- id generation for pending message
    const pendingId = `m-${Date.now()}-${Math.random().toString(36).slice(2)}-p`;
    setMessages((m) => [...m, { id: userId, role: "user", content: trimmed }, { id: pendingId, role: "assistant", content: "Thinking with King Sparkon AI...", pending: true }]);
    setInput("");
    setError("");
    setSending(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message: trimmed, currentPage: typeof window !== "undefined" ? window.location.pathname : "/", userPrivilege: "GUEST", history: messages.filter((x) => !x.pending).slice(-12).map((x) => ({ role: x.role, content: x.content })) }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { answer?: string; conversationId?: string };
      const answer = data.answer?.trim() || "King Sparkon AI could not reach the backend right now. Please try again.";
      const nextId = data.conversationId || conversationId;
      setConversationId(nextId);
      if (typeof window !== "undefined") window.localStorage.setItem("king-sparkon-chatbot-conversation-id", nextId);
      setMessages((m) => m.map((x) => (x.id === pendingId ? { id: pendingId, role: "assistant", content: answer } : x)));
    } catch {
      setError("Backend unavailable. Try again or use contact support.");
      setMessages((m) => m.map((x) => (x.id === pendingId ? { id: pendingId, role: "assistant", content: "King Sparkon Assistant could not reach the backend right now. Please try again." } : x)));
    } finally {
      setSending(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void sendMessage(input);
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--signal-soft)] p-4 shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--ink)] text-white">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--signal-strong)]">King Sparkon AI</p>
            <p className="text-sm font-black">Dashboard assistant — no overlay, full visibility</p>
          </div>
          <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-[var(--line)] bg-white px-2.5 py-1 text-xs font-black text-[var(--steel)]">
            <ShieldCheck className="h-3 w-3 text-[var(--signal)]" /> AI support
          </span>
        </div>
        <p className="mt-3 text-sm leading-6 text-[var(--steel)]">Ask about scanning, products, tickets, jobs, SASSA/UIF, or your dashboard. This workspace replaces the floating widget so information stays visible.</p>
      </div>

      <div className="flex min-h-[28rem] flex-col rounded-2xl border border-[var(--line)] bg-white p-3 shadow-[var(--shadow-soft)] md:p-4">
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[86%] rounded-[1.15rem] px-3.5 py-2.5 text-sm leading-6 shadow-[var(--shadow-soft)] ${m.role === "user" ? "rounded-br-md bg-[var(--signal)] text-white" : "rounded-bl-md border border-[var(--line)] bg-white text-[var(--ink)]"}`}>
                <span className="inline-flex items-center gap-2">{m.pending ? <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--signal)]" /> : null}{m.content}</span>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {error ? <div className="mt-3 rounded-xl border border-[var(--danger)]/20 bg-[var(--danger)]/5 px-3 py-2 text-xs font-bold text-[var(--danger)]">{error}</div> : null}

        {!hasUser ? (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {quickActions.map((a) => (
              <button key={a} type="button" disabled={sending} onClick={() => void sendMessage(a)} className="shrink-0 rounded-full border border-[var(--line)] bg-white px-3 py-2 text-xs font-bold text-[var(--steel)] hover:border-[var(--signal)] hover:text-[var(--ink)] disabled:opacity-60">
                {a}
              </button>
            ))}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-3 flex items-center gap-2 rounded-full border border-[var(--line-strong)] bg-white p-1.5 shadow-[var(--shadow-soft)]">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={sending ? "King Sparkon AI is thinking..." : "Ask about scanning, tickets..."} disabled={sending} className="min-h-10 flex-1 rounded-full border-0 bg-transparent px-3 text-sm font-semibold outline-none placeholder:text-[var(--muted)]" />
          <button type="submit" disabled={sending || !input.trim()} className="grid h-10 w-10 place-items-center rounded-full bg-[var(--signal)] text-white hover:bg-[var(--signal-strong)] disabled:opacity-60">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
      </div>

      <p className="text-center text-xs font-semibold text-[var(--muted)]">
        AI is in the left sidebar as <span className="font-black text-[var(--ink)]">King Sparkon AI</span> <Sparkles className="inline h-3 w-3 text-[var(--signal)]" /> — no floating overlay hiding content.
      </p>
    </div>
  );
}
