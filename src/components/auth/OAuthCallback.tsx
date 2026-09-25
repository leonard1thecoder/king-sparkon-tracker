"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { oauthErrorMessage } from "@/lib/auth/oauth";

type CallbackState = { tone: "working" | "success" | "error"; message: string };

export function OAuthCallback({ code, errorCode }: { code?: string; errorCode?: string }) {
  const [state, setState] = useState<CallbackState>(() => {
    if (!code) {
      return {
        tone: "error",
        message: oauthErrorMessage(errorCode) ?? oauthErrorMessage("provider_error") ?? "The sign-in failed.",
      };
    }
    return { tone: "working", message: "Completing the secure sign-in..." };
  });
  const exchanged = useRef(false);

  useEffect(() => {
    if (!code || exchanged.current) return;
    exchanged.current = true;

    async function exchange() {
      try {
        const response = await fetch("/api/auth/oauth/exchange", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ code }),
        });
        if (!response.ok) {
          throw new Error("exchange failed");
        }
        setState({ tone: "success", message: "Signed in successfully. Opening your role dashboard." });
        window.setTimeout(() => {
          window.location.href = "/dashboard";
        }, 400);
      } catch {
        setState({
          tone: "error",
          message: oauthErrorMessage("exchange_failed") ?? "The sign-in could not be completed.",
        });
      }
    }

    exchange();
  }, [code]);

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[var(--surface)] px-5 text-[var(--ink)]">
      <div className="w-full max-w-md rounded-[2.25rem] border border-[var(--line)] bg-white/88 p-7 shadow-[var(--shadow-ledger)] backdrop-blur">
        <div aria-live="polite" role={state.tone === "error" ? "alert" : "status"} className="flex gap-3 text-sm font-semibold leading-6">
          {state.tone === "working" ? <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-[var(--signal)]" /> : null}
          {state.tone === "success" ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--confirm)]" /> : null}
          {state.tone === "error" ? <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--danger)]" /> : null}
          <span>{state.message}</span>
        </div>
        {state.tone === "error" ? (
          <p className="mt-5 text-sm font-bold text-[var(--steel)]">
            <Link href="/login" className="font-black text-[var(--signal)] hover:text-[var(--accent-hover)]">
              Back to sign in
            </Link>
          </p>
        ) : null}
      </div>
    </main>
  );
}
