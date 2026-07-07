"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Barcode, Bot, Crown, Loader2, MessageCircle, Send, ShieldCheck, Sparkles, X, Zap } from "lucide-react";

type ChatRole = "assistant" | "user";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  pending?: boolean;
};

type AiChatApiResponse = {
  conversationId?: string;
  answer?: string;
  suggestions?: string[];
};

const starterMessages: ChatMessage[] = [
  {
    id: "assistant-welcome",
    role: "assistant",
    content:
      "Welcome to King Sparkon Tracker™. I can help with barcode tracking, QR tickets, owner dashboards, jobs, affiliates, Dev Hub, QA, and cloud maintenance.",
  },
];

const defaultQuickActions = [
  "Barcode tracking",
  "QR ticket support",
  "Owner features",
  "Dev Hub help",
] as const;

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");
const conversationStorageKey = "king-sparkon-chatbot-conversation-id";

const createMessageId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `message-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const createConversationId = () => `kst-ui-${createMessageId()}`;

const getStoredConversationId = () => {
  if (typeof window === "undefined") {
    return createConversationId();
  }

  const storedConversationId = window.localStorage.getItem(conversationStorageKey);
  if (storedConversationId) {
    return storedConversationId;
  }

  const conversationId = createConversationId();
  window.localStorage.setItem(conversationStorageKey, conversationId);
  return conversationId;
};

const fallbackAssistantReply =
  "King Sparkon Assistant is having trouble reaching the AI backend right now. Please try again, or use the contact section for urgent implementation support.";

export function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages);
  const [inputValue, setInputValue] = useState("");
  const [conversationId, setConversationId] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([...defaultQuickActions]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const hasUserMessages = useMemo(() => messages.some((message) => message.role === "user"), [messages]);

  useEffect(() => {
    setConversationId(getStoredConversationId());
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [isOpen, messages]);

  const sendMessage = async (message: string) => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || isSending) {
      return;
    }

    const activeConversationId = conversationId || getStoredConversationId();
    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content: trimmedMessage,
    };
    const pendingMessageId = createMessageId();
    const pendingMessage: ChatMessage = {
      id: pendingMessageId,
      role: "assistant",
      content: "Thinking with King Sparkon AI...",
      pending: true,
    };
    const history = messages
      .filter((chatMessage) => !chatMessage.pending)
      .slice(-12)
      .map((chatMessage) => ({ role: chatMessage.role, content: chatMessage.content }));

    setMessages((currentMessages) => [...currentMessages, userMessage, pendingMessage]);
    setInputValue("");
    setErrorMessage("");
    setIsOpen(true);
    setIsSending(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId: activeConversationId,
          message: trimmedMessage,
          currentPage: typeof window === "undefined" ? "/" : window.location.pathname,
          userPrivilege: "GUEST",
          history,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI request failed with status ${response.status}`);
      }

      const data = (await response.json()) as AiChatApiResponse;
      const nextConversationId = data.conversationId || activeConversationId;
      const answer = data.answer?.trim() || fallbackAssistantReply;

      setConversationId(nextConversationId);
      window.localStorage.setItem(conversationStorageKey, nextConversationId);
      setSuggestions(data.suggestions?.length ? data.suggestions.slice(0, 4) : [...defaultQuickActions]);
      setMessages((currentMessages) =>
        currentMessages.map((chatMessage) =>
          chatMessage.id === pendingMessageId
            ? { id: pendingMessageId, role: "assistant", content: answer }
            : chatMessage,
        ),
      );
    } catch (error) {
      console.error("King Sparkon chatbot request failed", error);
      setErrorMessage("AI backend unavailable. Check backend/Ollama config and try again.");
      setMessages((currentMessages) =>
        currentMessages.map((chatMessage) =>
          chatMessage.id === pendingMessageId
            ? { id: pendingMessageId, role: "assistant", content: fallbackAssistantReply }
            : chatMessage,
        ),
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(inputValue);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[90] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {isOpen ? (
        <section
          aria-label="King Sparkon Tracker chatbot"
          className="fixed bottom-20 left-3 right-3 flex max-h-[calc(100dvh-6rem)] flex-col overflow-hidden rounded-[1.55rem] border border-white/70 bg-white shadow-[0_34px_120px_rgba(7,19,31,0.24)] ring-1 ring-[var(--line)] sm:bottom-24 sm:left-auto sm:right-6 sm:max-h-[calc(100dvh-7rem)] sm:w-[390px] sm:rounded-[1.85rem]"
        >
          <div className="relative shrink-0 overflow-hidden bg-[var(--ink)] px-4 py-3.5 text-white sm:px-5 sm:py-4">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -right-16 -top-20 h-44 w-44 rounded-full bg-[var(--gold)]/25 blur-3xl" />
              <div className="absolute -bottom-24 left-12 h-48 w-48 rounded-full bg-[var(--ember)]/25 blur-3xl" />
              <div className="absolute inset-x-5 bottom-0 h-px bg-gradient-to-r from-transparent via-[var(--gold)]/70 to-transparent" />
            </div>

            <div className="relative flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/[0.14] bg-white/10 shadow-[var(--shadow-soft)] sm:h-11 sm:w-11">
                  <Crown className="absolute -top-2 h-4 w-4 fill-[var(--gold)] text-[var(--gold)]" />
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-[0.58rem] font-black uppercase tracking-[0.22em] text-[var(--gold)]">AI support</p>
                  <h2 className="truncate text-base font-black tracking-[-0.04em] sm:text-lg">King Sparkon Assistant</h2>
                  <p className="mt-0.5 truncate text-[0.72rem] font-semibold text-white/[0.58]">Backend AI connected</p>
                </div>
              </div>

              <button
                type="button"
                aria-label="Close chatbot"
                onClick={() => setIsOpen(false)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/12 bg-white/[0.08] text-white/70 hover:bg-white/[0.14] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col bg-[linear-gradient(180deg,#ffffff_0%,#f7fafc_100%)] p-3 sm:p-4">
            <div className="mb-3 grid shrink-0 grid-cols-3 gap-2">
              <div className="rounded-2xl border border-[var(--line)] bg-white px-3 py-2 shadow-[var(--shadow-soft)]">
                <Barcode className="h-3.5 w-3.5 text-[var(--signal)]" />
                <p className="mt-1 text-[0.58rem] font-black uppercase tracking-[0.12em] text-[var(--steel)]">Scan</p>
              </div>
              <div className="rounded-2xl border border-[var(--line)] bg-white px-3 py-2 shadow-[var(--shadow-soft)]">
                <ShieldCheck className="h-3.5 w-3.5 text-[var(--confirm)]" />
                <p className="mt-1 text-[0.58rem] font-black uppercase tracking-[0.12em] text-[var(--steel)]">Verify</p>
              </div>
              <div className="rounded-2xl border border-[var(--line)] bg-white px-3 py-2 shadow-[var(--shadow-soft)]">
                <Zap className="h-3.5 w-3.5 text-[var(--ember)]" />
                <p className="mt-1 text-[0.58rem] font-black uppercase tracking-[0.12em] text-[var(--steel)]">Act</p>
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[86%] rounded-[1.15rem] px-3.5 py-2.5 text-[0.82rem] leading-5 shadow-[var(--shadow-soft)] sm:max-w-[82%] sm:text-sm sm:leading-6 ${
                      message.role === "user"
                        ? "rounded-br-md bg-[var(--signal)] text-white"
                        : "rounded-bl-md border border-[var(--line)] bg-white text-[var(--ink)]"
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      {message.pending ? <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--gold)]" /> : null}
                      {message.content}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {errorMessage ? (
              <div className="mt-3 shrink-0 rounded-2xl border border-[var(--danger)]/20 bg-[var(--danger)]/5 px-3 py-2 text-[0.72rem] font-bold text-[var(--danger)]">
                {errorMessage}
              </div>
            ) : null}

            {!hasUserMessages ? (
              <div className="mt-3 flex shrink-0 gap-2 overflow-x-auto pb-1">
                {suggestions.map((action) => (
                  <button
                    key={action}
                    type="button"
                    disabled={isSending}
                    onClick={() => void sendMessage(action)}
                    className="shrink-0 rounded-full border border-[var(--line)] bg-white px-3 py-2 text-left text-[0.72rem] font-bold text-[var(--steel)] shadow-[var(--shadow-soft)] hover:border-[var(--gold)] hover:text-[var(--ink)] disabled:opacity-60"
                  >
                    {action}
                  </button>
                ))}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-3 flex shrink-0 items-center gap-2 rounded-full border border-[var(--line-strong)] bg-white p-1.5 shadow-[var(--shadow-soft)]">
              <input
                type="text"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder={isSending ? "King Sparkon AI is thinking..." : "Ask about scanning, tickets..."}
                aria-label="Chatbot message"
                disabled={isSending}
                className="min-h-10 flex-1 rounded-full border-0 bg-transparent px-3 text-sm font-semibold text-[var(--ink)] outline-none placeholder:text-[var(--muted)] disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                aria-label="Send chatbot message"
                disabled={isSending || !inputValue.trim()}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--gold)] text-[var(--ink)] shadow-[var(--shadow-soft)] hover:bg-[var(--ember)] hover:text-white disabled:opacity-60"
              >
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </form>
          </div>
        </section>
      ) : null}

      <button
        type="button"
        aria-label={isOpen ? "Close King Sparkon chatbot" : "Open King Sparkon chatbot"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        className="group relative inline-flex min-h-14 items-center gap-3 rounded-full border border-white/70 bg-[var(--ink)] px-3.5 pr-4 text-white shadow-[0_24px_80px_rgba(7,19,31,0.28)] ring-1 ring-[var(--gold)]/30 hover:bg-[var(--signal)] sm:min-h-16 sm:px-4 sm:pr-5"
      >
        <span className="absolute -left-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--gold)] text-[0.58rem] font-black text-[var(--ink)] ring-4 ring-white">
          AI
        </span>
        <span className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-[var(--gold)] group-hover:text-white sm:h-11 sm:w-11">
          {isOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        </span>
        <span className="hidden text-left sm:block">
          <span className="flex items-center gap-1.5 text-sm font-black tracking-[-0.03em]">
            Open chatbot <Sparkles className="h-3.5 w-3.5 text-[var(--gold)]" />
          </span>
          <span className="block text-[0.68rem] font-bold uppercase tracking-[0.14em] text-white/[0.48]">Right-bottom support</span>
        </span>
      </button>
    </div>
  );
}
