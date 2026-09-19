import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, QrCode, ShieldCheck } from "lucide-react";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { GlassCard } from "@/components/ui/GlassCard";
import { Prose } from "@/components/content/Prose";
import { PremiumHeader } from "@/components/marketing/PremiumHeader";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "QR Ticket Operations Manual | Capacity, Sales & Gate Verification",
  description:
    "How to create events, manage ticket capacity, handle buyer QR tickets and verify entry at the gate with King Sparkon — including capacity visibility and checked-in audit.",
  path: "/guides/qr-ticket-operations",
});

export default function QrGuide() {
  return (
    <>
      <PremiumHeader />
      <main className="bg-white text-[var(--ink)]">
        <div className="mx-auto max-w-7xl px-5 py-6 md:px-8"><Breadcrumbs items={[{ label: "Guides", href: "/guides" }, { label: "QR tickets" }]} /></div>
        <section className="relative overflow-hidden border-y border-[var(--line)]">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface)] via-[var(--signal-soft)] to-[var(--surface)]" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-12">
            <p className="inline-flex rounded-full border border-[var(--signal)]/20 bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]"><QrCode className="mr-1.5 inline h-3.5 w-3.5" /> Guide</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-[-0.05em] md:text-5xl">QR tickets without the gate panic.</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--steel)]">From event creation (Owner) to purchase (User) to gate verification (Worker) — what each dashboard shows, what capacity means, and why checked-in totals never lie.</p>
          </div>
        </section>
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:px-8 lg:grid-cols-[1.65fr_0.85fr]">
          <Prose>
            <h2>Roles at a glance</h2>
            <ul>
              <li><strong>Owner</strong>: <code>/dashboard/owner/tickets/create</code> and <code>/dashboard/owner/tickets</code> — creates events, ticket classes, price and capacity.</li>
              <li><strong>User</strong>: <code>/dashboard/user/tickets/buy</code>, <code>/tickets/checkout/[eventId]</code> — buys tickets, keeps them in <code>/dashboard/user/tickets</code>.</li>
              <li><strong>Worker</strong>: <code>/dashboard/worker/tickets/scan</code> — scans buyer QR at entry; verified vs. rejected is recorded immediately.</li>
            </ul>
            <h2>Capacity you can quote correctly</h2>
            <p>Capacity is not a guess. Each ticket class has <code>quantity, sold, available, checkedIn</code>. The Owner capacity page aggregates tickets, workers, jobs, stock and platform totals so you spot over-selling before it happens.</p>
            <h2>Buyer ticket lifecycle</h2>
            <ol>
              <li>Buyer checks out — payment status, reference and QR are returned by the backend.</li>
              <li>Ticket appears in My Tickets with eventId, ticketType (REGULAR / VIP / VVIP) and quantity.</li>
              <li>At the gate, worker scans the QR. The backend marks fulfilled and prevents re-use of the same ticket code.</li>
              <li>Audit logs record who scanned, when, and for which event.</li>
            </ol>
            <h2>Troubleshooting</h2>
            <h3>Scan says “already checked in”</h3>
            <p>The QR has already been fulfilled. Check the ticket&apos;s collectedAt / fulfilled flag in the buyer&apos;s ticket detail before re-scanning. Don&apos;t override — investigate duplication.</p>
            <h3>Capacity shows negative available</h3>
            <p>More tickets were sold than the configured quantity allows. Reduce the ticket class quantity or close sales immediately and correct via the backend admin report before gating.</p>
            <h3>Buyer can&apos;t find ticket</h3>
            <p>Confirm they purchased while logged in and are viewing <code>/dashboard/user/tickets</code> on the same account. Tickets are bound to customerId, not device.</p>
            <h2>Internal links</h2>
            <ul>
              <li><Link href="/guides/barcode-inventory-guide">Barcode inventory guide</Link> — same ledger principles for stock.</li>
              <li><Link href="/how-it-works">How it works</Link> — five-step lifecycle.</li>
              <li><Link href="/about">About the platform</Link> — why audit-ready design matters.</li>
            </ul>
          </Prose>
          <div className="space-y-5">
            <GlassCard variant="elevated">
              <p className="font-mono text-xs font-black uppercase tracking-[0.14em] text-[var(--muted)]">Before the event checklist</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--steel)]">
                <li>• Each ticket class has a correct quantity and price</li>
                <li>• Test purchase with one real buyer account</li>
                <li>• Worker device camera and scan permission verified</li>
                <li>• At least one worker assigned to the gate scan role</li>
              </ul>
              <Link href="/features" className="mt-5 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-[var(--signal)] bg-[var(--signal)] px-4 text-sm font-extrabold text-white hover:bg-[var(--signal-strong)]">Explore features <ArrowRight className="h-4 w-4" /></Link>
            </GlassCard>
            <GlassCard variant="subtle" className="flex gap-3">
              <ShieldCheck className="h-5 w-5 shrink-0 text-[var(--signal)]" />
              <div><p className="text-sm font-black">Never screenshot QR codes</p><p className="mt-1 text-sm leading-6 text-[var(--steel)]">Forwarded screenshots break audit (no buyer identity). Always have the buyer show the ticket from their authenticated My Tickets screen.</p></div>
            </GlassCard>
          </div>
        </div>
      </main>
    </>
  );
}
