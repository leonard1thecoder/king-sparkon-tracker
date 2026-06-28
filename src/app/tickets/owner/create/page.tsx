import type { Metadata } from "next";
import { CreateEventForm } from "@/components/tickets/CreateEventForm";
import { TicketLayout } from "@/components/tickets/TicketLayout";
import { TicketRoleGate } from "@/components/tickets/TicketRoleGate";

export const metadata: Metadata = {
  title: "Create Event | Ticket Management",
  description: "Create King Sparkon Tracker ticket events with Regular, VIP, and VVIP pricing, capacity, event status, date, time, location, and banner image placeholder.",
  alternates: { canonical: "/tickets/owner/create" },
};

export default function CreateTicketEventPage() {
  return (
    <TicketLayout>
      <TicketRoleGate allowedRoles={["OWNER", "ADMIN"]} title="Only owners and admins can create events" description="Workers scan tickets. Users buy tickets. Event creation remains protected for owner/admin roles.">
        <main className="mx-auto max-w-7xl px-5 py-16 md:px-8 lg:py-24">
          <CreateEventForm />
        </main>
      </TicketRoleGate>
    </TicketLayout>
  );
}
