import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Wallet } from "lucide-react";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { GlassCard } from "@/components/ui/GlassCard";
import { Prose } from "@/components/content/Prose";
import { PremiumHeader } from "@/components/marketing/PremiumHeader";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Worker Tips, Fees & Withdrawals Guide | Transparent Payouts",
  description:
    "How worker tip QR codes, callback URLs, gross/fee/net transparency and withdrawal status work in King Sparkon Tracker — and how owners approve payouts without hidden fees.",
  path: "/guides/worker-tips-payouts",
});

export default function TipsGuide() {
  return (
    <>
      <PremiumHeader />
      <main className="bg-white text-[var(--ink)]">
        <div className="mx-auto max-w-7xl px-5 py-6 md:px-8"><Breadcrumbs items={[{ label: "Guides", href: "/guides" }, { label: "Worker tips" }]} /></div>
        <section className="relative overflow-hidden border-y border-[var(--line)]">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--signal-soft)] via-white to-white" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-12">
            <p className="inline-flex rounded-full border border-[var(--signal)]/20 bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]"><Wallet className="mr-1.5 inline h-3.5 w-3.5" /> Guide</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-[-0.05em] md:text-5xl">Worker tips that everyone can verify.</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--steel)]">Tip QR, callback URL, gross/fee/net and withdrawal status — what each number means, which dashboard shows it, and how owners move money without losing the audit trail.</p>
          </div>
        </section>
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:px-8 lg:grid-cols-[1.65fr_0.85fr]">
          <Prose>
            <h2>The tip object, honestly</h2>
            <p>From <code>src/lib/types/backend.ts</code>: a Tip has <code>workerId, tipAmount, callbackUrl, status, grossAmount, feeAmount, netAmount, paymentReference, paymentUrl, qrCodeUrl</code>. Owners see gross/fee/net at <code>/dashboard/owner/tips</code>; workers at <code>/dashboard/worker/tips</code>; users at <code>/dashboard/user/tips</code>.</p>
            <h2>How a tip flows</h2>
            <ol>
              <li>Worker exposes QR (or PayPal.me where enabled) — the QR encodes the worker&apos;s tip endpoint.</li>
              <li>Customer enters tipAmount and callbackUrl. POST <code>/api/tips</code> returns paymentUrl and reference.</li>
              <li>After payment, PATCH <code>/api/tips/&#123;id&#125;/paid</code> can mark paid where the flow requires manual confirmation.</li>
              <li>Owner reviews tip detail: gross (what customer paid), fee (platform fee), net (worker receives). Nothing is hidden in rounding.</li>
            </ol>
            <h2>Withdrawals without confusion</h2>
            <p>POST <code>/api/tips/withdrawals</code> and <code>/api/transactions/withdrawals</code> create withdrawal records with <code>grossAmount, feeAmount, netAmount, status, createdAt</code>. Owners track them at <code>/dashboard/owner/withdrawals</code>. Status is the source of truth — don&apos;t rely on screenshots.</p>
            <h2>Common mistakes</h2>
            <h3>Tip QR doesn&apos;t resolve</h3>
            <p>Verify the worker&apos;s profile has a tipQrCodeUrl and that the workerId is valid. Worker accounts must be created by the Owner before tips work — self-registered workers can&apos;t appear without business linkage.</p>
            <h3>Callback URL missing</h3>
            <p>callbackUrl is required. It tells the tip service where to redirect after payment. Use an HTTPS URL you control, or the platform&apos;s default return URL shown in the tip form helper.</p>
            <h3>Fee looks wrong</h3>
            <p>Compare gross vs net, not tipAmount alone. Platform fees are computed server-side and exposed as feeAmount — the UI never calculates fees locally.</p>
            <h2>Links</h2>
            <ul>
              <li><Link href="/guides/barcode-inventory-guide">Barcode inventory</Link> — pre-tip: sell correctly first.</li>
              <li><Link href="/guides/affiliate-referrals">Affiliate referrals</Link> — another earnings flow with visible fees.</li>
            </ul>
          </Prose>
          <div className="space-y-5">
            <GlassCard variant="elevated">
              <p className="font-mono text-xs font-black uppercase tracking-[0.14em] text-[var(--muted)]">Owner checklist</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--steel)]">
                <li>• Tip QR is visible on worker&apos;s profile</li>
                <li>• At least one successful tip before announcing to customers</li>
                <li>• Gross/fee/net visible to owner and worker before withdrawal</li>
              </ul>
              <Link href="/contact" className="mt-5 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-[var(--signal)] bg-[var(--signal)] px-4 text-sm font-extrabold text-white hover:bg-[var(--signal-strong)]">Ask about payouts <ArrowRight className="h-4 w-4" /></Link>
            </GlassCard>
          </div>
        </div>
      </main>
    </>
  );
}
