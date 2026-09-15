import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { GlassCard } from "@/components/ui/GlassCard";
import { PremiumHeader } from "@/components/marketing/PremiumHeader";
import { GuidesRoleSlider } from "@/components/marketing/GuidesRoleSlider";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Guides | Barcode Inventory, QR Tickets, Worker Tips & Affiliates",
  description:
    "Practical guides for King Sparkon Tracker: how to register products with barcodes, run QR ticket events, process worker tips and withdrawals, and use affiliate referrals without spreadsheet errors.",
  path: "/guides",
});

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
          <GuidesRoleSlider />

          <GlassCard variant="subtle" className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm font-semibold text-[var(--steel)]">New to the platform? Start with how the five-step workflow connects inventory to audit.</p>
            <Link href="/how-it-works" className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-extrabold text-white hover:bg-[var(--signal-strong)]">How it works <ArrowRight className="h-4 w-4" /></Link>
          </GlassCard>
        </section>
      </main>
    </>
  );
}
