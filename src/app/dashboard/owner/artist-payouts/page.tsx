import type { Metadata } from "next";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { OwnerArtistPayouts } from "@/components/artist/OwnerArtistPayouts";

export const metadata: Metadata = {
  title: "Artist Payouts",
  description: "Approve artist withdrawal requests and mark payouts paid.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OwnerArtistPayoutsPage() {
  return (
    <>
      <DashboardHeader role="OWNER WORKSPACE" title="Artist payouts" description="Approve artist withdrawals and mark payouts paid." />
      <main className="p-5 md:p-8">
        <OwnerArtistPayouts />
      </main>
    </>
  );
}
