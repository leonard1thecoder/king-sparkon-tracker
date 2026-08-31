import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { ArtistProfileView } from "@/components/artist/ArtistProfile";

export default function ArtistProfilePage() {
  return (
    <>
      <DashboardHeader role="ARTIST STUDIO" title="Artist Profile" description="Bio, links, fee and upcoming performances." />
      <main className="bg-white">
        <ArtistProfileView editable />
      </main>
    </>
  );
}
