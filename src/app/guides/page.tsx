import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Barcode, QrCode, Wallet, Megaphone } from "lucide-react";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { GlassCard } from "@/components/ui/GlassCard";
import { PremiumHeader } from "@/components/marketing/PremiumHeader";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Guides | Barcode Inventory, QR Tickets, Worker Tips & Affiliates",
  description:
    "Practical guides for King Sparkon Tracker: how to register products with barcodes, run QR ticket events, process worker tips and withdrawals, and use affiliate referrals without spreadsheet errors.",
  path: "/guides",
});

const guides = [
  {
    slug: "barcode-inventory-guide",
    icon: Barcode,
    title: "Barcode Inventory Guide",
    excerpt: "Register products, assign unit barcodes, adjust stock without losing history, and use night-shift pricing.",
    read: "8 min",
  },
  {
    slug: "qr-ticket-operations",
    icon: QrCode,
    title: "QR Ticket Operations Manual",
    excerpt: "Create events, set capacity, sell tickets, and verify QR codes at the gate with correct checked-in totals.",
    read: "7 min",
  },
  {
    slug: "worker-tips-payouts",
    icon: Wallet,
    title: "Worker Tips, Fees & Payouts",
    excerpt: "How tip QR flows, gross/fee/net and withdrawal status keep money transparent before the owner approves.",
    read: "6 min",
  },
  {
    slug: "affiliate-referrals",
    icon: Megaphone,
    title: "Affiliate Referrals & Campaigns",
    excerpt: "Referral codes, promotion quotes, audience targeting and commission visibility — no guesswork on earnings.",
    read: "6 min",
  },
];

export default function GuidesPage() {
  return (
    <>
      <PremiumHeader />
      <main className="bg-white text-[var(--ink)]">
        <div className="mx-auto max-w-7xl px-5 py-6 md:px-8"><Breadcrumbs items={[{ label: "Guides" }]} /></div>

        <section className="relative overflow-hidden border-y border-[var(--line)]">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--signal-soft)] via-[var(--surface)] to-[var(--surface)]" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
            <p className="inline-flex rounded-full border border-[var(--signal)]/20 bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]">Documentation & Guides</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-[-0.05em] md:text-5xl">Step-by-step guides for everyday operations</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--steel)]">Learn how to register products, scan unit barcodes, handle QR gate check-ins, process worker tips, and manage affiliate commissions without spreadsheet errors.</p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-12">
          <div className="grid gap-6 md:grid-cols-2">
            {guides.map((g) => (
              <GlassCard key={g.slug} variant="interactive" className="flex flex-col p-0! overflow-hidden">
                <Link href={`/guides/${g.slug}`} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--line)] bg-white text-[var(--signal)]"><g.icon className="h-5 w-5" /></div>
                    <span className="rounded-full border border-[var(--line)] bg-[var(--signal-soft)] px-3 py-1 text-xs font-extrabold text-[var(--signal-strong)]">{g.read}</span>
                  </div>
                  <h2 className="mt-5 text-xl font-black">{g.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-[var(--steel)]">{g.excerpt}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-[var(--signal-strong)]">Read guide <ArrowRight className="h-4 w-4" /></span>
                </Link>
              </GlassCard>
            ))}
          </div>

          <GlassCard variant="subtle" className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm font-semibold text-[var(--steel)]">New to the platform? Start with how the five-step workflow connects inventory to audit.</p>
            <Link href="/how-it-works" className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-extrabold text-white hover:bg-[var(--signal-strong)]">How it works <ArrowRight className="h-4 w-4" /></Link>
          </GlassCard>
        </section>
      </main>
    </>
  );
}
