import type { Metadata } from "next";
import { Banknote, Boxes, CalendarDays, ClipboardList, Ticket, UsersRound } from "lucide-react";
import { WorldPage } from "@/components/marketing/WorldPages";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Businesses | Events, Products, People & Payments",
  description:
    "Run your business on King Sparkon: publish events, manage inventory and barcodes, coordinate workers, sell tickets and track every payment.",
  path: "/businesses",
  keywords: ["King Sparkon businesses", "event management", "barcode inventory", "sell tickets", "business payments"],
});

export default function BusinessesWorldPage() {
  return (
    <WorldPage
      config={{
        eyebrow: "Businesses",
        title: "Make things happen.",
        energy: "Your world, moving.",
        copy: "As a business owner you watch your whole operation move — events filling up, stock leaving shelves, workers scanning and money landing where it should.",
        moves: [
          { icon: CalendarDays, title: "Events", copy: "Draft, publish and run ticketed events with capacity control." },
          { icon: UsersRound, title: "People", copy: "Coordinate workers, review artists and serve customers." },
          { icon: Boxes, title: "Products", copy: "List inventory, track barcodes and watch stock levels live." },
          { icon: Ticket, title: "Tickets", copy: "Sell QR tickets and verify entry at the gate." },
          { icon: Banknote, title: "Payments", copy: "Take carts, tips and payouts with a clear money trail." },
          { icon: ClipboardList, title: "Activity", copy: "Read the record: sales, scans, applications and reports." },
        ],
        entryLabel: "Enter Sparkon",
        entryHref: "/register?plan=FREE_TRIAL_BUSINESS&privilege=BUSINESS_OWNER&service=FULL_BUSINESS_SUITE",
        secondary: [
          { label: "Sign in", href: "/login" },
          { label: "See the money flow", href: "/#money" },
        ],
        others: [
          { label: "Users", href: "/users" },
          { label: "Artists", href: "/artists" },
          { label: "Workers", href: "/workers" },
        ],
      }}
    />
  );
}
