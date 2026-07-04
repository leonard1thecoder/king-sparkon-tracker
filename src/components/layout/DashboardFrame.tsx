"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { cn } from "@/lib/utils/cn";

function profileHref(role: string) {
  const value = role.toLowerCase();
  if (value.includes("admin")) return "/dashboard/admin/profile";
  if (value.includes("owner")) return "/dashboard/owner/profile";
  if (value.includes("worker")) return "/dashboard/worker/profile";
  if (value.includes("affiliate")) return "/dashboard/affiliate/profile";
  if (value.includes("user")) return "/dashboard/user/profile";
  return "/dashboard";
}

export function DashboardFrame({ role, nav, children }: { role: string; nav: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] lg:grid lg:grid-cols-[292px_1fr]">
      <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-[var(--line)] bg-white/92 px-4 py-3 shadow-[0_12px_40px_rgba(7,19,31,0.08)] backdrop-blur-xl lg:hidden">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <Image src="/king-sparkon-logo.png" alt="King Sparkon Tracker" width={42} height={42} className="rounded-2xl border border-[var(--line)] bg-white p-1 shadow-[var(--shadow-soft)]" />
          <div className="min-w-0">
            <p className="truncate font-mono text-[0.58rem] font-bold uppercase tracking-[0.16em] text-[var(--signal)]">{role}</p>
            <p className="truncate text-sm font-black uppercase tracking-[-0.02em]">King Sparkon</p>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--ink)] text-[var(--gold)] shadow-[var(--shadow-soft)]"
          aria-label={open ? "Close dashboard navigation" : "Open dashboard navigation"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {open ? <button type="button" aria-label="Close dashboard navigation overlay" className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} /> : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(88vw,292px)] -translate-x-full flex-col border-r border-white/10 bg-[var(--ink)] text-white shadow-[0_30px_100px_rgba(0,0,0,0.35)] transition-transform duration-300 lg:sticky lg:top-0 lg:z-auto lg:min-h-screen lg:w-auto lg:translate-x-0 lg:shadow-none",
          open ? "translate-x-0" : "",
        )}
      >
        <div className="flex items-center justify-between gap-4 border-b border-white/10 p-4 lg:block lg:p-5">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <Image src="/king-sparkon-logo.png" alt="King Sparkon Tracker" width={48} height={48} className="rounded-2xl border border-white/15 bg-white/5 p-1" />
            <div className="min-w-0">
              <p className="truncate font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[var(--gold)]">{role}</p>
              <p className="truncate text-sm font-black uppercase tracking-[-0.01em]">King Sparkon</p>
            </div>
          </Link>
          <button type="button" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-white/70 lg:hidden" aria-label="Close dashboard navigation">
            <X className="h-5 w-5" />
          </button>
          <div className="hidden rounded-full border border-white/15 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-white/60 lg:mt-5 lg:inline-flex">
            Live ops console
          </div>
        </div>

        <nav className="grid flex-1 content-start gap-1 overflow-y-auto px-3 py-3 lg:p-4" onClick={() => setOpen(false)}>
          {nav}
        </nav>

        <div className="grid gap-3 border-t border-white/10 p-4 lg:p-5">
          <Link href={profileHref(role)} className="rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.04] p-4 text-sm font-bold text-white/72 hover:border-[var(--gold)] hover:text-white">
            Profile & session
          </Link>
          <LogoutButton className="rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.04] p-4 text-left text-sm font-black uppercase tracking-[0.1em] text-white/72 hover:border-[var(--danger)] hover:text-white disabled:opacity-60" />
          <div className="hidden rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.04] p-4 lg:block">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-white/45">Scanner health</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-white/70">Terminal sync</span>
              <span className="rounded-full bg-[var(--confirm)] px-2.5 py-1 text-xs font-bold text-white">Online</span>
            </div>
            <div className="barcode-rule mt-5 text-white" />
          </div>
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
