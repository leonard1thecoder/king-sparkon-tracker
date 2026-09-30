import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { ArtistMallWorkspace } from "@/components/artist/ArtistMallWorkspace";

export default function ArtistMallPage() {
  return (
    <>
      <DashboardHeader role="ARTIST STUDIO" title="King Sparkon Mall" description="Browse mall products, checkout, and track your purchases without leaving the artist dashboard." />
      <main className="bg-white">
        <ArtistMallWorkspace />
      </main>
    </>
  );
}
