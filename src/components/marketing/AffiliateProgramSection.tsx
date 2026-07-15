import Link from "next/link";
import { ArrowRight, Megaphone, QrCode, WalletCards } from "lucide-react";
import { BouncingCircleField } from "@/components/marketing/BouncingCircleField";
import { AnimatedStat } from "@/components/ui/AnimatedStat";

const affiliateStats = [
  { end: 180, prefix: "", suffix: "+", compact: false, label: "Registered affiliates", copy: "Promoters ready to push barcode inventory, event hosting, and job opportunity hosting." },
  { end: 4800, prefix: "", suffix: "+", compact: false, label: "Potential leads", copy: "Business owners, event hosts, retailers, and employers that affiliates can introduce." },
  { end: 920, prefix: "", suffix: "+", compact: false, label: "Accepted leads", copy: "Qualified leads that can move into owner trials, demos, and sales follow-up." },
  { end: 65000, prefix: "R", suffix: "+", compact: true, label: "Tracked earnings", copy: "Commission visibility with simple earning records and payout readiness." },
] as const;

const affiliateChannels = [
  { icon: QrCode, eyebrow: "Commission-ready lead flow", title: "Barcode inventory", copy: "Promote tracking for stock, workers, scans, products, and reports." },
  { icon: Megaphone, eyebrow: "Commission-ready lead flow", title: "Event hosting", copy: "Promote QR tickets, capacity views, gate scanning, and buyer access." },
  { icon: WalletCards, eyebrow: "Commission-ready lead flow", title: "Job opportunity hosting", copy: "Promote business hiring posts and employee discovery workflows." },
] as const;

export function AffiliateProgramSection() {
  return (
    <section id="affiliate" className="scroll-mt-28 px-5 py-16 md:px-8 lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-8 overflow-hidden rounded-[2.75rem] border border-[var(--line)] bg-white p-5 text-[var(--ink)] shadow-[var(--shadow-ledger)] md:p-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--signal)]">05 / affiliate program</p>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.055em] md:text-6xl">Beat King Sparkon marketing and earn commission.</h2>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--steel)] md:text-base">
            Affiliates get a focused dashboard for potential clients, accepted leads, earnings, and easy payout readiness. Promote barcode inventory, event hosting, and job opportunity hosting without guessing where the money is.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/register?plan=FREE_AFFILIATE&privilege=AFFILIATE&service=FREE_AFFILIATE_ACCESS" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-6 font-black text-white shadow-[var(--shadow-soft)] hover:border-[var(--accent-hover)] hover:bg-[var(--accent-hover)]">
              Join affiliate program <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/dashboard/affiliate" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--line)] bg-white px-6 font-bold text-[var(--ink)] shadow-[var(--shadow-soft)] hover:border-[var(--accent-hover)] hover:text-[var(--accent-hover)]">
              Affiliate dashboard
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2.4rem] border border-[var(--line)] bg-[var(--signal-soft)] p-5 shadow-[var(--shadow-soft)] md:p-6">
          <div className="pointer-events-none absolute inset-0 scan-grid opacity-25" />
          <div className="contact-dashboard-glow pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--signal)]/12 blur-3xl" />
          <div className="relative z-10 grid gap-4 sm:grid-cols-2">
            {affiliateStats.map(({ end, prefix, suffix, compact, label, copy }) => (
              <article key={label} className="rounded-[1.7rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)]">
                <AnimatedStat end={end} prefix={prefix} suffix={suffix} compact={compact} className="font-mono text-3xl font-black tracking-[-0.08em] text-[var(--signal-strong)]" />
                <h3 className="mt-3 text-lg font-black tracking-[-0.03em] text-[var(--ink)]">{label}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--steel)]">{copy}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <BouncingCircleField items={affiliateChannels} ariaLabel="Affiliate promotion channels" variant="stats" />
        </div>
      </div>
    </section>
  );
}
