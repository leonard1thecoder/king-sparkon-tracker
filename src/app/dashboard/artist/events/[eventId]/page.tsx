import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { ArtistEventDetails } from "@/components/artist/ArtistEventDetails";

export default async function ArtistEventDetailsPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  return (
    <>
      <DashboardHeader role="ARTIST STUDIO" title="Event Details" description="Review performance details and request to perform." />
      <main className="bg-white">
        <ArtistEventDetails eventId={eventId} />
      </main>
    </>
  );
}
