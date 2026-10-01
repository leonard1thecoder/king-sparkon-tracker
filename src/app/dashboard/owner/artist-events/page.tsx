import type { Metadata } from "next";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { OwnerArtistEvents } from "@/components/artist/OwnerArtistEvents";

export const metadata: Metadata = {
  title: "Artist Events",
  description: "Create drafted events with hospitality riders, publish them, and track rider redemptions.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OwnerArtistEventsPage() {
  return (
    <>
      <DashboardHeader role="OWNER WORKSPACE" title="Artist events" description="Draft events, toggle the rider, publish, and track company-paid redemptions." />
      <main className="p-5 md:p-8">
        <OwnerArtistEvents />
      </main>
    </>
  );
}
