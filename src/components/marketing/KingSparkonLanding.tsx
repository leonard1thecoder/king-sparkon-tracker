import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  Crown,
  Flame,
  Megaphone,
  QrCode,
  ScanLine,
  ShieldCheck,
  ShoppingCart,
  Ticket,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { ScanLoop } from "@/components/hero/ScanLoop";
import { ContactForm } from "@/app/contact-form";
import { FounderVerificationCard } from "@/components/marketing/FounderVerificationCard";
import { BUSINESS_PRICING_PLANS } from "@/lib/config/business-policy";

const navLinks = [["Features", "#features"], ["Roles", "#roles"], ["Capacity", "#capacity"], ["Pricing", "#pricing"], ["Contact", "#contact"]] as const;

const features: Array<{ icon: LucideIcon; title: string; copy: string; tags: string[] }> = [
  { icon: ScanLine, title: "Barcode scanner core", copy: "Product scanning, manual fallback, barcode registration, stock movement, and clean scan history.", tags: ["Products", "Workers", "Audit"] },
  { icon: Ticket, title: "QR tickets", copy: "Sell event tickets, track capacity, verify QR entry, and keep buyer tickets visible.", tags: ["Events", "Gate scan", "Capacity"] },
  { icon: ShoppingCart, title: "Cart and checkout", copy: "User accounts are cart-ready for buyer flows, purchases, tickets, QR access, and transaction history.", tags: ["Cart", "Checkout", "Buyer"] },
  { icon: BriefcaseBusiness, title: "Job opportunities", copy: "Businesses publish roles, users apply, and admins or owners review application status.", tags: ["Jobs", "Applications", "Roles"] },
  { icon: WalletCards, title: "Worker tips", copy: "Workers get QR tip flows while owners review gross amount, service fee, net amount, and status.", tags: ["Tips", "QR", "Review"] },
  { icon: Megaphone, title: "Affiliate promotions", copy: "Free affiliates get referral links, QR promotion assets, campaign visibility, and commission clarity.", tags: ["R0", "Referral", "Campaigns"] },
  { icon: BarChart3, title: "Capacity views", copy: "Admin and owner dashboards expose capacity across tickets, workers, jobs, stock, tips, and reports.", tags: ["Admin", "Owner", "Reports"] },
  { icon: ShieldCheck, title: "Role-safe dashboards", copy: "User, Owner, Worker, Affiliate, and Admin each get the correct navigation.", tags: ["Roles", "Nav", "Security"] },
];

const roleCards = [
  { icon: UsersRound, title: "Free User", price: "R0", href: "/register?plan=FREE_USER&privilege=USER&service=FREE_USER_ACCESS", copy: "Tickets, cart checkout, job applications, profile, and purchase QR access." },
  { icon: QrCode, title: "Free Affiliate", price: "R0", href: "/register?plan=FREE_AFFILIATE&privilege=AFFILIATE&service=FREE_AFFILIATE_ACCESS", copy: "Referral links, QR promotion assets, campaign workspace, and commission visibility." },
  { icon: Crown, title: "Business Owner", price: "from R0 trial", href: "/register?plan=FREE_TRIAL_BUSINESS&privilege=BUSINESS_OWNER&service=FULL_BUSINESS_SUITE", copy: "Inventory, tickets, jobs, workers, tips, promotions, affiliates, reports, and capacity control." },
  { icon: ShieldCheck, title: "Admin", price: "locked", href: "/register-admin", copy: "Platform control for users, businesses, jobs, tickets, reports, audit logs, and settings." },
] as const;

const capacityRows = [
  ["Ticket capacity", "Events, classes, sold, available, checked-in, and withdrawal visibility."],
  ["Worker capacity", "Workers, scans, transactions, tips, shifts, and role activity."],
  ["Job capacity", "Open jobs, applications, review status, and business hiring activity."],
  ["Stock capacity", "Products, branches, barcode counts, low stock, and movement history."],
  ["Promotion capacity", "Campaign audience, channels, referral assets, and quote visibility."],
  ["Platform capacity", "Users, businesses, reports, audit logs, settings, and admin controls."],
] as const;

function planRegisterHref(plan: (typeof BUSINESS_PRICING_PLANS)[number]) {
  return `/register?plan=${plan.planCode}&privilege=${plan.registrationPrivilege}&service=${plan.registrationService}`;
}

export function KingSparkonLanding() {
  return (
    <main className="bg-white text-[var(--ink)]">
      <section className="relative overflow-hidden bg-white pt-24 enterprise-grid">
        <div className="pointer-events-none absolute inset-0"><div className="absolute left-[-18rem] top-[-18rem] h-[44rem] w-[44rem] rounded-full bg-[var(--gold)]/20 blur-3xl" /><div className="absolute right-[-12rem] top-8 h-[34rem] w-[34rem] rounded-full bg-[var(--ember)]/16 blur-3xl" /></div>
        <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--line)] bg-white/88 shadow-[0_18px_60px_rgba(7,19,31,0.08)] backdrop-blur-xl">
          <div className="border-b border-[var(--line)] bg-[var(--ink)] px-5 py-2 text-center text-xs font-black text-white/78"><span className="text-[var(--gold)]">Sparks evolved:</span> King Sparkon powers scanning, tickets, jobs, cart checkout, free affiliates, and role-safe dashboards.</div>
          <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-8" aria-label="Primary navigation">
            <Link href="/" className="flex min-w-0 items-center gap-3"><Image src="/king-sparkon-logo.png" alt="King Sparkon Tracker barcode logo" width={48} height={48} className="rounded-[1.15rem] border border-[var(--line)] bg-white p-1 shadow-[var(--shadow-soft)]" priority /><div><p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[var(--signal)]">Sparks to King Sparkon</p><p className="font-black uppercase tracking-[-0.02em]">King Sparkon Tracker</p></div></Link>
            <div className="hidden items-center gap-6 text-sm font-semibold text-[var(--steel)] lg:flex">{navLinks.map(([label, href]) => <a key={href} href={href} className="hover:text-[var(--ink)]">{label}</a>)}</div>
            <div className="flex items-center gap-2"><Link href="/login" className="hidden min-h-11 items-center justify-center rounded-full border border-[var(--line)] px-4 text-sm font-bold text-[var(--steel)] hover:border-[var(--gold)] sm:inline-flex">Login</Link><Link href="/register?plan=FREE_USER&privilege=USER&service=FREE_USER_ACCESS" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-4 text-sm font-bold text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ink)]">Start free <ArrowRight className="h-4 w-4" /></Link></div>
          </nav>
        </header>
        <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-12 md:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:pb-24 lg:pt-18">
          <div className="flex flex-col justify-center"><div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--line)] bg-white px-3 py-2 font-mono text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--steel)] shadow-[var(--shadow-soft)]"><Flame className="h-4 w-4 text-[var(--ember)]" /> Real product discipline. Crown-level energy.</div><h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.02] tracking-[-0.055em] md:text-6xl xl:text-7xl"><span className="mx-1 rounded-[0.16em] bg-[var(--gold)] px-[0.14em] text-[#000]">King Sparkon</span> tracker <span className="mx-1 rounded-[0.16em] bg-[var(--gold)] px-[0.14em] text-[#000]">is</span> not <span className="mx-1 rounded-[0.16em] bg-[var(--gold)] px-[0.14em] text-[#000]">just</span> a scanner. It is <span className="mx-1 rounded-[0.16em] bg-[var(--gold)] px-[0.14em] text-[#000]">the</span> <span className="mx-1 rounded-[0.16em] bg-[var(--gold)] px-[0.14em] text-[#000]">best</span> operating <span className="mx-1 rounded-[0.16em] bg-[var(--gold)] px-[0.14em] text-[#000]">king</span>.</h1><FounderVerificationCard /><p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--steel)]">Barcode inventory, QR tickets, cart checkout, job opportunities, worker tips, free affiliates, promotions, payments, capacity views, and role-safe dashboards.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/register?plan=FREE_USER&privilege=USER&service=FREE_USER_ACCESS" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-6 font-bold text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ink)]">Create free user <ArrowRight className="h-4 w-4" /></Link><Link href="/register?plan=FREE_AFFILIATE&privilege=AFFILIATE&service=FREE_AFFILIATE_ACCESS" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--line)] bg-white px-6 font-bold text-[var(--ink)] shadow-[var(--shadow-soft)] hover:border-[var(--gold)]">Join free affiliate</Link><Link href="/register?plan=FREE_TRIAL_BUSINESS&privilege=BUSINESS_OWNER&service=FULL_BUSINESS_SUITE" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--gold)] bg-[var(--gold)] px-6 font-bold text-[var(--ink)] shadow-[var(--shadow-soft)] hover:border-[var(--ink)]">Owner trial</Link></div></div>
          <div className="grid gap-5"><ScanLoop /><div className="grid gap-3 rounded-[2rem] border border-[var(--line)] bg-white/82 p-4 shadow-[var(--shadow-ledger)] backdrop-blur sm:grid-cols-2 xl:grid-cols-4">{[["Identity", "King Sparkon"], ["User plan", "R0"], ["Affiliate plan", "R0"], ["Owner suite", "Full stack"]].map(([label, value]) => <div key={label} className="rounded-[1.35rem] border border-[var(--line)] bg-[var(--surface)] p-4"><p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.16em] text-[var(--signal)]">{label}</p><p className="mt-2 text-lg font-black text-[var(--ink)]">{value}</p></div>)}</div></div>
        </div>
      </section>

      <section id="features" className="scroll-mt-28 px-5 py-16 md:px-8 lg:py-24"><div className="mx-auto max-w-7xl"><div className="mx-auto max-w-3xl text-center"><p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--signal)]">01 / no weak UI</p><h2 className="mt-4 text-4xl font-black tracking-[-0.055em] md:text-6xl">A full platform with every feature visible.</h2><p className="mt-4 text-sm leading-7 text-[var(--steel)] md:text-base">Scanning, tickets, cart, jobs, tips, affiliates, capacity, and role-safe dashboards.</p></div><div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{features.map(({ icon: Icon, title, copy, tags }) => <article key={title} className="rounded-[2rem] border border-[var(--line)] bg-white p-6 shadow-[var(--shadow-soft)] hover:-translate-y-1 hover:border-[var(--gold)]"><div className="grid h-14 w-14 place-items-center rounded-[1.25rem] bg-[var(--ink)] text-[var(--gold)]"><Icon className="h-6 w-6" /></div><h3 className="mt-6 text-2xl font-black tracking-[-0.04em]">{title}</h3><p className="mt-3 text-sm leading-7 text-[var(--steel)]">{copy}</p><div className="mt-5 flex flex-wrap gap-2">{tags.map((tag) => <span key={tag} className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs font-bold text-[var(--steel)]">{tag}</span>)}</div></article>)}</div></div></section>

      <section id="roles" className="scroll-mt-28 px-5 py-16 md:px-8 lg:py-24"><div className="mx-auto grid max-w-7xl gap-8 rounded-[2.75rem] bg-[var(--ink)] p-6 text-white shadow-[var(--shadow-depth)] enterprise-grid lg:p-8"><div className="max-w-4xl"><p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">02 / choose your form</p><h2 className="mt-4 text-4xl font-black tracking-[-0.055em] md:text-6xl">Every role gets the right door.</h2><p className="mt-5 text-sm leading-7 text-white/68 md:text-base">Registration now renders based on the selected role: User, Affiliate, Owner, or locked Admin.</p></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{roleCards.map(({ icon: Icon, title, price, href, copy }) => <Link key={title} href={href} className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 text-white backdrop-blur hover:-translate-y-1 hover:border-[var(--gold)]"><div className="flex items-start justify-between gap-4"><Icon className="h-7 w-7 text-[var(--gold)]" /><span className="rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-xs font-black uppercase tracking-[0.1em] text-white/72">{price}</span></div><h3 className="mt-6 text-2xl font-black tracking-[-0.04em]">{title}</h3><p className="mt-3 text-sm leading-6 text-white/64">{copy}</p></Link>)}</div></div></section>

      <section id="capacity" className="scroll-mt-28 px-5 py-16 md:px-8 lg:py-24"><div className="mx-auto grid max-w-7xl gap-8 rounded-[2.5rem] border border-[var(--line)] bg-white p-6 shadow-[var(--shadow-ledger)] lg:grid-cols-[0.85fr_1.15fr] lg:p-8"><div><p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--signal)]">03 / capacity views</p><h2 className="mt-4 text-4xl font-black tracking-[-0.055em] md:text-6xl">Dashboards show how much the system can hold.</h2><p className="mt-5 text-sm leading-7 text-[var(--steel)] md:text-base">Capacity is workers, stock, jobs, tickets, campaigns, reports, and platform control.</p><div className="mt-7 flex flex-col gap-3 sm:flex-row"><Link href="/dashboard/admin/capacity" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-6 font-bold text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ink)]">View admin capacity <ArrowRight className="h-4 w-4" /></Link><Link href="/dashboard/owner/capacity" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--line)] bg-white px-6 font-bold text-[var(--ink)] shadow-[var(--shadow-soft)] hover:border-[var(--gold)]">Owner capacity</Link></div></div><div className="grid gap-3 sm:grid-cols-2">{capacityRows.map(([title, copy]) => <article key={title} className="rounded-[1.65rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]"><BadgeCheck className="h-5 w-5 text-[var(--signal)]" /><h3 className="mt-4 text-xl font-black tracking-[-0.03em]">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--steel)]">{copy}</p></article>)}</div></div></section>

      <section id="pricing" className="scroll-mt-28 px-5 py-16 md:px-8 lg:py-24"><div className="mx-auto max-w-7xl"><div className="max-w-3xl"><p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--signal)]">04 / pricing</p><h2 className="mt-4 text-4xl font-black tracking-[-0.055em] md:text-6xl">Free where it must be free. Paid where business gets power.</h2><p className="mt-4 text-sm leading-7 text-[var(--steel)] md:text-base">Prices come from the shared business policy. User and Affiliate start at R0.</p></div><div className="mt-10 grid gap-4 lg:grid-cols-5">{BUSINESS_PRICING_PLANS.map((plan) => <article key={plan.planCode} className={`relative overflow-hidden rounded-[2rem] border p-5 shadow-[var(--shadow-soft)] ${plan.highlight ? "border-[var(--gold)] bg-[var(--surface)]" : "border-[var(--line)] bg-white"}`}>{plan.highlight ? <span className="absolute right-4 top-4 rounded-full bg-[var(--ink)] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[var(--gold)]">Best grow</span> : null}<p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-[var(--signal)]">{plan.caption}</p><h3 className="mt-3 text-2xl font-black tracking-[-0.05em]">{plan.name}</h3><p className="money mt-4 text-4xl font-black">{plan.priceDisplay}</p><p className="mt-4 text-sm leading-7 text-[var(--steel)]">{plan.description}</p><ul className="mt-5 grid gap-2">{plan.features.map((feature) => <li key={feature} className="flex gap-2 text-sm font-bold text-[var(--steel)]"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--signal)]" />{feature}</li>)}</ul><Link href={planRegisterHref(plan)} className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[var(--signal)] bg-[var(--signal)] px-4 text-sm font-black text-white hover:bg-[var(--ink)]">Choose {plan.name}</Link></article>)}</div></div></section>

      <section id="contact" className="mx-auto max-w-7xl scroll-mt-28 px-5 py-16 md:px-8 lg:py-24"><div className="grid overflow-hidden rounded-[2.25rem] border border-[var(--line)] bg-white shadow-[var(--shadow-ledger)] lg:grid-cols-[0.82fr_1.18fr]"><div className="bg-[var(--ink)] p-6 text-white enterprise-grid md:p-8"><p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">05 / contact</p><h2 className="mt-4 max-w-xl break-words text-3xl font-black leading-[1.02] tracking-[-0.05em] sm:text-4xl lg:text-5xl">Build the King Sparkon operation properly.</h2><p className="mt-4 max-w-xl text-sm leading-7 text-white/68">Tell us what you track, which roles use the system, and what the first dashboard must prove.</p><div className="barcode-rule mt-8 max-w-md text-white" /></div><div className="p-5 md:p-8"><ContactForm /></div></div></section>
    </main>
  );
}
