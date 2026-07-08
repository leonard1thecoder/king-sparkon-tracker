import type { Metadata } from "next";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { CreateEventForm } from "@/components/tickets/CreateEventForm";

export const metadata: Metadata = {
  title: "Create Ticket Event | Owner Dashboard",
  description: "Create King Sparkon Tracker ticket events inside the owner dashboard.",
};

export default function OwnerCreateTicketEventPage() {
  return (
    <>
      <DashboardHeader role="OWNER WORKSPACE" title="Create ticket event" description="Create Regular, VIP, and VVIP ticket events from the owner dashboard." />
      <main className="bg-[var(--surface)] p-5 md:p-8">
        <CreateEventForm />
      </main>
    </>
  );
}
