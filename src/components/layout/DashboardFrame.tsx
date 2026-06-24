import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export function DashboardFrame({ role, nav, children }: { role: string; nav: ReactNode; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="border-b border-[var(--line)] bg-[var(--ink)] text-white lg:min-h-screen lg:border-b-0 lg:border-r lg:border-white/10">
        <div className="flex items-center gap-3 border-b border-white/10 p-5">
          <Image src="/king-sparkon-logo.png" alt="King Sparkon Tracker" width={46} height={46} className="rounded-full border border-white/15" />
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--signal)]">{role}</p>
            <Link href="/" className="font-mono text-sm font-black uppercase">King Sparkon</Link>
          </div>
        </div>
        <nav className="grid gap-1 p-3">{nav}</nav>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
