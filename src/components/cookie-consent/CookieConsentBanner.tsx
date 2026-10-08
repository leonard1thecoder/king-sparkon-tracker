"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCookieConsent } from "./ConsentProvider";
import { cn } from "@/lib/utils/cn";
import { isPublicSitePath } from "@/lib/motion/motion-route";

/**
 * Compact, non-intrusive consent banner. Rendered only after client mount
 * (never on the server) so it cannot cause hydration mismatches, and only
 * while no valid stored consent exists (`status === "unknown"`).
 *
 * Accept and Reject share identical visual weight — no dark patterns.
 */
export function CookieConsentBanner() {
  const { status, acceptAll, rejectNonEssential, openSettings } = useCookieConsent();
  const pathname = usePathname();
  // Marketing and auth screens are white. The banner matches them there; dashboards keep the dark banner.
  const light = isPublicSitePath(pathname) || pathname === "/login" || pathname === "/register";
  const [mounted, setMounted] = useState(false);
  const [render, setRender] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || status !== "unknown") {
      if (render) {
        // Play the exit animation before unmounting.
        setEntered(false);
        const timer = window.setTimeout(() => setRender(false), 280);
        return () => window.clearTimeout(timer);
      }
      return undefined;
    }
    setRender(true);
    // Double rAF so the entrance transition runs from the initial state.
    const first = requestAnimationFrame(() => requestAnimationFrame(() => setEntered(true)));
    return () => cancelAnimationFrame(first);
  }, [mounted, status, render]);

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
      <div
        className={cn(
          "overflow-hidden rounded-[var(--radius-2xl)] border shadow-[var(--shadow-ledger)]",
          light ? "ks-public ks-surface border-[var(--ks-line)] text-[var(--ks-ink)] shadow-[0_18px_40px_-24px_rgba(23,35,29,0.45)]" : "border-[var(--line-strong)] bg-[#0a0a14]/95",
        )}
      >
        <div className={cn("h-1", light ? "bg-[var(--ks-yellow)]" : "bg-[var(--premium-gradient)]")} aria-hidden="true" />
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--signal-soft)] text-[var(--signal)]" aria-hidden="true">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className={cn("text-base font-black tracking-[-0.02em]", light ? "text-[var(--ks-ink)]" : "text-[var(--ink)]")}>We use cookies</h2>
              <p className={cn("mt-1.5 text-[13px] leading-6", light ? "text-[var(--ks-muted)]" : "text-[var(--steel)]")}>
                We use cookies and similar technologies to keep our website secure, remember your preferences, and
                understand how our website is used. You can choose which types of cookies you allow.{" "}
                <a href="/privacy" className={cn("font-bold hover:underline", light ? "text-[var(--ks-ink)]" : "text-[var(--signal-strong)]")}>
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>

          {light ? (
            <>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <button type="button" onClick={acceptAll} className="ks-btn ks-btn-primary ks-btn-sm w-full justify-center">Accept All</button>
                <button type="button" onClick={rejectNonEssential} className="ks-btn ks-btn-secondary ks-btn-sm w-full justify-center">Reject Non-Essential</button>
              </div>
              <button type="button" onClick={openSettings} aria-haspopup="dialog" className="mt-2 w-full text-center text-sm font-semibold text-[var(--ks-muted)] hover:text-[var(--ks-ink)]">
                Cookie Settings
              </button>
            </>
          ) : (
            <>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <Button variant="secondary" onClick={acceptAll} className="w-full">
                  Accept All
                </Button>
                <Button variant="secondary" onClick={rejectNonEssential} className="w-full">
                  Reject Non-Essential
                </Button>
              </div>
              <Button variant="quiet" onClick={openSettings} aria-haspopup="dialog" className="mt-1 w-full">
                Cookie Settings
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
