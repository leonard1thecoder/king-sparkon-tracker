import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { GlassCard } from "@/components/ui/GlassCard";
import { PremiumHeader } from "@/components/marketing/PremiumHeader";
import { HowItWorksRoleSlider } from "@/components/marketing/HowItWorksRoleSlider";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "How King Sparkon Tracker Works | Inventory, Tickets, Checkout & Payouts",
  description:
    "A step-by-step explanation of how King Sparkon Tracker handles barcode inventory, QR ticket sales and gate verification, cart checkout, worker scans, tips and affiliate payouts — with role-safe dashboards and audit trails.",
  path: "/how-it-works",
});

export default function HowItWorksPage() {
  return (
    <>
      <PremiumHeader />
      <main className="bg-white text-[var(--ink)]">
        <div className="mx-auto max-w-7xl px-5 py-6 md:px-8"><Breadcrumbs items={[{ label: "How it works" }]} /></div>

        <section className="relative overflow-hidden border-y border-[var(--line)]">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--signal-soft)] via-[var(--surface)] to-[var(--surface)]" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
            <p className="inline-flex rounded-full border border-[var(--signal)]/20 bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]">Workflow</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-[-0.05em] md:text-5xl">Different roles different worlds, using cutting edge solutions</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--steel)]">No hidden steps. Each role has it&apos;s own dashboard with specific features for specific roles, easy to use in both mobile and Desktop view. The guide below follows the actual data flow</p>
          </div>
        </section>

        <HowItWorksRoleSlider />

        <section className="mx-auto max-w-7xl px-5 pb-16 md:px-8">
          <GlassCard variant="elevated" className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-black">Want the full capability list?</h2>
              <p className="mt-1 text-sm leading-6 text-[var(--steel)]">Features are grouped by job-to-be-done, not UI decoration. Each card shows who it serves and what ledger it writes to.</p>
            </div>
            <Link href="/features" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--signal)] bg-[var(--signal)] px-6 text-sm font-extrabold text-white hover:bg-[var(--signal-strong)]">See all features <CheckCircle2 className="h-4 w-4" /></Link>
          </GlassCard>
        </section>
      </main>
    </>
  );
}
