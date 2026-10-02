import type { Metadata } from "next";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { ArtistPayouts } from "@/components/artist/ArtistPayouts";

export const metadata: Metadata = {
  title: "Artist Payouts",
  description: "Withdraw artist booking earnings and track payout history.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ArtistPayoutsPage() {
  return (
    <>
      <DashboardHeader role="ARTIST STUDIO" title="Payouts" description="Withdraw booking earnings and track payout history." />
      <main className="page-main">
        <ArtistPayouts />
      </main>
    </>
  );
}
