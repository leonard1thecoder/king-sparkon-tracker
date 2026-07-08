import { Suspense } from "react";
import type { Metadata } from "next";
import { DashboardTicketCheckout } from "@/components/tickets/DashboardTicketCheckout";

type PageProps = {
  params: Promise<{ eventId: string }>;
};

export const metadata: Metadata = {
  title: "Ticket Checkout | User Dashboard",
  description: "Dashboard-native QR ticket checkout for user purchases without public ticket redirects.",
};

export default async function UserDashboardTicketCheckoutPage({ params }: PageProps) {
  const { eventId } = await params;
  return (
    <Suspense fallback={<div className="bg-[var(--surface)] p-5 md:p-8"><div className="h-[34rem] animate-pulse rounded-[2.4rem] border border-[var(--line)] bg-white" /></div>}>
      <DashboardTicketCheckout eventId={eventId} />
    </Suspense>
  );
}
