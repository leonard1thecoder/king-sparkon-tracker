import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, CheckCircle2, CreditCard, ShieldCheck, UsersRound, WalletCards } from "lucide-react";
import { ScanLoop } from "@/components/hero/ScanLoop";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "King Sparkon Tracker | Scan Smarter. Track Faster.",
  description: "Professional barcode and QR inventory tracking for stock movement, scan verification, payments, tips, affiliate programs, pricing, reports, and audit-ready operations.",
};

const trustMetrics = [
  ["Products tracked", "18.4K", "Across stock rooms and sales counters"],
  ["Scans processed", "426K", "Barcode and QR events verified"],
  ["Active users", "1.2K", "Owners, workers, affiliates, admins"],
  ["Inventory accuracy", "99.4%", "Audit-first stock visibility"],
] as const;

const workflows = [
  ["01", "Scan", "Workers scan barcodes or QR codes at the shelf, counter, loading bay, or delivery point."],
  ["02", "Verify", "The system checks product state, barcode availability, payment status, and business ownership."],
  ["03", "Move stock", "Sales, purchases, tips, referrals, promotions, withdrawals, and stock changes are recorded."],
  ["04", "Report", "Owners see stock health, scan activity, payments, branch visibility, and audit trails."],
] as const;

const featurePillars = [
  {
    icon: ShieldCheck,
    title: "Barcode verification",
    description: "Make every scan meaningful. Verify product ownership, item status, barcode availability, and branch context before stock moves.",
    benefits: ["QR and barcode support", "Approval-ready scan trail", "Worker-safe terminal flow"],
  },
  {
    icon: BarChart3,
    title: "Inventory dashboard",
    description: "Give owners a clean command center for product counts, low-stock alerts, branch movement, and scan activity.",
    benefits: ["Live stock visibility", "Low-stock monitoring", "Mobile product cards"],
  },
  {
    icon: CreditCard,
    title: "Transactions and payments",
    description: "Track BUY and SELL movements with payment method, customer contact, payment URL, payment reference, and status visibility.",
    benefits: ["Website payment links", "Cash and card records", "Reference tracking"],
  },
  {
    icon: WalletCards,
    title: "Worker tips and payouts",
    description: "Workers generate tip QR cards and payment links while owners review gross amount, platform fee, net amount, and payout state.",
    benefits: ["Worker QR tipping", "Owner payout review", "Fee visibility"],
  },
  {
    icon: UsersRound,
    title: "Promotions and subscribers",
    description: "Run controlled campaigns with audience size, channel, schedule, quote visibility, and subscriber capture built into the workflow.",
    benefits: ["Promotion quote flow", "Subscriber capture", "Campaign scheduling"],
  },
  {
    icon: ShieldCheck,
    title: "Security and audit trail",
    description: "Role-aware dashboards, httpOnly session proxy, backend cooldown display, and audit records keep operations accountable.",
    benefits: ["Owner / worker roles", "Audit-ready records", "Secure session proxy"],
  },
] as const;

const affiliateBenefits = [
  ["Referral links", "Affiliates get trackable links and QR previews they can share with businesses."],
  ["Commission visibility", "Show referral performance, commission status, payout history, and business conversion quality."],
  ["Marketing assets", "Give partners campaign material, product explanations, and QR-ready promotion tools."],
  ["Growth channel", "Turn satisfied users, workers, and promoters into measurable acquisition partners."],
] as const;

const pricingPlans = [
  {
    name: "Free Trial",
    price: "R0",
    caption: "14-day start",
    highlight: false,
    description: "For a small team testing barcode tracking before committing to a paid plan.",
    features: ["Up to 2 workers", "Basic product tracking", "Barcode scanning", "Owner dashboard", "Trial support"],
  },
  {
    name: "Plus",
    price: "Stripe price",
    caption: "Growing teams",
    highlight: true,
    description: "For businesses that need more workers, cleaner stock visibility, and stronger daily operations.",
    features: ["Up to 5 workers", "Inventory dashboard", "Transactions", "Promotions", "Reports"],
  },
  {
    name: "Pro",
    price: "Stripe price",
    caption: "Full operations",
    highlight: false,
    description: "For businesses that need unlimited workers, tips, advanced reporting, and complete operational visibility.",
    features: ["Unlimited workers", "Worker tips", "Advanced reporting", "AI analysis ready", "Worker clocker ready"],
  },
] as const;

export default function MarketingPage() {
  return (
    <main className="bg-[var(--paper)] text-[var(--ink)]">
      <section className="relative overflow-hidden bg-[var(--ink)] text-white">
        <div className="absolute left-1/2 top-[-18rem] h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-[var(--signal)]/10 blur-3xl" />
        <div className="absolute right-[-16rem] top-24 h-[34rem] w-[34rem] rounded-full bg-[var(--gold)]/10 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent opacity-70" />

        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/king-sparkon-logo.png" alt="King Sparkon Tracker logo" width={48} height={48} className="rounded-[1.15rem] border border-white/15 bg-white/5 p-1" priority />
            <div>
              <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[var(--gold)]">Barcode operations</p>
              <p className="font-black uppercase tracking-[-0.02em]">King Sparkon Tracker</p>
            </div>
          </Link>
          <div className="hidden items-center gap-6 text-sm font-semibold text-white/64 lg:flex">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#affiliate" className="hover:text-white">Affiliate</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <Link href="/login" className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-4 text-sm font-bold text-white/80 hover:border-white/35 hover:text-white">
              Login terminal
            </Link>
            <Link href="/register" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-4 text-sm font-bold text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ember)]">
              Register business <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </nav>

        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-5 pb-16 pt-8 md:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:pb-24 lg:pt-16">
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-3 py-2 font-mono text-[0.68rem] font-bold uppercase tracking-[0.16em] text-white/70 shadow-[var(--shadow-soft)] backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[var(--confirm)]" /> Live scan verification
            </div>
            <h1 className="mt-6 max-w-5xl text-5xl font-black leading-[0.95] tracking-[-0.07em] md:text-7xl xl:text-8xl">
              Scan smarter. Track faster.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
              Real-time barcode tracking for modern teams. Monitor inventory movement, reduce errors, manage tips and referrals, and keep stock visible from one premium operations dashboard.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard/worker/scan" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-6 font-bold text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ember)]">
                Start Scanning <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/dashboard/owner" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/18 px-6 font-bold text-white hover:border-white/35 hover:bg-white/5">
                View Dashboard
              </Link>
            </div>
          </div>
          <ScanLoop />
        </div>

        <div className="relative z-10 border-t border-white/10 bg-white/[0.03] backdrop-blur">
          <div className="mx-auto grid max-w-7xl gap-3 px-5 py-5 sm:grid-cols-2 md:px-8 xl:grid-cols-4">
            {trustMetrics.map(([label, value, detail]) => (
              <div key={label} className="rounded-[1.4rem] border border-white/10 bg-white/[0.05] p-4 shadow-[var(--shadow-soft)]">
                <p className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-white/45">{label}</p>
                <p className="money mt-2 text-3xl font-black text-white">{value}</p>
                <p className="mt-1 text-sm text-white/55">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 lg:py-24">
        <div className="grid gap-8 rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-5 shadow-[var(--shadow-ledger)] md:p-8 lg:grid-cols-[0.82fr_1.18fr]">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--signal)]">01 / scan workflow</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] md:text-5xl">A verification loop operators can trust.</h2>
            <p className="mt-4 text-sm leading-7 text-[var(--steel)]">The product flow is simple: scan, verify, move stock, and report. No weak dashboards, no hidden status, no guessing what changed.</p>
          </div>
          <div className="grid gap-3">
            {workflows.map(([step, title, description]) => (
              <div key={step} className="grid gap-4 rounded-[1.5rem] border border-[var(--line)] bg-[var(--paper)] p-4 shadow-[var(--shadow-soft)] sm:grid-cols-[86px_1fr]">
                <div className="grid h-16 w-16 place-items-center rounded-[1.25rem] bg-[var(--ink)] font-mono text-lg font-black text-[var(--gold)]">{step}</div>
                <div>
                  <h3 className="text-xl font-black tracking-[-0.03em]">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--steel)]">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="px-5 py-16 md:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--signal)]">02 / complete platform</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] md:text-6xl">Every major feature explained clearly.</h2>
            <p className="mt-4 text-sm leading-7 text-[var(--steel)] md:text-base">The landing page must sell the real product: inventory, scanning, payments, worker tips, promotions, affiliates, reports, and security.</p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featurePillars.map(({ icon: Icon, title, description, benefits }) => (
              <article key={title} className="group rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-6 shadow-[var(--shadow-soft)] hover:-translate-y-1 hover:border-[var(--line-strong)] hover:shadow-[var(--shadow-ledger)]">
                <div className="grid h-14 w-14 place-items-center rounded-[1.25rem] bg-[var(--ink)] text-[var(--gold)] shadow-[var(--shadow-soft)]">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-2xl font-black tracking-[-0.04em]">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--steel)]">{description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {benefits.map((benefit) => (
                    <span key={benefit} className="rounded-full border border-[var(--line)] bg-[var(--paper)] px-3 py-1.5 text-xs font-bold text-[var(--steel)]">
                      {benefit}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="affiliate" className="bg-[var(--ink)] px-5 py-16 text-white md:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">03 / affiliate program</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] md:text-6xl">Turn promoters into a measurable growth channel.</h2>
            <p className="mt-5 text-sm leading-7 text-white/65 md:text-base">Affiliates should not feel like an afterthought. Give them referral links, QR previews, commission visibility, payout tracking, and assets that help them sell the platform properly.</p>
            <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-[var(--shadow-depth)]">
              <div className="barcode-rule text-white" />
              <p className="mt-4 text-sm leading-7 text-white/60">Best for promoters, resellers, field agents, worker networks, and local business partners who can introduce stores to barcode tracking.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {affiliateBenefits.map(([title, description]) => (
              <article key={title} className="rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-5 shadow-[var(--shadow-soft)] backdrop-blur hover:bg-white/[0.08]">
                <CheckCircle2 className="h-5 w-5 text-[var(--gold)]" />
                <h3 className="mt-5 text-xl font-black tracking-[-0.03em]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/62">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="px-5 py-16 md:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--signal)]">04 / pricing model</p>
              <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] md:text-6xl">Clear plans for real business growth.</h2>
              <p className="mt-4 text-sm leading-7 text-[var(--steel)] md:text-base">Prices are managed by Stripe/backend billing, but the landing page now communicates the model: trial, growing team, and full operations.</p>
            </div>
            <Link href="/register" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-6 font-bold text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ember)]">
              Start free trial <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <article key={plan.name} className={`relative overflow-hidden rounded-[2rem] border p-6 shadow-[var(--shadow-soft)] ${plan.highlight ? "border-[var(--signal)] bg-[var(--ink)] text-white shadow-[var(--shadow-depth)]" : "border-[var(--line)] bg-[var(--surface-strong)] text-[var(--ink)]"}`}>
                {plan.highlight ? <div className="absolute right-5 top-5 rounded-full bg-[var(--gold)] px-3 py-1 text-xs font-black uppercase tracking-[0.08em] text-[var(--ink)]">Recommended</div> : null}
                <p className={`font-mono text-xs font-bold uppercase tracking-[0.16em] ${plan.highlight ? "text-[var(--gold)]" : "text-[var(--signal)]"}`}>{plan.caption}</p>
                <h3 className="mt-4 text-3xl font-black tracking-[-0.04em]">{plan.name}</h3>
                <p className="money mt-4 text-4xl font-black">{plan.price}</p>
                <p className={`mt-4 text-sm leading-7 ${plan.highlight ? "text-white/65" : "text-[var(--steel)]"}`}>{plan.description}</p>
                <div className="mt-6 grid gap-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3 text-sm font-semibold">
                      <CheckCircle2 className={`h-4 w-4 shrink-0 ${plan.highlight ? "text-[var(--gold)]" : "text-[var(--confirm)]"}`} />
                      <span className={plan.highlight ? "text-white/82" : "text-[var(--steel)]"}>{feature}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 md:px-8 lg:pb-24">
        <div className="grid gap-8 rounded-[2.25rem] border border-[var(--line)] bg-[var(--ink)] p-6 text-white shadow-[var(--shadow-depth)] lg:grid-cols-[0.8fr_1.2fr] lg:p-8">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">05 / contact</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.05em]">Send an implementation inquiry.</h2>
            <p className="mt-4 text-sm leading-7 text-white/65">Tell us what you track, where workers scan, how affiliates will promote, and which reports owners need first.</p>
            <div className="barcode-rule mt-8 text-white" />
          </div>
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
