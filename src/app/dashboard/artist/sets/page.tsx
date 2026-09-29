import type { Metadata } from "next";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { ArtistSets } from "@/components/artist/ArtistSets";

export const metadata: Metadata = {
  title: "Artist Performance Sets",
  description: "Apply for open performance sets on drafted events and answer booking offers.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ArtistSetsPage() {
  return (
    <>
      <DashboardHeader role="ARTIST STUDIO" title="Performance sets" description="Apply for open sets, collect user vows, and answer booking offers." />
      <main className="p-5 md:p-8">
        <ArtistSets />
      </main>
    </>
  );
}
