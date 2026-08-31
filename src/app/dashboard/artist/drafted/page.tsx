import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { ArtistDraftedEvents } from "@/components/artist/ArtistDraftedEvents";

export default function ArtistDraftedPage() {
  return (
    <>
      <DashboardHeader role="ARTIST STUDIO" title="Drafted Events" description="Discover events looking for artists." />
      <main className="bg-white">
        <ArtistDraftedEvents />
      </main>
    </>
  );
}
