import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { ArtistTicketsWorkspace } from "@/components/artist/ArtistTicketsWorkspace";

export default function ArtistTicketsPage() {
  return (
    <>
      <DashboardHeader role="ARTIST STUDIO" title="King Sparkon Tickets" description="Browse live events, buy tickets, and keep them in My Tickets without leaving the artist dashboard." />
      <main className="bg-white">
        <ArtistTicketsWorkspace />
      </main>
    </>
  );
}
