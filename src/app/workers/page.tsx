import type { Metadata } from "next";
import { Clock, QrCode, ScanLine, ShoppingBag, WalletCards } from "lucide-react";
import { WorldPage } from "@/components/marketing/WorldPages";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Workers | Shifts, Scans, Tickets, Tips & Orders",
  description:
    "Work on King Sparkon: run counter checkout, scan products and tickets, prepare online orders and track tips and sales.",
  path: "/workers",
  keywords: ["King Sparkon workers", "counter checkout", "scan products", "ticket verification", "worker tips"],
});

export default function WorkersWorldPage() {
  return (
    <WorldPage
      config={{
        eyebrow: "Workers",
        title: "Get in. Get moving.",
        energy: "Fast hands welcome.",
        copy: "As a worker you operate at speed — counter checkout, ticket gates, online orders and tips, with every scan and sale recorded under your name. Your business creates your worker account; you bring the pace.",
        moves: [
          { icon: Clock, title: "Shifts", copy: "Start where the business needs you — counter, gate or floor." },
          { icon: ScanLine, title: "Scan", copy: "Verify barcodes and QR codes in one fast motion." },
          { icon: QrCode, title: "Tickets", copy: "Check buyers in at the gate with face and QR verification." },
          { icon: WalletCards, title: "Tips", copy: "Receive QR tips and follow them through to payout." },
          { icon: ShoppingBag, title: "Orders", copy: "Prepare paid carts and keep collections moving." },
        ],
        entryLabel: "Enter Sparkon",
        entryHref: "/login",
        secondary: [
          { label: "See how scanning works", href: "/#flow" },
          { label: "Talk to us", href: "/contact" },
        ],
        others: [
          { label: "Users", href: "/users" },
          { label: "Artists", href: "/artists" },
          { label: "Businesses", href: "/businesses" },
        ],
      }}
    />
  );
}
