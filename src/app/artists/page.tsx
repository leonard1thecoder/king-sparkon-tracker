import type { Metadata } from "next";
import { CalendarDays, ClipboardList, Mic2, UsersRound, WalletCards } from "lucide-react";
import { WorldPage } from "@/components/marketing/WorldPages";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Artists | Perform, Find Events & Track Earnings",
  description:
    "Join King Sparkon as an artist: discover drafted events, request performance sets, manage riders and track booking payouts.",
  path: "/artists",
  keywords: ["King Sparkon artists", "perform at events", "artist bookings", "performance sets", "artist payouts"],
});

export default function ArtistsWorldPage() {
  return (
    <WorldPage
      config={{
        eyebrow: "Artists",
        title: "Make your move.",
        energy: "Your stage is waiting.",
        copy: "As an artist you move through open opportunities — drafted events looking for performers, confirmed sets with agreed riders, and payouts that follow the booking.",
        moves: [
          { icon: Mic2, title: "Perform", copy: "Request performance sets at events looking for your sound." },
          { icon: CalendarDays, title: "Find events", copy: "Discover drafted events, check dates, venues and lineups." },
          { icon: UsersRound, title: "Connect", copy: "Link with business owners running the rooms you want to play." },
          { icon: ClipboardList, title: "Manage riders", copy: "Agree set terms and keep every confirmation on record." },
          { icon: WalletCards, title: "Track earnings", copy: "Watch booking balances grow and request withdrawals." },
        ],
        entryLabel: "Enter Sparkon",
        entryHref: "/register?plan=FREE_USER&privilege=USER&service=FREE_USER_ACCESS",
        secondary: [
          { label: "See an event page", href: "/#events" },
          { label: "Browse jobs", href: "/jobs" },
        ],
        others: [
          { label: "Users", href: "/users" },
          { label: "Businesses", href: "/businesses" },
          { label: "Workers", href: "/workers" },
        ],
      }}
    />
  );
}
