"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function DashboardFrame({ role, nav, children }: { role: string; nav: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div className="h-dvh overflow-hidden bg-white text-[var(--ink)] lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <header className="sticky top-0 z-[60] flex min-h-[4.5rem] items-center justify-between gap-3 border-b border-[var(--line)] bg-white px-4 py-3 shadow-[var(--shadow-soft)] lg:hidden">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <Image src="/king-sparkon-logo.png" alt="King Sparkon Tracker" width={42} height={42} className="rounded-lg border border-[var(--line)] bg-white p-1" priority />
          <div className="min-w-0">
            <p className="truncate text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]">{role}</p>
            <p className="truncate text-sm font-black tracking-[-0.02em]">King Sparkon</p>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--line-strong)] bg-white text-[var(--signal-strong)] hover:border-[var(--accent-hover)] hover:bg-[var(--accent-hover)] hover:text-white"
          aria-label={open ? "Close dashboard navigation" : "Open dashboard navigation"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {open ? <button type="button" aria-label="Close dashboard navigation overlay" className="fixed inset-0 z-40 bg-sky-50/90 backdrop-blur-[2px] lg:hidden" onClick={() => setOpen(false)} /> : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-dvh w-[min(88vw,280px)] -translate-x-full flex-col border-r border-[var(--line)] bg-white text-[var(--ink)] shadow-[0_20px_50px_rgba(15,23,42,0.12)] transition-transform duration-300 lg:sticky lg:top-0 lg:z-30 lg:w-auto lg:translate-x-0 lg:shadow-none",
          open ? "translate-x-0" : "",
        )}
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--line)] p-4 lg:block lg:p-5">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <Image src="/king-sparkon-logo.png" alt="King Sparkon Tracker" width={48} height={48} className="rounded-lg border border-[var(--line)] bg-white p-1" />
            <div className="min-w-0">
              <p className="truncate text-[0.65rem] font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]">{role}</p>
              <p className="truncate text-sm font-black tracking-[-0.01em]">King Sparkon</p>
            </div>
          </Link>
          <button ref={closeButtonRef} type="button" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-lg border border-[var(--line)] bg-white text-[var(--ink)] hover:border-[var(--accent-hover)] hover:text-[var(--accent-hover)] lg:hidden" aria-label="Close dashboard navigation">
            <X className="h-5 w-5" />
          </button>
          <div className="mt-5 hidden rounded-md border border-[var(--line)] bg-[var(--signal-soft)] px-3 py-2 text-[0.66rem] font-extrabold uppercase tracking-[0.1em] text-[var(--signal-strong)] lg:inline-flex">
            Live operations
          </div>
        </div>

        <nav className="grid flex-1 content-start gap-1 overflow-y-auto overscroll-contain px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:p-4" onClick={() => setOpen(false)}>
          {nav}
        </nav>

        <div className="shrink-0 border-t border-[var(--line)] p-4 lg:p-5">
          <div className="hidden rounded-xl border border-[var(--line)] bg-white p-4 lg:block">
            <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.1em] text-[var(--steel)]">Scanner health</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-[var(--steel)]">Terminal sync</span>
              <span className="rounded-md border border-[var(--line-strong)] bg-[var(--signal-soft)] px-2.5 py-1 text-xs font-extrabold text-[var(--signal-strong)]">Online</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="h-[calc(100dvh-4.5rem)] min-w-0 overflow-y-auto overflow-x-hidden bg-white lg:h-dvh">{children}</div>
    </div>
  );
}
