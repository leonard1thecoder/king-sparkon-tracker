import { Activity, ArrowRight, ScanLine } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

export function DashboardHeader({ title, description, role }: { title: string; description: string; role: string }) {
  return (
    <header className="relative overflow-hidden border-b border-[var(--line)] bg-[var(--paper)] px-5 py-6 md:px-8">
      <div className="pointer-events-none absolute inset-0 enterprise-grid opacity-80" />
      <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-[var(--gold)]/20 blur-3xl" />
      <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge>{role}</Badge>
          <h1 className="mt-3 max-w-4xl text-3xl font-black tracking-[-0.05em] md:text-5xl">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--steel)] md:text-base">{description}</p>
        </div>
        <div className="grid gap-3 rounded-[1.75rem] border border-[var(--line)] bg-white/78 p-4 shadow-[var(--shadow-soft)] backdrop-blur md:min-w-80">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.16em] text-[var(--signal)]">Scanner health</p>
              <p className="mt-1 text-sm font-bold text-[var(--steel)]">Preview workspace online</p>
            </div>
            <div className="grid h-11 w-11 place-items-center rounded-full bg-[var(--ink)] text-[var(--gold)]"><ScanLine className="h-5 w-5" /></div>
          </div>
          <div className="barcode-rule h-8 text-[var(--ink)]" />
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-black uppercase tracking-[0.12em] text-[var(--steel)]">
            <span className="inline-flex items-center gap-2"><Activity className="h-3.5 w-3.5 text-[var(--confirm)]" /> Live shell</span>
            <Link href="/dashboard/worker/scan" className="inline-flex items-center gap-1 text-[var(--signal)] hover:text-[var(--ember)]">Open scan <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
        </div>
      </div>
    </header>
  );
}
