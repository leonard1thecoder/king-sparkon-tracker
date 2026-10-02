"use client";

import { DashboardMyTickets } from "@/components/tickets/DashboardMyTickets";
import { DashboardTicketMarketplace } from "@/components/tickets/DashboardTicketMarketplace";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function WorkerTicketsWorkspace() {
  return (
    <div className="grid gap-4 p-4 md:p-5">
      <section className="grid gap-3">
        <SectionHeader title="Buy tickets" description="Live events from the same marketplace, inside the worker dashboard" eyebrow="MARKETPLACE" />
        <DashboardTicketMarketplace />
      </section>
      <section className="grid gap-3">
        <SectionHeader title="My tickets" description="Tickets bought on this worker account" eyebrow="MY TICKETS" />
        <DashboardMyTickets />
      </section>
    </div>
  );
}
