import type { Metadata } from "next";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { FavoritesWorkspace } from "@/components/favorites/FavoritesWorkspace";

export const metadata: Metadata = {
  title: "Favorites | Owner Dashboard",
  description: "Businesses favorited from the owner dashboard, with quick links back into shop, tickets and jobs.",
};

export default function OwnerFavoritesPage() {
  return (
    <>
      <DashboardHeader role="OWNER WORKSPACE" title="Favorites" description="Businesses you favorited. Tap the heart on any business to add or remove it." />
      <main className="grid gap-6 p-5 md:p-8">
        <FavoritesWorkspace role="owner" />
      </main>
    </>
  );
}
