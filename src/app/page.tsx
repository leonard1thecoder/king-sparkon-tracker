import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Building2, CheckCircle2, CreditCard, ShieldCheck, UsersRound, WalletCards } from "lucide-react";
import { ScanLoop } from "@/components/hero/ScanLoop";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Scan Verification Platform",
  description: "Barcode and QR verification for stock movement, website payments, worker tips, affiliate referrals, promotions, and audit trails.",
};

const workflows = [
  "Worker scans barcode or QR at the shelf, counter, or delivery point.",
  "Backend verifies product, status, business scope, and barcode availability.",
  "Transaction records stock movement, payment state, subscriber capture, and audit logs.",
  "Owner sees operational totals, tips, withdrawals, promotions, billing, and reports.",
];

const dashboards = [
  ["Owner", "Products, workers, barcodes, transactions, tips, withdrawals, promotions, reports, audit, billing."],
  ["Worker", "Scan barcodes, register item codes, create multi-line transactions, generate tip links and QR cards."],
  ["Affiliate", "Referral link, QR preview, onboarding, commissions, payout history, marketing assets, performance."],
  ["Admin", "Users, businesses, platform promotions, registered subscribers, scan logs, and platform settings."],
];

const sections = [
  [CreditCard, "Transactions + website payments", "Multi-product SELL and BUY checkout supports CASH, SWIPE_MACHINE, and WEBSITE_PAYMENT with payment URL, status, reference, email, and contact visibility."],
  [WalletCards, "Worker tips + payouts", "Workers create tip payment links and QR cards. Owners review gross, configured fee, net, status, and paid/withdrawal flow."],
  [UsersRound, "Promotions + subscribers", "Promotion quote, audience size, bulk price, channel, schedule, and the 2-day anti-crowding rule are explicit in the UI."],
  [ShieldCheck, "Security + verification", "httpOnly session proxy, role-aware dashboard guard, refresh-once policy, backend rate-limit cooldown display, and barcode audit trails."],
] as const;

export default function MarketingPage() {
  return (
    <main className="bg-[var(--paper)] text-[var(--ink)]">
      <section className="min-h-screen bg-[var(--ink)] text-white">
        <div className="border-b border-white/10 px-5 py-2 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-white/70 md:px-10">
          <span className="text-[var(--signal)]">Live:</span> scan verification · stock movement · tips · payouts · promotions · audit ledger
        </div>
        <div className="grid min-h-[calc(100vh-34px)] gap-10 px-5 py-8 md:grid-cols-[1fr_0.86fr] md:px-10 lg:px-16">
          <div className="flex flex-col justify-end pb-10">
            <Image src="/king-sparkon-logo.png" alt="King Sparkon Tracker logo" width={92} height={92} className="mb-8 rounded-full border border-white/15" priority />
            <div className="barcode-rule mb-8 max-w-xl text-white" />
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--signal)]">Precision product ledger</p>
            <h1 className="mt-5 max-w-5xl font-mono text-5xl font-black uppercase leading-[0.98] tracking-[-0.05em] md:text-7xl">
              Scan. Verify. Move stock. Pay out.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
              King Sparkon Tracker is not crypto. It is barcode and QR operations software for stock rooms, label printers, scan terminals, worker sales, tips, withdrawals, affiliates, promotions, and audit trails.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/register" className="inline-flex min-h-12 items-center justify-center border border-[var(--signal)] bg-[var(--signal)] px-5 font-mono text-sm font-bold uppercase tracking-[0.1em] text-white hover:bg-transparent hover:text-[var(--signal)]">
                Register business
              </Link>
              <Link href="/login" className="inline-flex min-h-12 items-center justify-center border border-white/25 px-5 font-mono text-sm font-bold uppercase tracking-[0.1em] text-white hover:border-white">
                Login terminal
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <ScanLoop />
          </div>
        </div>
      </section>

      <section className="px-5 py-16 md:px-10 lg:px-16">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--signal)]">01 / scan workflow</p>
            <h2 className="mt-4 font-mono text-4xl font-black uppercase tracking-[-0.04em]">A verification loop operators can trust.</h2>
          </div>
          <div className="grid gap-3">
            {workflows.map((item, index) => (
              <div key={item} className="grid grid-cols-[72px_1fr] border border-[var(--line)] bg-white/45">
                <span className="grid place-items-center border-r border-[var(--line)] font-mono text-lg font-black text-[var(--signal)]">{String(index + 1).padStart(2, "0")}</span>
                <p className="p-4 text-sm leading-6 text-[var(--steel)]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-white/35 px-5 py-16 md:px-10 lg:px-16">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--signal)]">02 / dashboards</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {dashboards.map(([role, description]) => (
            <article key={role} className="border border-[var(--line)] bg-[var(--paper)] p-5">
              <Building2 className="h-6 w-6 text-[var(--signal)]" />
              <h3 className="mt-6 font-mono text-xl font-black uppercase">{role}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--steel)]">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-5 py-16 md:px-10 lg:px-16">
        <div className="grid gap-4 md:grid-cols-2">
          {sections.map(([Icon, title, description]) => (
            <article key={title} className="border border-[var(--line)] bg-white/45 p-6">
              <Icon className="h-7 w-7 text-[var(--signal)]" />
              <h3 className="mt-6 font-mono text-2xl font-black uppercase tracking-[-0.03em]">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--steel)]">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[var(--ink)] px-5 py-16 text-white md:px-10 lg:px-16">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--signal)]">03 / pricing + billing</p>
            <h2 className="mt-4 font-mono text-4xl font-black uppercase tracking-[-0.04em]">Backend plans stay source of truth.</h2>
            <p className="mt-4 text-sm leading-7 text-white/65">The UI shows locked upgrade states only from backend policy: Free Trial max 2 workers, Plus max 5 workers, Pro unlocks worker tips, AI analysis, and worker clocker.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {[["FREE_TRIAL", "2 workers"], ["PLUS", "5 workers"], ["PRO", "Unlimited + tips"]].map(([plan, detail]) => (
              <div key={plan} className="border border-white/15 p-5">
                <CheckCircle2 className="h-5 w-5 text-[var(--confirm)]" />
                <p className="mt-5 font-mono text-xl font-black">{plan}</p>
                <p className="mt-2 text-sm text-white/60">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 md:px-10 lg:px-16">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--signal)]">04 / contact</p>
            <h2 className="mt-4 font-mono text-4xl font-black uppercase tracking-[-0.04em]">Send an implementation inquiry.</h2>
            <div className="barcode-rule mt-8 text-[var(--ink)]" />
          </div>
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
