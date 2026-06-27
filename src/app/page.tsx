import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, CheckCircle2, CreditCard, ShieldCheck, UsersRound, WalletCards } from "lucide-react";
import { ScanLoop } from "@/components/hero/ScanLoop";
import { AFFILIATE_COMMISSION_SUMMARY, BUSINESS_PRICING_PLANS, SOFTWARE_APPLICATION_OFFERS } from "@/lib/config/business-policy";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "King Sparkon Tracker | Barcode Inventory, Tips, Affiliates & Payments",
  description: "Premium barcode and QR inventory software for stock scanning, transactions, worker tips, affiliate programs, promotions, billing, reporting, and audit-ready business operations.",
  keywords: [
    "King Sparkon Tracker",
    "barcode inventory software",
    "QR stock tracking",
    "worker tip QR codes",
    "affiliate referral program",
    "inventory dashboard",
    "warehouse scanner app",
    "South Africa barcode tracking",
  ],
  openGraph: {
    title: "King Sparkon Tracker | Scan Smarter. Track Faster.",
    description: "Barcode operations platform for inventory scanning, payments, tips, affiliates, reports, and audit-ready teams.",
    type: "website",
    siteName: "King Sparkon Tracker",
    images: [{ url: "/king-sparkon-logo.png", width: 512, height: 512, alt: "King Sparkon Tracker barcode logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "King Sparkon Tracker | Barcode Inventory Platform",
    description: "Scan, track, verify, promote, and report from one premium barcode operations dashboard.",
    images: ["/king-sparkon-logo.png"],
  },
  alternates: {
    canonical: "/",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "King Sparkon Tracker",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description: "Barcode and QR operations platform for inventory tracking, stock movement, worker tips, affiliate referrals, promotions, billing, reports, and audit trails.",
  offers: SOFTWARE_APPLICATION_OFFERS,
};

const previewTrustMetrics = [
  ["Preview products", "18.4K", "Demo value until backend metrics connect"],
  ["Preview scans", "426K", "Demo barcode and QR events"],
  ["Preview users", "1.2K", "Demo owner, worker, affiliate, admin mix"],
  ["Preview accuracy", "99.4%", "Demo audit-first stock visibility"],
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
  ["Commission visibility", `Display centralized commission rules: ${AFFILIATE_COMMISSION_SUMMARY}.`],
  ["Marketing assets", "Give partners campaign material, product explanations, and QR-ready promotion tools."],
  ["Growth channel", "Turn satisfied users, workers, and promoters into measurable acquisition partners."],
] as const;

export default function MarketingPage() {
  return (
    <main className="bg-[var(--paper)] text-[var(--ink)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <section className="relative overflow-hidden bg-[var(--ink)] pt-24 text-white">
        <div className="absolute left-1/2 top-[-18rem] h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-[var(--signal)]/10 blur-3xl" />
        <div className="absolute right-[-16rem] top-24 h-[34rem] w-[34rem] rounded-full bg-[var(--gold)]/10 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent opacity-70" />

        <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[rgba(7,17,31,0.82)] shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8" aria-label="Primary navigation">
            <Link href="/" className="flex items-center gap-3" aria-label="King Sparkon Tracker home">
              <Image src="/king-sparkon-logo.png" alt="King Sparkon Tracker barcode logo" width={46} height={46} className="rounded-[1.15rem] border border-white/15 bg-white/5 p-1" priority />
              <div>
                <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[var(--gold)]">Barcode operations</p>
                <p className="font-black uppercase tracking-[-0.02em]">King Sparkon Tracker</p>
              </div>
            </Link>

            <div className="hidden items-center gap-6 text-sm font-semibold text-white/64 lg:flex">
              <a href="#features" className="hover:text-white">Features</a>
              <a href="#affiliate" className="hover:text-white">Affiliate Program</a>
              <a href="#pricing" className="hover:text-white">Pricing</a>
              <a href="#contact" className="hover:text-white">Contact</a>
            </div>

            <div className="hidden items-center gap-3 md:flex">
              <Link href="/register-affiliate" className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--gold)]/50 px-4 text-sm font-bold text-[var(--gold)] hover:border-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--ink)]">
                Affiliate Program
              </Link>
              <Link href="/login" className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-4 text-sm font-bold text-white/80 hover:border-white/35 hover:text-white">
                Login terminal
              </Link>
              <Link href="/register" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-4 text-sm font-bold text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ember)]">
                Register business <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </nav>
        </header>

        <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-8 md:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:pb-24 lg:pt-16">
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-3 py-2 font-mono text-[0.68rem] font-bold uppercase tracking-[0.16em] text-white/70 shadow-[var(--shadow-soft)] backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[var(--confirm)]" /> Live scan verification
            </div>
            <h1 className="mt-6 max-w-5xl text-5xl font-black leading-[0.95] tracking-[-0.07em] md:text-7xl xl:text-8xl">
              Scan smarter. Track faster.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
              Premium barcode inventory software for businesses that need scanning, stock movement, worker tips, affiliate referrals, payments, promotions, and audit-ready reporting in one dashboard.
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
            {previewTrustMetrics.map(([label, value, detail]) => (
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

      <section id="features" className="scroll-mt-28 px-5 py-16 md:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--signal)]">02 / complete platform</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] md:text-6xl">Every major feature explained clearly.</h2>
            <p className="mt-4 text-sm leading-7 text-[var(--steel)] md:text-base">Inventory, scanning, payments, worker tips, promotions, affiliates, reports, and security are presented as one professional operations platform.</p>
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

      <section id="affiliate" className="scroll-mt-28 bg-[var(--ink)] px-5 py-16 text-white md:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">03 / affiliate program</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] md:text-6xl">Turn promoters into a measurable growth channel.</h2>
            <p className="mt-5 text-sm leading-7 text-white/65 md:text-base">Affiliates get referral links, QR previews, commission visibility, payout tracking, and marketing assets that help them introduce businesses to barcode tracking.</p>
            <Link href="/register-affiliate" className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--gold)] bg-[var(--gold)] px-6 font-bold text-[var(--ink)] shadow-[var(--shadow-soft)] hover:bg-white">
              Join Affiliate Program <ArrowRight className="h-4 w-4" />
            </Link>
            <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-[var(--shadow-depth)]">
              <div className="barcode-rule text-white" />
              <p className="mt-4 text-sm leading-7 text-white/60">Commission tiers from centralized policy: {AFFILIATE_COMMISSION_SUMMARY}.</p>
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

      <section id="pricing" className="scroll-mt-28 px-5 py-16 md:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--signal)]">04 / centralized pricing policy</p>
              <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] md:text-6xl">Clear plans from one frontend policy mirror.</h2>
              <p className="mt-4 text-sm leading-7 text-[var(--steel)] md:text-base">These plan cards now read from one shared config. Replace that config with the live billing API once `/api/billing/plans` is connected.</p>
            </div>
            <Link href="/register" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-6 font-bold text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ember)]">
              Start free trial <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {BUSINESS_PRICING_PLANS.map((plan) => (
              <article key={plan.name} className={`relative overflow-hidden rounded-[2rem] border p-6 shadow-[var(--shadow-soft)] ${plan.highlight ? "border-[var(--signal)] bg-[var(--ink)] text-white shadow-[var(--shadow-depth)]" : "border-[var(--line)] bg-[var(--surface-strong)] text-[var(--ink)]"}`}>
                {plan.highlight ? <div className="absolute right-5 top-5 rounded-full bg-[var(--gold)] px-3 py-1 text-xs font-black uppercase tracking-[0.08em] text-[var(--ink)]">Recommended</div> : null}
                <p className={`font-mono text-xs font-bold uppercase tracking-[0.16em] ${plan.highlight ? "text-[var(--gold)]" : "text-[var(--signal)]"}`}>{plan.caption}</p>
                <h3 className="mt-4 text-3xl font-black tracking-[-0.04em]">{plan.name}</h3>
                <div className="mt-4 flex items-end gap-2">
                  <p className="money text-4xl font-black">{plan.priceDisplay}</p>
                  {plan.billingSuffix ? <span className={plan.highlight ? "pb-1 text-sm font-semibold text-white/52" : "pb-1 text-sm font-semibold text-[var(--steel)]"}>/{plan.billingSuffix}</span> : null}
                </div>
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

      <section id="contact" className="mx-auto max-w-7xl scroll-mt-28 px-5 pb-16 md:px-8 lg:pb-24">
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
