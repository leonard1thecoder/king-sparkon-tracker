import type { Metadata } from "next";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { TicketScannerPanel } from "@/components/tickets/TicketScannerPanel";

export const metadata: Metadata = {
  title: "Scan Ticket | Worker Dashboard",
  description: "Worker ticket scanner with manual ticket-owner photo comparison before admission.",
};

export default function WorkerTicketScanRoute() {
  return (
    <>
      <DashboardHeader role="WORKER WORKSPACE" title="Ticket identity check" description="Scan the ticket, compare the guest with the stored owner photo, then explicitly admit or deny entry." />
      <main className="bg-[var(--surface)] p-5 md:p-8">
        <div className="mb-8 max-w-3xl">
          <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[var(--signal)]">Staff gate tool</p>
          <h1 className="mt-3 text-5xl font-black tracking-[-0.06em] md:text-6xl">QR scan plus owner photo verification</h1>
          <p className="mt-4 text-sm leading-7 text-[var(--steel)]">Scanning does not use the ticket. The worker must manually compare the person at the gate with the ticket owner photo. Only a confirmed match marks the ticket USED; a mismatch must be denied entry.</p>
        </div>
        <TicketScannerPanel />
      </main>
    </>
  );
}
