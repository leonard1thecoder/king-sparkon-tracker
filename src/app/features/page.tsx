import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Barcode } from "lucide-react";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { GlassCard } from "@/components/ui/GlassCard";
import { PremiumHeader } from "@/components/marketing/PremiumHeader";
import { FeaturesRoleSlider } from "@/components/marketing/FeaturesRoleSlider";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Features | Barcode Inventory, QR Tickets, Jobs, Tips & Affiliate Platform",
  description:
    "Explore King Sparkon Tracker features: barcode inventory with unit-level tracking, QR ticket capacity and verification, cart checkout, job opportunities, worker tips, affiliate referrals, promotions, billing and audit-ready reports.",
  path: "/features",
});

export default function FeaturesPage() {
  return (
    <>
      <PremiumHeader />
      <main className="bg-white text-[var(--ink)]">
        <div className="mx-auto max-w-7xl px-5 py-6 md:px-8"><Breadcrumbs items={[{ label: "Features" }]} /></div>

        <section className="relative overflow-hidden border-y border-[var(--line)]">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface)] via-[var(--signal-soft)] to-[var(--surface)]" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
            <p className="inline-flex rounded-full border border-[var(--signal)]/20 bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]">Platform Capabilities</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-[-0.05em] md:text-5xl">Built around real work, not dashboard decoration</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--steel)]">Explore King Sparkon Tracker features: barcode inventory with unit-level tracking, QR ticket capacity & gate verification, cart checkout, job opportunities, worker tips, affiliate referrals, promotions, and role-safe dashboards.</p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-12">
          <FeaturesRoleSlider />

          {/* Dedicated UIF System Feature Card */}
          <GlassCard variant="highlighted" className="mt-8 grid gap-6 md:grid-cols-2 border border-[var(--signal)]/30">
            <div>
              <p className="font-mono text-xs font-black uppercase tracking-[0.14em] text-[var(--signal-strong)]">Public Service Integration</p>
              <h2 className="mt-2 text-2xl font-black text-[var(--ink)]">UIF Online System Portal</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--steel)]">
                Our user dashboard integrates South Africa&apos;s Department of Employment and Labour UIF Online service. Users can verify benefit history via 13-digit SA ID and request secure UIF Online password updates under strict POPIA data privacy controls.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                <span className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-[var(--steel)]">13-digit ID Validation</span>
                <span className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-[var(--steel)]">Benefit History Fetch</span>
                <span className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-[var(--steel)]">POPIA Safeguards</span>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/dashboard/user/uif/status" className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[var(--signal)] bg-[var(--signal)] px-4 text-sm font-extrabold text-white hover:bg-[var(--signal-strong)]">
                  Check UIF Status (/dashboard/user/uif/status)
                </Link>
                <Link href="/dashboard/user/uif/password" className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[var(--line-strong)] bg-white px-4 text-sm font-extrabold hover:border-[var(--signal)]">
                  Update Password (/dashboard/user/uif/password)
                </Link>
              </div>
            </div>
            <div className="rounded-xl border border-[var(--line)] bg-white p-5">
              <p className="font-mono text-xs font-black uppercase tracking-[0.14em] text-[var(--muted)]">POPIA Compliance Safeguards</p>
              <p className="mt-2 text-sm font-extrabold text-[var(--ink)]">Protection of Personal Information Act (POPIA)</p>
              <p className="mt-2 text-xs leading-5 text-[var(--steel)]">
                Under POPIA principles, 13-digit SA ID numbers and credentials are processed strictly in-memory or via secure encrypted backend channels. Personal identifiers are never sold, cached inappropriately, or misused.
              </p>
              <Link href="/privacy" className="mt-4 inline-flex text-xs font-extrabold text-[var(--signal-strong)] hover:underline">
                Read our complete POPIA Privacy Policy →
              </Link>
            </div>
          </GlassCard>

          <GlassCard variant="highlighted" className="mt-8 grid gap-6 md:grid-cols-2">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-black"><BadgeCheck className="h-5 w-5 text-[var(--signal)]" /> Reports you can actually trust</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--steel)]">Inventory summary, alcohol movement, product movement and audit logs are read from GET /api/reports/* and GET /api/audit-logs. Totals are never synthesized in the browser. If the backend doesn&apos;t return it, the UI shows an empty state — not a fake chart.</p>
              <Link href="/how-it-works" className="mt-4 inline-flex text-sm font-extrabold text-[var(--signal-strong)] hover:text-[var(--accent-hover)]">Learn how the ledger works →</Link>
            </div>
            <div className="rounded-xl border border-[var(--line)] bg-white p-5">
              <p className="font-mono text-xs font-black uppercase tracking-[0.14em] text-[var(--muted)]">Billing & plans</p>
              <p className="mt-2 text-sm font-extrabold">FREE_TRIAL → PLUS (max 5 workers) → PRO (unlimited). Pro unlocks WORKER_TIPS_PLATFORM, BUSINESS_ANALYSIS_AI and WORKER_CLOCKER.</p>
              <p className="mt-2 text-xs leading-5 text-[var(--steel)]">The UI respects backend feature locks. Locked features show a coherent upsell, not a dead button.</p>
              <Link href="/guides/barcode-inventory-guide" className="mt-4 inline-flex min-h-10 items-center justify-center rounded-xl border border-[var(--signal)] bg-[var(--signal)] px-4 text-sm font-extrabold text-white hover:bg-[var(--signal-strong)]">Start with inventory <Barcode className="h-4 w-4" /></Link>
            </div>
          </GlassCard>
        </section>
      </main>
    </>
  );
}
