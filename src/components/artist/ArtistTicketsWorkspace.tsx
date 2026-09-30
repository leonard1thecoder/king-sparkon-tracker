"use client";

import { DashboardMyTickets } from "@/components/tickets/DashboardMyTickets";
import { DashboardTicketMarketplace } from "@/components/tickets/DashboardTicketMarketplace";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function ArtistTicketsWorkspace() {
  return (
    <div className="grid gap-8 p-5 md:p-8 pb-10">
      <section className="grid gap-4">
        <SectionHeader title="Buy tickets" description="Live events from the same marketplace, inside the artist dashboard" eyebrow="MARKETPLACE" />
        <DashboardTicketMarketplace />
      </section>
      <section className="grid gap-4">
        <SectionHeader title="My tickets" description="Tickets bought on this artist account" eyebrow="MY TICKETS" />
        <DashboardMyTickets />
      </section>
    </div>
  );
}
