import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, CheckCircle2, CreditCard, ShieldCheck, UsersRound, WalletCards } from "lucide-react";
import { ScanLoop } from "@/components/hero/ScanLoop";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "King Sparkon Tracker | Scan Smarter. Track Faster.",
  description: "Professional barcode and QR inventory tracking for stock movement, scan verification, payments, tips, reports, and audit-ready operations.",
};

const trustMetrics = [
  ["Products tracked", "18.4K", "Across stock rooms and sales counters"],
  ["Scans processed", "426K", "Barcode and QR events verified"],
  ["Active users", "1.2K", "Owners, workers, affiliates, admins"],
  ["Inventory accuracy", "99.4%", "Audit-first stock visibility"],
] as const;

const workflows = [
  "Scan barcodes or QR codes at the shelf, counter, loading bay, or delivery point.",
  "Verify product state, barcode availability, payment status, and business ownership instantly.",
  "Record stock movement, tips, referrals, withdrawals, subscriber capture, and audit logs.",
  "Give owners one clean dashboard for stock health, scan activity, payments, and reports.",
];

const sections = [
  [CreditCard, "Transactions and website payments", "Sell and buy stock with clear payment state, payment URL, reference, email, and contact visibility."],
  [WalletCards, "Worker tips and payouts", "Workers generate tip links and QR cards while owners review gross, fee, net, and payout status."],
  [UsersRound, "Promotions and subscribers", "Promotion quote, audience size, schedule, channel, and anti-crowding rules stay visible."],
  [ShieldCheck, "Security and verification", "Role-aware dashboards, httpOnly session proxy, refresh policy, cooldown display, and audit trails."],
] as const;

export default function MarketingPage() {
  return (
    <main className="bg-[var(--paper)] text-[var(--ink)]">
      <section className="relative overflow-hidden bg-[var(--ink)] text-white">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent opacity-70" />
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/king-sparkon-logo.png" alt="King Sparkon Tracker logo" width={48} height={48} className="rounded-2xl border border-white/15 bg-white/5 p-1" priority />
            <div>
              <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[var(--gold)]">Barcode operations</p>
              <p className="font-black uppercase tracking-[-0.02em]">King Sparkon Tracker</p>
            </div>
          </Link>
          <div className="hidden items-center gap-3 md:flex">
            <Link href="/login" className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)] border border-white/15 px-4 text-sm font-bold text-white/80 hover:border-white/35 hover:text-white">
              Login terminal
            </Link>
            <Link href="/register" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--signal)] bg-[var(--signal)] px-4 text-sm font-bold text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ember)]">
              Register business <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </nav>

        <div className="mx-auto grid max-w-7xl gap-10 px-5 pb-16 pt-8 md:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:pb-24 lg:pt-16">
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3 py-2 font-mono text-[0.68rem] font-bold uppercase tracking-[0.16em] text-white/70">
              <span className="h-2 w-2 rounded-full bg-[var(--confirm)]" /> Live scan verification
            </div>
            <h1 className="mt-6 max-w-5xl text-5xl font-black leading-[0.95] tracking-[-0.07em] md:text-7xl xl:text-8xl">
              Scan smarter. Track faster.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
              Real-time barcode tracking for modern teams. Monitor inventory movement, reduce errors, and keep stock visible from one serious operations dashboard.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard/worker/scan" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--signal)] bg-[var(--signal)] px-5 font-bold text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ember)]">
                Start Scanning <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/dashboard/owner" className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-md)] border border-white/18 px-5 font-bold text-white hover:border-white/35 hover:bg-white/5">
                View Dashboard
              </Link>
            </div>
          </div>
          <ScanLoop />
        </div>

        <div className="border-t border-white/10 bg-white/[0.03]">
          <div className="mx-auto grid max-w-7xl gap-3 px-5 py-5 sm:grid-cols-2 md:px-8 xl:grid-cols-4">
            {trustMetrics.map(([label, value, detail]) => (
              <div key={label} className="rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.04] p-4">
                <p className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-white/45">{label}</p>
                <p className="money mt-2 text-3xl font-black text-white">{value}</p>
                <p className="mt-1 text-sm text-white/55">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 lg:py-24">
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--signal)]">01 / scan workflow</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] md:text-5xl">A verification loop operators can trust.</h2>
            <p className="mt-4 text-sm leading-7 text-[var(--steel)]">The interface is built around the real job: scan, verify, move stock, and see what changed without hunting through messy screens.</p>
          </div>
          <div className="grid gap-3">
            {workflows.map((item, index) => (
              <div key={item} className="grid grid-cols-[72px_1fr] rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface-strong)] shadow-[var(--shadow-soft)]">
                <span className="grid place-items-center border-r border-[var(--line)] font-mono text-lg font-black text-[var(--signal)]">{String(index + 1).padStart(2, "0")}</span>
                <p className="p-4 text-sm leading-6 text-[var(--steel)]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-[var(--surface)] px-5 py-16 md:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--signal)]">02 / business tools</p>
              <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] md:text-5xl">Purpose-built for barcode operations.</h2>
            </div>
            <BarChart3 className="hidden h-10 w-10 text-[var(--signal)] md:block" />
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {sections.map(([Icon, title, description]) => (
              <article key={title} className="rounded-[var(--radius-xl)] border border-[var(--line)] bg-white p-6 shadow-[var(--shadow-soft)] hover:-translate-y-0.5 hover:border-[var(--line-strong)]">
                <div className="grid h-12 w-12 place-items-center rounded-[var(--radius-md)] bg-[var(--paper)] text-[var(--signal)]">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-2xl font-black tracking-[-0.04em]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--steel)]">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--ink)] px-5 py-16 text-white md:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">03 / platform plans</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] md:text-5xl">Backend policy stays the source of truth.</h2>
            <p className="mt-4 text-sm leading-7 text-white/65">The UI shows plan limits and locked states from backend policy, not hardcoded fantasy screens.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {[['FREE TRIAL', '2 workers'], ['PLUS', '5 workers'], ['PRO', 'Unlimited + tips']].map(([plan, detail]) => (
              <div key={plan} className="rounded-[var(--radius-lg)] border border-white/12 bg-white/[0.04] p-5">
                <CheckCircle2 className="h-5 w-5 text-[var(--confirm)]" />
                <p className="mt-5 font-mono text-xl font-black">{plan}</p>
                <p className="mt-2 text-sm text-white/60">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 lg:py-24">
        <div className="grid gap-8 rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--ink)] p-6 text-white shadow-[var(--shadow-depth)] lg:grid-cols-[0.8fr_1.2fr] lg:p-8">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">04 / contact</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.05em]">Send an implementation inquiry.</h2>
            <p className="mt-4 text-sm leading-7 text-white/65">Tell us what you track, where workers scan, and which reports owners need first.</p>
            <div className="barcode-rule mt-8 text-white" />
          </div>
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
