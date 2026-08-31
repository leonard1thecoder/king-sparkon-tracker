import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { ArtistBookedEvents } from "@/components/artist/ArtistBookedEvents";

export default function ArtistBookedPage() {
  return (
    <>
      <DashboardHeader role="ARTIST STUDIO" title="Booked Events" description="Your confirmed performances." />
      <main className="bg-white">
        <ArtistBookedEvents />
      </main>
    </>
  );
}
