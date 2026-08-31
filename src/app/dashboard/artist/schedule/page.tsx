import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { ArtistSchedule } from "@/components/artist/ArtistSchedule";

export default function ArtistSchedulePage() {
  return (
    <>
      <DashboardHeader role="ARTIST STUDIO" title="My Schedule" description="Keep track of your upcoming performances." />
      <main className="bg-white">
        <ArtistSchedule />
      </main>
    </>
  );
}
