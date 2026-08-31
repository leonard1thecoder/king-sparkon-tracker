import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { ArtistProfileView } from "@/components/artist/ArtistProfile";

export default async function OwnerArtistProfilePage({ params }: { params: Promise<{ artistId: string }> }) {
  const { artistId } = await params;
  return (
    <>
      <DashboardHeader role="OWNER LEDGER" title="Artist Profile" description="View artist bio, type, fee and performances." />
      <main className="bg-white">
        <ArtistProfileView artistId={artistId} />
      </main>
    </>
  );
}
