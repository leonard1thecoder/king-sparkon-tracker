import type { Metadata } from "next";
import { FavoritesWorkspace } from "@/components/favorites/FavoritesWorkspace";

export const metadata: Metadata = {
  title: "Favorites | User Dashboard",
  description: "Favorited businesses with quick access to their products, tickets and job posts.",
};

export default function FavoritesPage() {
  return (
    <main className="grid gap-6 bg-[var(--surface)] p-5 md:p-8">
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="text-3xl font-black tracking-[-0.04em]">Favorites</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--steel)]">Businesses you favorited. Tap the heart in the shop to add or remove. Backend will sync via /api/user/favorites.</p>
        <div className="mt-6">
          <FavoritesWorkspace />
        </div>
      </div>
    </main>
  );
}
