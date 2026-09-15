import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Megaphone } from "lucide-react";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { GlassCard } from "@/components/ui/GlassCard";
import { Prose } from "@/components/content/Prose";
import { PremiumHeader } from "@/components/marketing/PremiumHeader";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Affiliate Referrals & Campaigns Guide | Codes, Quotes & Commissions",
  description:
    "How affiliate referral codes, promotion links, audience & channel targeting, and commission tracking work in King Sparkon Tracker — and how to run promotions with a quote before sending.",
  path: "/guides/affiliate-referrals",
});

export default function AffiliateGuide() {
  return (
    <>
      <PremiumHeader />
      <main className="bg-white text-[var(--ink)]">
        <div className="mx-auto max-w-7xl px-5 py-6 md:px-8"><Breadcrumbs items={[{ label: "Guides", href: "/guides" }, { label: "Affiliate referrals" }]} /></div>
        <section className="relative overflow-hidden border-y border-[var(--line)]">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface)] via-[var(--signal-soft)] to-[var(--surface)]" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-12">
            <p className="inline-flex rounded-full border border-[var(--signal)]/20 bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]"><Megaphone className="mr-1.5 inline h-3.5 w-3.5" /> Guide</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-[-0.05em] md:text-5xl">Affiliate earnings you can actually prove.</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--steel)]">Referral code, promotion link, QR code, audience targeting and commission ledger — how affiliates grow without guessing where earnings came from.</p>
          </div>
        </section>
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:px-8 lg:grid-cols-[1.65fr_0.85fr]">
          <Prose>
            <h2>What an affiliate gets</h2>
            <p>After registering as AFFILIATE (physical address required), the backend returns <code>affiliateCode, affiliatePromotionUrl, affiliateQrCodeUrl</code> on the TrackerUser. These appear on <code>/dashboard/affiliate</code> and in <code>GET /api/affiliate/referrals</code>, <code>/commissions</code>, <code>/payouts</code>.</p>
            <h2>Promotions: quote before you send</h2>
            <p>Owners create promotions with <code>title, message, landingUrl, channel (EMAIL|WHATSAPP|ANY), audience (ALL_SUBSCRIBERS | REGISTERED_AFFILIATES …), scheduledFor</code>. GET <code>/api/promotions/quote</code> returns <code>targetCount, bulkPrice, currency</code> so the owner sees cost before confirming. Use POST <code>/api/promotions</code> to send.</p>
            <h2>Who counts as audience</h2>
            <ul>
              <li><code>ALL_SUBSCRIBERS</code> — every subscriber contact the backend knows</li>
              <li><code>REGISTERED_SUBSCRIBERS</code> — only subscribers with accounts</li>
              <li><code>REGISTERED_AFFILIATES</code> / <code>UNREGISTERED_AFFILIATES</code> — targeting by affiliate state</li>
            </ul>
            <h2>Troubleshooting</h2>
            <h3>Referral not attributing</h3>
            <p>Ensure the buyer used the exact affiliateCode or affiliatePromotionUrl at registration. Codes are case-sensitive and trimmed server-side. Check the referral list in the affiliate dashboard — unlinked codes appear as unmatched contacts, not hidden fees.</p>
            <h3>Quote shows zero targetCount</h3>
            <p>Audience + channel filter matched no contacts. Try ANY channel or ALL_SUBSCRIBERS to confirm data exists before narrowing.</p>
            <h2>Related</h2>
            <ul>
              <li><Link href="/guides/worker-tips-payouts">Worker tips &amp; payouts</Link> — another earnings flow.</li>
              <li><Link href="/features">Features map</Link></li>
            </ul>
          </Prose>
          <div className="space-y-5">
            <GlassCard variant="elevated">
              <p className="font-mono text-xs font-black uppercase tracking-[0.14em] text-[var(--muted)]">Affiliate checklist</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--steel)]">
                <li>• Affiliate code copied exactly (no extra spaces)</li>
                <li>• Promotion link tested in an incognito browser</li>
                <li>• QR printed clearly for in-store use</li>
                <li>• Commission visible before requesting payout</li>
              </ul>
              <Link href="/register?plan=FREE_AFFILIATE&privilege=AFFILIATE&service=FREE_AFFILIATE_ACCESS" className="mt-5 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-[var(--signal)] bg-[var(--signal)] px-4 text-sm font-extrabold text-white hover:bg-[var(--signal-strong)]">Register as affiliate <ArrowRight className="h-4 w-4" /></Link>
            </GlassCard>
          </div>
        </div>
      </main>
    </>
  );
}
