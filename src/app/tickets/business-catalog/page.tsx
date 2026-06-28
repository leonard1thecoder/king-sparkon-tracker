import type { Metadata } from "next";
import { Suspense } from "react";
import { TicketLayout } from "@/components/tickets/TicketLayout";
import { BusinessCatalogClient } from "./business-catalog-client";

export const metadata: Metadata = {
  title: "Business Catalog | King Sparkon Tickets",
  description: "Browse event businesses after login, follow businesses, and discover promoted ticket events from companies you do not yet follow.",
};

export default function BusinessCatalogPage() {
  return (
    <TicketLayout>
      <Suspense fallback={<main className="mx-auto max-w-7xl px-5 py-16 md:px-8"><div className="h-48 rounded-[2rem] border border-[var(--line)] bg-[var(--surface)]" /></main>}>
        <BusinessCatalogClient />
      </Suspense>
    </TicketLayout>
  );
}
