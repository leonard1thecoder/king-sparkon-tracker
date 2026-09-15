"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useConsent } from "./ConsentProvider";
import { cn } from "@/lib/utils/cn";

/**
 * Compact, non-intrusive consent banner. Rendered only after client mount
 * (never on the server) so it cannot cause hydration mismatches, and only
 * while the visitor has no valid stored consent.
 */
export function CookieConsentBanner() {
  const { status, acceptAll, rejectNonEssential, openSettings } = useConsent();
  const [render, setRender] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (status === "undecided") {
      setRender(true);
      // Double rAF so the entrance transition runs from the initial state.
      const first = requestAnimationFrame(() =>
        requestAnimationFrame(() => setEntered(true)),
      );
      return () => cancelAnimationFrame(first);
    }
    if (status === "decided" && render) {
      // Play the exit animation before unmounting.
      setEntered(false);
      const timer = window.setTimeout(() => setRender(false), 280);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [status, render]);

  if (!render) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      aria-live="polite"
      className={cn(
        "fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-[70] transition-all duration-300 ease-out sm:inset-x-auto sm:bottom-6 sm:left-6 sm:w-full sm:max-w-md",
        entered ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
      )}
    >
      <div className="overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--line-strong)] bg-[#0a0a14]/95 shadow-[var(--shadow-ledger)] backdrop-blur-md">
        <div className="h-1 bg-[var(--premium-gradient)]" aria-hidden="true" />
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--signal-soft)] text-[var(--signal)]" aria-hidden="true">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-black tracking-[-0.02em] text-[var(--ink)]">We use cookies</h2>
              <p className="mt-1.5 text-[13px] leading-6 text-[var(--steel)]">
                We use cookies and similar technologies to keep our website secure, remember your preferences, and
                understand how our website is used. You can choose which types of cookies you allow.{" "}
                <a href="/privacy" className="font-bold text-[var(--signal-strong)] hover:underline">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={acceptAll}
              className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--signal)] bg-[var(--signal)] px-4 text-sm font-extrabold text-white transition hover:bg-[var(--signal-strong)]"
            >
              Accept All
            </button>
            <button
              type="button"
              onClick={rejectNonEssential}
              className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--line-strong)] bg-transparent px-4 text-sm font-extrabold text-[var(--ink)] transition hover:border-[var(--signal)] hover:text-[var(--signal-strong)]"
            >
              Reject Non-Essential
            </button>
          </div>
          <button
            type="button"
            onClick={openSettings}
            aria-haspopup="dialog"
            className="mt-2 inline-flex min-h-10 w-full items-center justify-center rounded-[var(--radius-md)] px-4 text-[13px] font-bold text-[var(--steel)] transition hover:bg-white/5 hover:text-[var(--ink)]"
          >
            Cookie Settings
          </button>
        </div>
      </div>
    </div>
  );
}
