import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { ArtistDashboardHome } from "@/components/artist/ArtistDashboardHome";

export default function ArtistDashboardPage() {
  return (
    <>
      <DashboardHeader role="ARTIST STUDIO" title="Artist Dashboard" description="Manage your performances and discover new opportunities." />
      <main className="bg-white">
        <ArtistDashboardHome />
      </main>
    </>
  );
}
