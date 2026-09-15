"use client";

import { Settings } from "lucide-react";
import { useConsentOptional } from "./ConsentProvider";
import { cn } from "@/lib/utils/cn";

/**
 * Reopenable entry point to Cookie Settings. Place it in the footer,
 * account page or privacy page so visitors can revisit their choice.
 * Must be rendered inside `<ConsentProvider>` (returns null outside it
 * during SSR or when misused, instead of throwing).
 */
export function CookieSettingsButton({ variant = "default" }: { variant?: "default" | "footer" }) {
  const consent = useConsentOptional();
  if (!consent) return null;
  const { openSettings } = consent;

  if (variant === "footer") {
    return (
      <button
        type="button"
        onClick={openSettings}
        aria-haspopup="dialog"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)] transition-colors duration-200 hover:text-[var(--premium-cyan)]"
      >
        <Settings className="h-3.5 w-3.5" aria-hidden="true" /> Cookie Settings
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={openSettings}
      aria-haspopup="dialog"
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)]",
        "border border-[var(--line-strong)] bg-transparent px-5 text-sm font-extrabold text-[var(--ink)]",
        "transition hover:border-[var(--signal)] hover:text-[var(--signal-strong)]",
      )}
    >
      <Settings className="h-4 w-4" aria-hidden="true" /> Cookie Settings
    </button>
  );
}
