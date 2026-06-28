import type { Metadata } from "next";
import { TicketLayout } from "@/components/tickets/TicketLayout";
import { TicketRoleGate } from "@/components/tickets/TicketRoleGate";
import { TicketScannerPanel } from "@/components/tickets/TicketScannerPanel";

export const metadata: Metadata = {
  title: "Scan Ticket | Worker QR Gate Verification",
  description: "Worker and staff ticket QR scanner for verifying King Sparkon Tracker event tickets, manual references, active status, used tickets, cancelled tickets, and expired tickets.",
  keywords: ["ticket QR scanner", "worker ticket verification", "event gate scanner", "King Sparkon Tracker"],
  alternates: { canonical: "/tickets/scan" },
};

export default function TicketScanPage() {
  return (
    <TicketLayout>
      <TicketRoleGate allowedRoles={["WORKER", "ADMIN"]} title="Worker scanner access only" description="Workers verify entry and mark active tickets as used. Users cannot scan tickets and owners need a worker/admin role for gate operations.">
        <main className="mx-auto max-w-7xl px-5 py-16 md:px-8 lg:py-24">
          <div className="mb-8 max-w-3xl">
            <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[var(--signal)]">Staff gate tool</p>
            <h1 className="mt-3 text-5xl font-black tracking-[-0.06em] md:text-6xl">Serious QR entry verification</h1>
            <p className="mt-4 text-sm leading-7 text-[var(--steel)]">Scan ticket QR codes, use manual references when needed, and mark valid ACTIVE tickets as USED after entry.</p>
          </div>
          <TicketScannerPanel />
        </main>
      </TicketRoleGate>
    </TicketLayout>
  );
}
