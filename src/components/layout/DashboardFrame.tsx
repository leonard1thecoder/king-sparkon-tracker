import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export function DashboardFrame({ role, nav, children }: { role: string; nav: ReactNode; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] lg:grid lg:grid-cols-[292px_1fr]">
      <aside className="border-b border-white/10 bg-[var(--ink)] text-white lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 p-4 lg:block lg:p-5">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/king-sparkon-logo.png" alt="King Sparkon Tracker" width={48} height={48} className="rounded-2xl border border-white/15 bg-white/5 p-1" />
            <div>
              <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[var(--gold)]">{role}</p>
              <p className="text-sm font-black uppercase tracking-[-0.01em]">King Sparkon</p>
            </div>
          </Link>
          <div className="hidden rounded-full border border-white/15 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-white/60 sm:block lg:mt-5 lg:inline-flex">
            Live ops console
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto px-3 py-3 lg:grid lg:gap-1 lg:overflow-visible lg:p-4">
          {nav}
        </nav>

        <div className="hidden p-5 lg:block">
          <div className="rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.04] p-4">
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
