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

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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
    <div className="h-dvh overflow-hidden bg-[var(--paper)] text-[var(--ink)] lg:grid lg:grid-cols-[292px_minmax(0,1fr)]">
      <header className="sticky top-0 z-40 flex min-h-[4.5rem] items-center justify-between gap-3 border-b border-[var(--line)] bg-white/95 px-4 py-3 shadow-[0_12px_40px_rgba(7,19,31,0.08)] backdrop-blur-xl lg:hidden">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <Image
            src="/king-sparkon-logo.png"
            alt="King Sparkon Tracker"
            width={42}
            height={42}
            className="rounded-[1rem] border border-[var(--line)] bg-white p-1 shadow-[var(--shadow-soft)]"
          />
          <div className="min-w-0">
            <p className="truncate font-mono text-[0.58rem] font-bold uppercase tracking-[0.16em] text-[var(--signal)]">{role}</p>
            <p className="truncate text-sm font-black uppercase tracking-[-0.02em]">King Sparkon</p>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] border border-[var(--ink)] bg-[var(--gold)] text-[var(--ink)] shadow-[var(--shadow-soft)] hover:bg-[var(--ink)] hover:text-white"
          aria-label={open ? "Close dashboard navigation" : "Open dashboard navigation"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {open ? (
        <button
          type="button"
          aria-label="Close dashboard navigation overlay"
          className="fixed inset-0 z-40 bg-[var(--ink)]/45 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-dvh w-[min(88vw,292px)] -translate-x-full flex-col border-r border-[var(--ink)]/15 bg-[var(--gold)] text-[var(--ink)] shadow-[0_30px_100px_rgba(0,0,0,0.28)] transition-transform duration-300 lg:sticky lg:top-0 lg:z-30 lg:w-auto lg:translate-x-0 lg:shadow-none",
          open ? "translate-x-0" : "",
        )}
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--ink)]/15 p-4 lg:block lg:p-5">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <Image
              src="/king-sparkon-logo.png"
              alt="King Sparkon Tracker"
              width={50}
              height={50}
              className="rounded-[1rem] border border-[var(--ink)]/15 bg-white p-1 shadow-[var(--shadow-soft)]"
            />
            <div className="min-w-0">
              <p className="truncate font-mono text-[0.65rem] font-black uppercase tracking-[0.18em] text-[var(--signal)]">{role}</p>
              <p className="truncate text-sm font-black uppercase tracking-[-0.01em]">King Sparkon</p>
            </div>
          </Link>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => setOpen(false)}
            className="grid h-10 w-10 place-items-center rounded-[1rem] border border-[var(--ink)]/15 bg-white/60 text-[var(--ink)] lg:hidden"
            aria-label="Close dashboard navigation"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="hidden rounded-full border border-[var(--ink)]/15 bg-white/45 px-3 py-1 font-mono text-[0.62rem] font-black uppercase tracking-[0.14em] text-[var(--ink)]/70 lg:mt-5 lg:inline-flex">
            Live ops console
          </div>
        </div>

        <nav className="grid flex-1 content-start gap-1.5 overflow-y-auto overscroll-contain px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:p-4" onClick={() => setOpen(false)}>
          {nav}
        </nav>

        <div className="shrink-0 border-t border-[var(--ink)]/15 p-4 lg:p-5">
          <div className="hidden rounded-[1.25rem] border border-[var(--ink)]/15 bg-white/55 p-4 shadow-[var(--shadow-soft)] lg:block">
            <p className="font-mono text-[0.68rem] font-black uppercase tracking-[0.16em] text-[var(--ink)]/55">Scanner health</p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-sm font-bold text-[var(--ink)]/75">Terminal sync</span>
              <span className="rounded-full bg-[var(--confirm)] px-2.5 py-1 text-xs font-black text-white">Online</span>
            </div>
            <div className="barcode-rule mt-5 text-[var(--ink)]" />
          </div>
        </div>
      </aside>

      <div className="h-[calc(100dvh-4.5rem)] min-w-0 overflow-y-auto overflow-x-hidden lg:h-dvh">
        {children}
      </div>
    </div>
  );
}
