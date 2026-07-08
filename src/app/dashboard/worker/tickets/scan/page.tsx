import type { Metadata } from "next";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { TicketScannerPanel } from "@/components/tickets/TicketScannerPanel";

export const metadata: Metadata = {
  title: "Scan Ticket | Worker Dashboard",
  description: "Worker dashboard QR ticket scanner for gate verification without public ticket redirects.",
};

export default function WorkerTicketScanRoute() {
  return (
    <>
      <DashboardHeader role="WORKER WORKSPACE" title="Ticket QR scan" description="Verify ticket QR codes and manual references inside the worker dashboard." />
      <main className="bg-[var(--surface)] p-5 md:p-8">
        <div className="mb-8 max-w-3xl">
          <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[var(--signal)]">Staff gate tool</p>
          <h1 className="mt-3 text-5xl font-black tracking-[-0.06em] md:text-6xl">Serious QR entry verification</h1>
          <p className="mt-4 text-sm leading-7 text-[var(--steel)]">Scan ticket QR codes, use manual references when needed, and mark valid ACTIVE tickets as USED after entry.</p>
        </div>
        <TicketScannerPanel />
      </main>
    </>
  );
}
