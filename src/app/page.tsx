import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  CheckCircle2,
  CreditCard,
  QrCode,
  ScanLine,
  ShieldCheck,
  Ticket,
  UsersRound,
  WalletCards,
  Warehouse,
} from "lucide-react";
import { ScanLoop } from "@/components/hero/ScanLoop";
import { AFFILIATE_COMMISSION_SUMMARY, BUSINESS_PRICING_PLANS } from "@/lib/config/business-policy";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "King Sparkon Tracker | Barcode Inventory, Tickets, Tips & Payments",
  description:
    "Premium barcode, QR inventory, and event ticket management software for stock scanning, QR ticket verification, worker tips, affiliate programs, payments, reports, and audit-ready operations.",
  keywords: [
    "King Sparkon Tracker",
    "barcode inventory software",
    "QR stock tracking",
    "event ticket management",
    "QR ticket verification",
    "worker tip QR codes",
    "affiliate referral program",
    "South Africa barcode tracking",
  ],
  openGraph: {
    title: "King Sparkon Tracker | Scan Smarter. Verify Faster.",
    description: "Barcode operations and QR ticket verification platform for inventory, payments, tips, affiliates, reports, and event entry teams.",
    type: "website",
    siteName: "King Sparkon Tracker",
    images: [{ url: "/king-sparkon-logo.png", width: 512, height: 512, alt: "King Sparkon Tracker barcode logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "King Sparkon Tracker | Barcode & Ticket Platform",
    description: "Scan, track, verify, sell tickets, and report from one premium barcode operations dashboard.",
    images: ["/king-sparkon-logo.png"],
  },
  alternates: { canonical: "/" },
};

const metrics = [
  ["Preview products", "18.4K"],
  ["Preview scans", "426K"],
  ["Ticket checks", "92K"],
  ["Preview accuracy", "99.4%"],
] as const;

const heroBadges = ["Barcode scanning", "QR tickets", "Owner reports", "Worker tips", "Affiliate referrals"] as const;
const trustedTeams = ["Retail", "Warehouse", "Field Teams", "Small Business", "Events", "Logistics"] as const;

const workflows = [
  ["01", "Add", "Add products, workers, events, ticket classes, affiliate links, and business rules into one workspace."],
  ["02", "Generate", "Create barcode labels, ticket QR codes, worker tip QR cards, referral links, and payment URLs."],
  ["03", "Scan", "Scan at the counter, shelf, event gate, delivery point, or tip stand with manual fallback when needed."],
  ["04", "Report", "Give owners capacity, stock, scan activity, payment, class sales, payout, and audit history visibility."],
] as const;

const features = [
  { icon: ShieldCheck, title: "Barcode verification", copy: "Verify product ownership, item status, barcode availability, and branch context before stock moves.", tags: ["QR support", "Scan trail", "Worker flow"] },
  { icon: Ticket, title: "Event tickets", copy: "Create events, sell Regular, VIP, and VVIP tickets, track capacity, verify QR entry, and withdraw ticket revenue with a clear 5% platform service fee.", tags: ["Ticket QR", "5% withdrawals", "Gate scan"] },
  { icon: BarChart3, title: "Inventory dashboard", copy: "A clean owner command center for product counts, low-stock alerts, movement, and scan activity.", tags: ["Live stock", "Alerts", "Mobile cards"] },
  { icon: CreditCard, title: "Transactions", copy: "Track BUY and SELL movement with payment method, customer contact, payment URL, reference, and status.", tags: ["Payment links", "Cash records", "References"] },
  { icon: WalletCards, title: "Worker tips", copy: "Workers get QR cards and payment links while owners review gross amount, platform fee, net amount, and payout state before withdrawals.", tags: ["Tip QR", "Fee visibility", "Payouts"] },
  { icon: UsersRound, title: "Promotions", copy: "Run controlled campaigns with audience size, channel, schedule, quote visibility, and subscriber capture.", tags: ["Campaigns", "Subscribers", "Quotes"] },
] satisfies Array<{ icon: LucideIcon; title: string; copy: string; tags: string[] }>;

const ticketHighlights = [
  ["Buy tickets", "Users browse events, pick Regular/VIP/VVIP, checkout, and see issued QR tickets."],
  ["Verify entry", "Workers scan QR codes or type references and mark ACTIVE tickets as USED."],
  ["Manage capacity", "Owners see capacity, sold, available, revenue, and class-level sales."],
  ["Withdraw revenue", "Ticket owners request withdrawals with a transparent 5% service fee: gross amount, fee, and net payout are shown."],
] as const;

const feeHighlights = [
  ["Ticket withdrawals", "King Sparkon retains 5% when ticket owners withdraw event revenue. The owner dashboard shows gross, service fee, and net amount."],
  ["Worker tips", "Tips follow the same transparent payout structure: gross tips, platform fee, net amount, and payout state are visible before payout."],
] as const;

const affiliate = [
  ["Referral links", "Trackable links and QR previews for promoters."],
  ["Commission visibility", `Centralized commission rules: ${AFFILIATE_COMMISSION_SUMMARY}.`],
  ["Marketing assets", "Campaign material and QR-ready promotion tools."],
  ["Growth channel", "Turn happy users and promoters into measurable acquisition."],
] as const;

const dashboardStats = [
  ["0.8s", "avg scan capture"],
  ["99.9%", "tracking uptime placeholder"],
  ["24/7", "visibility"],
  ["Multi", "company ready"],
] as const;

const dashboardPreviewCards: Array<{ icon: LucideIcon; label: string; value: string }> = [
  { icon: Boxes, label: "Products", value: "18.4K" },
  { icon: Ticket, label: "Ticket checks", value: "92K" },
  { icon: WalletCards, label: "Tip reviews", value: "R8.2K" },
  { icon: Warehouse, label: "Branches", value: "12" },
];

function planQuery(name: string) {
  return name.toUpperCase().replace(/\s+/g, "_");
}

export default function MarketingPage() {
  return (
    <main className="bg-white text-[var(--ink)]">
      <section className="relative overflow-hidden bg-white pt-24 enterprise-grid">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-16rem] top-[-16rem] h-[42rem] w-[42rem] rounded-full bg-[var(--gold)]/18 blur-3xl" />
          <div className="absolute right-[-14rem] top-16 h-[34rem] w-[34rem] rounded-full bg-[var(--ember)]/12 blur-3xl" />
        </div>

        <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--line)] bg-white/88 shadow-[0_18px_60px_rgba(7,19,31,0.08)] backdrop-blur-xl">
          <div className="border-b border-[var(--line)] bg-[var(--ink)] px-5 py-2 text-center text-xs font-black text-white/78">
            <span className="text-[var(--gold)]">New:</span> real-time barcode tracking, QR tickets, worker tips, and owner dashboard clarity.
          </div>
          <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-8" aria-label="Primary navigation">
            <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="King Sparkon Tracker home">
              <Image src="/king-sparkon-logo.png" alt="King Sparkon Tracker barcode logo" width={46} height={46} className="rounded-[1.15rem] border border-[var(--line)] bg-white p-1 shadow-[var(--shadow-soft)]" priority />
              <div className="min-w-0">
                <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[var(--signal)]">Barcode operations</p>
                <p className="truncate font-black uppercase tracking-[-0.02em]">King Sparkon Tracker</p>
              </div>
            </Link>
            <div className="hidden items-center gap-6 text-sm font-semibold text-[var(--steel)] lg:flex">
              <a href="#features" className="hover:text-[var(--ink)]">Features</a>
              <a href="#tickets" className="hover:text-[var(--ink)]">Tickets</a>
              <a href="#fees" className="hover:text-[var(--ink)]">Fees</a>
              <a href="#pricing" className="hover:text-[var(--ink)]">Pricing</a>
              <a href="#contact" className="hover:text-[var(--ink)]">Contact</a>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/login" className="hidden min-h-11 items-center justify-center rounded-full border border-[var(--line)] px-4 text-sm font-bold text-[var(--steel)] hover:border-[var(--gold)] hover:text-[var(--ink)] sm:inline-flex">Login</Link>
              <Link href="/register?service=FULL_BUSINESS_SUITE" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-4 text-sm font-bold text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ink)]">Register <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </nav>
        </header>

        <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-12 md:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:pb-24 lg:pt-18">
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--line)] bg-white px-3 py-2 font-mono text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--steel)] shadow-[var(--shadow-soft)]"><span className="h-2 w-2 rounded-full bg-[var(--confirm)]" /> Live scan verification</div>
            <h1 className="mt-6 max-w-5xl text-5xl font-black leading-[0.95] tracking-[-0.07em] md:text-7xl xl:text-8xl">Barcode tracking built for fast-moving teams.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--steel)]">King Sparkon Tracker brings scanning, stock movement, QR event tickets, worker tips, affiliate referrals, payments, promotions, and audit-ready reporting into one enterprise-grade business workspace.</p>
            <div className="mt-6 flex flex-wrap gap-2">{heroBadges.map((badge) => <span key={badge} className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">{badge}</span>)}</div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/register?service=FULL_BUSINESS_SUITE" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-6 font-bold text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ink)]">Start Tracking <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/dashboard/worker/scan" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--line)] bg-white px-6 font-bold text-[var(--ink)] shadow-[var(--shadow-soft)] hover:border-[var(--gold)]">See scan demo</Link>
            </div>
          </div>
          <div className="grid gap-5">
            <ScanLoop />
            <div className="grid gap-3 rounded-[2rem] border border-[var(--line)] bg-white/82 p-4 shadow-[var(--shadow-ledger)] backdrop-blur sm:grid-cols-3">
              {["Inventory", "Tickets", "Tips"].map((item) => <div key={item} className="rounded-[1.35rem] border border-[var(--line)] bg-[var(--surface)] p-4"><p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.16em] text-[var(--signal)]">{item}</p><p className="mt-2 text-sm font-bold text-[var(--steel)]">Ready for dashboard visibility</p></div>)}
            </div>
          </div>
        </div>

        <div className="relative z-10 border-y border-[var(--line)] bg-white/78 backdrop-blur">
          <div className="mx-auto grid max-w-7xl gap-3 px-5 py-5 sm:grid-cols-2 md:px-8 xl:grid-cols-4">
            {metrics.map(([label, value]) => <div key={label} className="rounded-[1.4rem] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-soft)]"><p className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-[var(--muted)]">{label}</p><p className="money mt-2 text-3xl font-black text-[var(--ink)]">{value}</p><p className="mt-1 text-sm text-[var(--steel)]">Demo value until backend metrics connect</p></div>)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 md:px-8"><div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]"><p className="text-center font-mono text-xs font-black uppercase tracking-[0.18em] text-[var(--steel)]">Built for teams managing physical products</p><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">{trustedTeams.map((team) => <div key={team} className="rounded-[1.25rem] border border-[var(--line)] bg-white px-4 py-4 text-center text-sm font-black text-[var(--steel)] shadow-[var(--shadow-soft)]">{team}</div>)}</div></div></section>

      <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 lg:py-24"><div className="grid gap-8 rounded-[2.25rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-ledger)] md:p-8 lg:grid-cols-[0.82fr_1.18fr]"><div><p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--signal)]">01 / workflow</p><h2 className="mt-4 text-4xl font-black tracking-[-0.05em] md:text-5xl">A verification loop operators can trust.</h2><p className="mt-4 text-sm leading-7 text-[var(--steel)]">Add, generate, scan, verify, move stock, sell tickets, validate entry, and report without hidden status or weak dashboards.</p></div><div className="grid gap-3">{workflows.map(([step, title, copy]) => <div key={step} className="grid gap-4 rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)] sm:grid-cols-[86px_1fr]"><div className="grid h-16 w-16 place-items-center rounded-[1.25rem] bg-[var(--ink)] font-mono text-lg font-black text-[var(--gold)]">{step}</div><div><h3 className="text-xl font-black tracking-[-0.03em]">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--steel)]">{copy}</p></div></div>)}</div></div></section>

      <section id="features" className="scroll-mt-28 px-5 py-16 md:px-8 lg:py-24"><div className="mx-auto max-w-7xl"><div className="mx-auto max-w-3xl text-center"><p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--signal)]">02 / complete platform</p><h2 className="mt-4 text-4xl font-black tracking-[-0.05em] md:text-6xl">Every major feature explained clearly.</h2><p className="mt-4 text-sm leading-7 text-[var(--steel)] md:text-base">Inventory, scanning, tickets, payments, tips, promotions, affiliates, reports, and security in one professional platform.</p></div><div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{features.map(({ icon: Icon, title, copy, tags }) => <article key={title} className="rounded-[2rem] border border-[var(--line)] bg-white p-6 shadow-[var(--shadow-soft)] hover:-translate-y-1 hover:border-[var(--gold)]"><div className="grid h-14 w-14 place-items-center rounded-[1.25rem] bg-[var(--ink)] text-[var(--gold)]"><Icon className="h-6 w-6" /></div><h3 className="mt-6 text-2xl font-black tracking-[-0.04em]">{title}</h3><p className="mt-3 text-sm leading-7 text-[var(--steel)]">{copy}</p><div className="mt-5 flex flex-wrap gap-2">{tags.map((tag) => <span key={tag} className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs font-bold text-[var(--steel)]">{tag}</span>)}</div></article>)}</div></div></section>

      <section className="px-5 py-16 md:px-8 lg:py-24"><div className="mx-auto grid max-w-7xl gap-8 overflow-hidden rounded-[2.75rem] bg-[var(--ink)] p-6 text-white shadow-[var(--shadow-depth)] enterprise-grid lg:grid-cols-[0.9fr_1.1fr] lg:p-8"><div><p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">03 / command center</p><h2 className="mt-4 text-4xl font-black tracking-[-0.05em] md:text-6xl">Dashboard visuals with enterprise control.</h2><p className="mt-5 text-sm leading-7 text-white/68 md:text-base">Owners can see stock health, QR ticket movement, worker tip payout state, affiliate campaign visibility, and scan activity from one beautiful dashboard shell.</p><div className="mt-8 grid gap-3 sm:grid-cols-2">{dashboardStats.map(([value, label]) => <div key={label} className="rounded-[1.6rem] border border-white/10 bg-white/[0.06] p-4"><p className="money text-3xl font-black text-[var(--gold)]">{value}</p><p className="mt-2 text-sm font-bold text-white/62">{label}</p></div>)}</div></div><div className="rounded-[2.25rem] border border-white/10 bg-white/[0.06] p-4 backdrop-blur"><div className="rounded-[1.8rem] border border-white/10 bg-white p-4 text-[var(--ink)] shadow-[var(--shadow-ledger)]"><div className="flex items-center justify-between"><div><p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.16em] text-[var(--signal)]">Live preview</p><h3 className="mt-1 text-xl font-black">Operations dashboard</h3></div><ScanLine className="h-6 w-6 text-[var(--signal)]" /></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{dashboardPreviewCards.map(({ icon: Icon, label, value }) => <div key={label} className="rounded-[1.3rem] border border-[var(--line)] bg-[var(--surface)] p-4"><Icon className="h-5 w-5 text-[var(--signal)]" /><p className="money mt-3 text-2xl font-black">{value}</p><p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--steel)]">{label}</p></div>)}</div><div className="barcode-rule mt-5 text-[var(--ink)]" /></div></div></div></section>

      <section id="tickets" className="scroll-mt-28 px-5 py-16 md:px-8 lg:py-24"><div className="mx-auto grid max-w-7xl gap-8 overflow-hidden rounded-[2.5rem] border border-[var(--line)] bg-white p-6 shadow-[var(--shadow-ledger)] lg:grid-cols-[0.95fr_1.05fr] lg:p-8"><div><p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--signal)]">04 / ticket management</p><h2 className="mt-4 text-4xl font-black tracking-[-0.05em] md:text-6xl">Sell event tickets without losing the scanner identity.</h2><p className="mt-5 text-sm leading-7 text-[var(--steel)] md:text-base">The ticket portal is built around QR verification, worker gate scanning, owner capacity control, buyer dashboards, and transparent withdrawal fees.</p><div className="mt-7 flex flex-col gap-3 sm:flex-row"><Link href="/tickets" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-6 font-bold text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ink)]">View events <ArrowRight className="h-4 w-4" /></Link><Link href="/tickets/scan" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-6 font-bold text-[var(--ink)] shadow-[var(--shadow-soft)] hover:border-[var(--gold)]"><QrCode className="h-4 w-4" /> Scan ticket</Link></div><div className="mt-8 rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5"><div className="barcode-rule text-[var(--ink)]" /><p className="mt-4 text-sm leading-7 text-[var(--steel)]">Ticket QR payloads keep only ticketId, eventId, ticketReference, and userId. Ticket withdrawals retain a 5% service fee with gross, fee, and net payout shown clearly.</p></div></div><div className="grid gap-4 sm:grid-cols-2">{ticketHighlights.map(([title, copy]) => <article key={title} className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]"><Ticket className="h-5 w-5 text-[var(--signal)]" /><h3 className="mt-5 text-xl font-black tracking-[-0.03em]">{title}</h3><p className="mt-3 text-sm leading-6 text-[var(--steel)]">{copy}</p></article>)}</div></div></section>

      <section id="fees" className="scroll-mt-28 px-5 py-16 md:px-8 lg:py-24"><div className="mx-auto grid max-w-7xl gap-6 rounded-[2.5rem] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow-soft)] lg:grid-cols-[0.8fr_1.2fr]"><div><p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--signal)]">05 / fee visibility</p><h2 className="mt-4 text-4xl font-black tracking-[-0.05em] md:text-5xl">No hidden payout maths.</h2><p className="mt-4 text-sm leading-7 text-[var(--steel)]">The UI keeps platform retention, gross totals, net amount, and payout state visible for ticket owners and worker tips.</p></div><div className="grid gap-4 md:grid-cols-2">{feeHighlights.map(([title, copy]) => <article key={title} className="rounded-[1.75rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)]"><CreditCard className="h-5 w-5 text-[var(--signal)]" /><h3 className="mt-5 text-xl font-black tracking-[-0.03em]">{title}</h3><p className="mt-3 text-sm leading-6 text-[var(--steel)]">{copy}</p></article>)}</div></div></section>

      <section id="affiliate" className="scroll-mt-28 px-5 py-16 md:px-8 lg:py-24"><div className="mx-auto grid max-w-7xl gap-8 rounded-[2.5rem] border border-[var(--line)] bg-white p-6 shadow-[var(--shadow-ledger)] lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:p-8"><div><p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--signal)]">06 / affiliate program</p><h2 className="mt-4 text-4xl font-black tracking-[-0.05em] md:text-6xl">Turn promoters into measurable growth.</h2><p className="mt-5 text-sm leading-7 text-[var(--steel)] md:text-base">Referral links, QR previews, commission visibility, payout tracking, and marketing assets for promoters.</p><Link href="/register-affiliate" className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-6 font-bold text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ink)]">Join Affiliate Program <ArrowRight className="h-4 w-4" /></Link><div className="mt-8 rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5"><div className="barcode-rule text-[var(--ink)]" /><p className="mt-4 text-sm leading-7 text-[var(--steel)]">Commission tiers: {AFFILIATE_COMMISSION_SUMMARY}.</p></div></div><div className="grid gap-4 sm:grid-cols-2">{affiliate.map(([title, copy]) => <article key={title} className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]"><CheckCircle2 className="h-5 w-5 text-[var(--signal)]" /><h3 className="mt-5 text-xl font-black tracking-[-0.03em]">{title}</h3><p className="mt-3 text-sm leading-6 text-[var(--steel)]">{copy}</p></article>)}</div></div></section>

      <section id="pricing" className="scroll-mt-28 px-5 py-16 md:px-8 lg:py-24"><div className="mx-auto max-w-7xl"><div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div className="max-w-3xl"><p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--signal)]">07 / pricing</p><h2 className="mt-4 text-4xl font-black tracking-[-0.05em] md:text-6xl">Clear plans from one policy mirror.</h2><p className="mt-4 text-sm leading-7 text-[var(--steel)] md:text-base">Plan cards read from shared config and can later move to the billing API. Register keeps the selected service visible.</p></div><Link href="/register?service=FULL_BUSINESS_SUITE" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-6 font-bold text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ink)]">Start free trial <ArrowRight className="h-4 w-4" /></Link></div><div className="mt-10 grid gap-4 lg:grid-cols-3">{BUSINESS_PRICING_PLANS.map((plan) => <article key={plan.name} className={`relative overflow-hidden rounded-[2rem] border p-6 shadow-[var(--shadow-soft)] ${plan.highlight ? "border-[var(--gold)] bg-[var(--surface)]" : "border-[var(--line)] bg-white"}`}>{plan.highlight ? <span className="absolute right-5 top-5 rounded-full bg-[var(--ink)] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[var(--gold)]">Recommended</span> : null}<p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-[var(--signal)]">{plan.caption}</p><h3 className="mt-3 text-3xl font-black tracking-[-0.05em]">{plan.name}</h3><p className="money mt-4 text-4xl font-black">{plan.priceDisplay}<span className="text-sm font-bold text-[var(--steel)]">{plan.billingSuffix ? ` / ${plan.billingSuffix}` : ""}</span></p><p className="mt-4 text-sm leading-7 text-[var(--steel)]">{plan.description}</p><ul className="mt-5 grid gap-2">{plan.features.map((feature) => <li key={feature} className="flex gap-2 text-sm font-bold text-[var(--steel)]"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--signal)]" />{feature}</li>)}</ul><Link href={`/register?plan=${planQuery(plan.name)}&service=FULL_BUSINESS_SUITE`} className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[var(--signal)] bg-[var(--signal)] px-4 text-sm font-black text-white hover:bg-[var(--ink)]">Choose {plan.name}</Link></article>)}</div></div></section>

      <section id="contact" className="mx-auto max-w-7xl scroll-mt-28 px-5 py-16 md:px-8 lg:py-24"><div className="grid overflow-hidden rounded-[2.25rem] border border-[var(--line)] bg-white shadow-[var(--shadow-ledger)] lg:grid-cols-[0.82fr_1.18fr]"><div className="bg-[var(--ink)] p-6 text-white enterprise-grid md:p-8"><p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">08 / contact</p><h2 className="mt-4 max-w-xl break-words text-3xl font-black leading-[1.02] tracking-[-0.05em] sm:text-4xl lg:text-5xl">Send an implementation inquiry.</h2><p className="mt-4 max-w-xl text-sm leading-7 text-white/68">Tell us what you track, where workers scan, which events need QR entry, and which reports owners need first.</p><div className="barcode-rule mt-8 max-w-md text-white" /></div><div className="p-5 md:p-8"><ContactForm /></div></div></section>
    </main>
  );
}
