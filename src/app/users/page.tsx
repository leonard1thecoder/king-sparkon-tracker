import type { Metadata } from "next";
import { BriefcaseBusiness, Mic2, ShoppingBag, Ticket } from "lucide-react";
import { WorldPage } from "@/components/marketing/WorldPages";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Users | Discover Events, Artists, Products & Opportunities",
  description:
    "Join King Sparkon as a user: discover live events, follow artists, shop products, buy QR tickets and apply for job opportunities.",
  path: "/users",
  keywords: ["King Sparkon users", "discover events", "buy tickets", "shop products", "job opportunities"],
});

export default function UsersWorldPage() {
  return (
    <WorldPage
      config={{
        eyebrow: "Users",
        title: "Discover what's happening.",
        energy: "You're in. Look around.",
        copy: "As a user you browse the same live world everyone else works in — events taking shape, artists performing, products on shelves and opportunities opening up.",
        moves: [
          { icon: Ticket, title: "Events", copy: "Browse live events, check lineups and keep your QR tickets in one wallet." },
          { icon: Mic2, title: "Artists", copy: "Follow performers, see where they play next and catch booked sets." },
          { icon: ShoppingBag, title: "Products", copy: "Shop business catalogues, build a cart and check out securely." },
          { icon: BriefcaseBusiness, title: "Opportunities", copy: "Browse job posts from real businesses and track your applications." },
        ],
        entryLabel: "Enter Sparkon",
        entryHref: "/register?plan=FREE_USER&privilege=USER&service=FREE_USER_ACCESS",
        secondary: [
          { label: "See how it moves", href: "/#flow" },
          { label: "Browse jobs", href: "/jobs" },
        ],
        others: [
          { label: "Artists", href: "/artists" },
          { label: "Businesses", href: "/businesses" },
          { label: "Workers", href: "/workers" },
        ],
      }}
    />
  );
}
