import Link from "next/link";
import { ArrowRight, BadgeCheck, Megaphone, QrCode, WalletCards } from "lucide-react";

const affiliateStats = [
  ["180+", "Registered affiliates", "Promoters ready to push barcode inventory, event hosting, and job opportunity hosting."],
  ["4,800+", "Potential leads", "Business owners, event hosts, retailers, and employers that affiliates can introduce."],
  ["920+", "Accepted leads", "Qualified leads that can move into owner trials, demos, and sales follow-up."],
  ["R65k+", "Tracked earnings", "Commission visibility with simple earning records and payout readiness."],
] as const;

const affiliateChannels = [
  ["Barcode inventory", "Promote tracking for stock, workers, scans, products, and reports."],
  ["Event hosting", "Promote QR tickets, capacity views, gate scanning, and buyer access."],
  ["Job opportunity hosting", "Promote business hiring posts and employee discovery workflows."],
] as const;

export function AffiliateProgramSection() {
  return (
    <section id="affiliate" className="scroll-mt-28 px-5 py-16 md:px-8 lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-8 overflow-hidden rounded-[2.75rem] bg-[var(--ink)] p-5 text-white shadow-[var(--shadow-depth)] enterprise-grid md:p-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">05 / affiliate program</p>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.055em] md:text-6xl">Beat King Sparkon marketing and earn commission.</h2>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/68 md:text-base">
            Affiliates get a focused dashboard for potential clients, accepted leads, earnings, and easy payout readiness. Promote barcode inventory, event hosting, and job opportunity hosting without guessing where the money is.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/register?plan=FREE_AFFILIATE&privilege=AFFILIATE&service=FREE_AFFILIATE_ACCESS" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--gold)] bg-[var(--gold)] px-6 font-black text-[var(--ink)] shadow-[var(--shadow-soft)] hover:border-white hover:bg-white">
              Join affiliate program <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/dashboard/affiliate" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] px-6 font-bold text-white shadow-[var(--shadow-soft)] hover:border-[var(--gold)]">
              Affiliate dashboard
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-white/[0.07] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.36)] backdrop-blur-xl md:p-6">
          <div className="pointer-events-none absolute inset-0 scan-grid opacity-70" />
          <div className="contact-dashboard-glow pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--gold)]/24 blur-3xl" />
          <div className="relative z-10 grid gap-4 sm:grid-cols-2">
            {affiliateStats.map(([value, label, copy]) => (
              <article key={label} className="rounded-[1.7rem] border border-white/10 bg-white/[0.08] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.22)] backdrop-blur">
                <p className="font-mono text-3xl font-black tracking-[-0.08em] text-[var(--gold)]">{value}</p>
                <h3 className="mt-3 text-lg font-black tracking-[-0.03em] text-white">{label}</h3>
                <p className="mt-2 text-sm leading-6 text-white/62">{copy}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 grid gap-4 md:grid-cols-3">
          {affiliateChannels.map(([title, copy], index) => (
            <article key={title} className="rounded-[1.85rem] border border-white/10 bg-white/[0.06] p-5 text-white shadow-[0_22px_70px_rgba(0,0,0,0.22)] backdrop-blur hover:-translate-y-1 hover:border-[var(--gold)]">
              {index === 0 ? <QrCode className="h-6 w-6 text-[var(--gold)]" /> : index === 1 ? <Megaphone className="h-6 w-6 text-[var(--gold)]" /> : <WalletCards className="h-6 w-6 text-[var(--gold)]" />}
              <h3 className="mt-5 text-2xl font-black tracking-[-0.04em]">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/64">{copy}</p>
              <div className="mt-5 flex items-center gap-2 text-sm font-black text-[var(--gold)]">
                <BadgeCheck className="h-4 w-4" /> Commission-ready lead flow
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
