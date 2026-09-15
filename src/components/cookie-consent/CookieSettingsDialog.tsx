"use client";

import { useEffect, useRef, useState } from "react";
import { BarChart3, LockKeyhole, Megaphone, Settings, ShieldCheck, SlidersHorizontal, X } from "lucide-react";
import { useConsent } from "./ConsentProvider";
import { COOKIE_CATEGORY_INFO, DEFAULT_CONSENT_STATE } from "@/lib/cookies";
import type { ConsentState, CookieCategory } from "@/lib/cookies";
import { cn } from "@/lib/utils/cn";

const CATEGORY_ICONS: Record<CookieCategory, typeof ShieldCheck> = {
  necessary: ShieldCheck,
  preferences: SlidersHorizontal,
  analytics: BarChart3,
  marketing: Megaphone,
};

function Toggle({
  checked,
  disabled,
  label,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border px-0.5 transition-colors duration-200",
        checked ? "border-[var(--signal)] bg-[var(--signal)]" : "border-[var(--line-strong)] bg-white/10",
        disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "grid h-5.5 w-5.5 place-items-center rounded-full bg-white shadow transition-transform duration-200",
          checked ? "translate-x-5" : "translate-x-0",
        )}
      >
        {disabled ? <LockKeyhole className="h-3 w-3 text-[var(--steel)]" /> : null}
      </span>
    </button>
  );
}

/**
 * Accessible cookie preferences dialog. Rendered only on the client after
 * mount. Manages focus (trap + restore), Escape/outside dismissal (without
 * saving), and body scroll lock while open.
 */
export function CookieSettingsDialog() {
  const { settingsOpen, closeSettings, consent, acceptAll, rejectNonEssential, savePreferences } = useConsent();
  const [draft, setDraft] = useState<ConsentState>({ ...DEFAULT_CONSENT_STATE });
  const [render, setRender] = useState(false);
  const [entered, setEntered] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<Element | null>(null);

  // Mount/unmount with enter/exit animation.
  useEffect(() => {
    if (settingsOpen) {
      previouslyFocused.current = document.activeElement;
      setDraft({ ...consent });
      setRender(true);
      const first = requestAnimationFrame(() => requestAnimationFrame(() => setEntered(true)));
      return () => cancelAnimationFrame(first);
    }
    if (render) {
      setEntered(false);
      const timer = window.setTimeout(() => setRender(false), 220);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [settingsOpen, render, consent]);

  // Scroll lock + focus management + keyboard handling while rendered.
  useEffect(() => {
    if (!render) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        closeSettings();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown, true);
      if (previouslyFocused.current instanceof HTMLElement) previouslyFocused.current.focus();
    };
  }, [render, closeSettings]);

  if (!render) return null;

  const setCategory = (category: CookieCategory, value: boolean) => {
    if (category === "necessary") return;
    setDraft((previous) => ({ ...previous, [category]: value }));
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-[80] flex items-end justify-center p-4 transition-opacity duration-200 sm:items-center",
        entered ? "opacity-100" : "opacity-0",
      )}
    >
      <button
        type="button"
        aria-label="Close cookie settings without saving"
        onClick={closeSettings}
        className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-settings-title"
        aria-describedby="cookie-settings-description"
        tabIndex={-1}
        className={cn(
          "relative flex max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--line-strong)] bg-[#0a0a14] shadow-[var(--shadow-ledger)] transition-all duration-200",
          entered ? "translate-y-0 scale-100" : "translate-y-6 scale-[0.98]",
        )}
      >
        <div className="h-1 shrink-0 bg-[var(--premium-gradient)]" aria-hidden="true" />
        <div className="flex shrink-0 items-start justify-between gap-4 p-5 pb-0 sm:p-6 sm:pb-0">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--signal-soft)] text-[var(--signal)]" aria-hidden="true">
              <Settings className="h-5 w-5" />
            </span>
            <div>
              <h2 id="cookie-settings-title" className="text-lg font-black tracking-[-0.02em] text-[var(--ink)]">
                Cookie Settings
              </h2>
              <p id="cookie-settings-description" className="mt-1 text-[13px] leading-6 text-[var(--steel)]">
                Choose which cookies we may use. Necessary cookies keep the site working and are always on. You can
                change your mind at any time from the Cookie Settings link in the footer.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeSettings}
            aria-label="Close cookie settings"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--line)] text-[var(--steel)] transition hover:border-[var(--line-strong)] hover:text-[var(--ink)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid flex-1 gap-3 overflow-y-auto p-5 sm:p-6">
          {COOKIE_CATEGORY_INFO.map((category) => {
            const Icon = CATEGORY_ICONS[category.key];
            const checked = category.locked ? true : draft[category.key];
            return (
              <section
                key={category.key}
                aria-label={category.title}
                className="flex items-start justify-between gap-4 rounded-[var(--radius-lg)] border border-[var(--line)] bg-white/[0.03] p-4"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] text-[var(--signal)]" aria-hidden="true">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-black text-[var(--ink)]">
                      {category.title}
                      {category.locked ? (
                        <span className="rounded-full border border-[var(--confirm)]/40 bg-[var(--confirm)]/10 px-2 py-0.5 text-[0.62rem] font-black uppercase tracking-[0.08em] text-[var(--confirm)]">
                          Always on
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-1 text-[13px] leading-6 text-[var(--steel)]">{category.description}</p>
                  </div>
                </div>
                <Toggle
                  checked={checked}
                  disabled={category.locked}
                  label={category.locked ? `${category.title} (always on)` : `Allow ${category.title.toLowerCase()}`}
                  onChange={(next) => setCategory(category.key, next)}
                />
              </section>
            );
          })}
        </div>

        <div className="grid shrink-0 gap-2 border-t border-[var(--line)] bg-black/30 p-5 sm:grid-cols-3 sm:p-6">
          <button
            type="button"
            onClick={() => savePreferences(draft)}
            className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--signal)] bg-[var(--signal)] px-4 text-sm font-extrabold text-white transition hover:bg-[var(--signal-strong)]"
          >
            Save Preferences
          </button>
          <button
            type="button"
            onClick={acceptAll}
            className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--line-strong)] bg-transparent px-4 text-sm font-extrabold text-[var(--ink)] transition hover:border-[var(--signal)] hover:text-[var(--signal-strong)]"
          >
            Accept All
          </button>
          <button
            type="button"
            onClick={rejectNonEssential}
            className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)] border border-transparent bg-transparent px-4 text-sm font-extrabold text-[var(--steel)] transition hover:bg-white/5 hover:text-[var(--ink)]"
          >
            Reject Non-Essential
          </button>
        </div>
      </div>
    </div>
  );
}
