"use client";

import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CheckCircle2,
  Crown,
  Megaphone,
  QrCode,
  ScanLine,
  ShieldCheck,
  ShoppingCart,
  Ticket,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ContactForm } from "@/app/contact-form";
import { ScanLoop } from "@/components/hero/ScanLoop";
import { AffiliateProgramSection } from "@/components/marketing/AffiliateProgramSection";
import { DevHubSection } from "@/components/marketing/DevHubSection";
import { FounderVerificationCard } from "@/components/marketing/FounderVerificationCard";
import { JobOpportunitiesSection } from "@/components/marketing/JobOpportunitiesSection";
import { Capacity3DVisual, Contact3DVisual, Engineering3DVisual, Role3DVisual, Sponsor3DVisual } from "@/components/marketing/Landing3DVisuals";
import { SubscriptionSection } from "@/components/marketing/SubscriptionSection";
import { VisionBubbleField } from "@/components/marketing/VisionBubbleField";
import { BUSINESS_PRICING_PLANS } from "@/lib/config/business-policy";

const navLinks = [
  ["Vision", "#vision"],
  ["Features", "#features"],
  ["Jobs", "#jobs"],
  ["Affiliate", "#affiliate"],
  ["Dev Hub", "#dev-hub"],
  ["Roles", "#roles"],
  ["Capacity", "#capacity"],
  ["Engineering", "#complaints"],
  ["Pricing", "#pricing"],
  ["Contact", "#contact"],
  ["Subscribe", "#subscribe"],
] as const;

const features: Array<{ icon: LucideIcon; title: string; copy: string; tags: string[] }> = [
  { icon: ScanLine, title: "Barcode inventory", copy: "Register products, scan units, track stock movement and preserve a clean history.", tags: ["Products", "Workers", "Audit"] },
  { icon: Ticket, title: "QR tickets", copy: "Sell event tickets, control capacity, verify entry and keep buyer tickets visible.", tags: ["Events", "Gate scan", "Capacity"] },
  { icon: ShoppingCart, title: "Cart and checkout", copy: "Support product browsing, carts, purchases, collections and transaction history.", tags: ["Cart", "Checkout", "Buyer"] },
  { icon: BriefcaseBusiness, title: "Job opportunities", copy: "Businesses publish roles, users apply and owners review every application.", tags: ["Jobs", "Applications", "Roles"] },
  { icon: WalletCards, title: "Worker tips", copy: "Workers receive QR tip flows while owners review gross, fees, net amount and payout status.", tags: ["Tips", "QR", "Payouts"] },
  { icon: Megaphone, title: "Affiliate growth", copy: "Affiliates receive referral links, campaign assets and clear commission visibility.", tags: ["Referral", "Campaigns", "Commission"] },
];

const visionPillars: Array<{ icon: LucideIcon; title: string; copy: string }> = [
  { icon: ScanLine, title: "Trace every action", copy: "Products, tickets, tips, promotions and purchases should always have a clear record." },
  { icon: Crown, title: "One owner workspace", copy: "Owners run stock, events, jobs, workers, affiliates, tips and reports from one place." },
  { icon: WalletCards, title: "Transparent money", copy: "Payments, tips, withdrawals and platform fees remain visible and reviewable." },
];

const roleCards = [
  { icon: UsersRound, title: "User", price: "Free", href: "/register?plan=FREE_USER&privilege=USER&service=FREE_USER_ACCESS", copy: "Buy products and tickets, apply for jobs and keep purchase records." },
  { icon: QrCode, title: "Affiliate", price: "Free", href: "/register?plan=FREE_AFFILIATE&privilege=AFFILIATE&service=FREE_AFFILIATE_ACCESS", copy: "Share referral links, use campaign assets and track commissions." },
  { icon: Crown, title: "Business Owner", price: "14-day trial", href: "/register?plan=FREE_TRIAL_BUSINESS&privilege=BUSINESS_OWNER&service=FULL_BUSINESS_SUITE", copy: "Control inventory, workers, tickets, jobs, payments and reports." },
  { icon: ShieldCheck, title: "Worker", price: "Business access", href: "/login", copy: "Scan products and tickets, process sales and review tip activity." },
] as const;

const capacityRows = [
  ["Tickets", "Events, ticket classes, sold quantity, availability and checked-in totals."],
  ["Workers", "Worker accounts, scans, transactions, tips and role activity."],
  ["Jobs", "Open opportunities, applications and review status."],
  ["Stock", "Products, barcode units, low stock and movement history."],
  ["Promotions", "Audience, channel, referral assets and campaign results."],
  ["Platform", "Users, businesses, reports, audit logs and configuration."],
] as const;

const sponsorMaintains = [
  "Cloud hosting, storage, backups and uptime.",
  "QR and barcode scanning reliability.",
  "Security, QA, audits and payment safety.",
  "New features for every platform role.",
] as const;

const engineeringPrinciples = [
  ["Public interest", "Protect users, businesses and payment integrity before shortcuts."],
  ["Professional standards", "Build changes that are testable, reviewable and production-safe."],
  ["Evidence over decoration", "Use clear states, real data and audit trails instead of visual noise."],
] as const;

function planRegisterHref(plan: (typeof BUSINESS_PRICING_PLANS)[number]) {
  return `/register?plan=${plan.planCode}&privilege=${plan.registrationPrivilege}&service=${plan.registrationService}`;
}

export function KingSparkonLanding() {
  const [activeSection, setActiveSection] = useState("#vision");
  const [pricingAudience, setPricingAudience] = useState<"USER" | "AFFILIATE" | "BUSINESS">("BUSINESS");

  useEffect(() => {
    const sections = navLinks.map(([, href]) => document.querySelector(href)).filter((section): section is Element => Boolean(section));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveSection(`#${visible.target.id}`);
      },
      { rootMargin: "-20% 0px -62% 0px", threshold: [0.1, 0.35, 0.7] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="bg-white text-[var(--ink)]">
      <section className="relative bg-white pt-32">
        <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--line)] bg-white shadow-[var(--shadow-soft)]">
          <div className="border-b border-[var(--line)] bg-[var(--signal-soft)] px-5 py-2 text-center text-xs font-bold text-[var(--signal-strong)]">
            Barcode operations, QR tickets, jobs, payments and role-safe dashboards in one platform.
          </div>
          <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 md:px-8" aria-label="Primary navigation">
            <Link href="/" className="flex min-w-0 items-center gap-3">
              <Image src="/king-sparkon-logo.png" alt="King Sparkon Tracker barcode logo" width={46} height={46} className="rounded-lg border border-[var(--line)] bg-white p-1" priority />
              <div><p className="text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]">King Sparkon</p><p className="font-black tracking-[-0.02em]">Tracker</p></div>
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/login" className="hidden min-h-11 items-center justify-center rounded-lg border border-[var(--line)] bg-white px-4 text-sm font-extrabold text-[var(--steel)] hover:border-[var(--accent-hover)] hover:text-[var(--accent-hover)] sm:inline-flex">Login</Link>
              <Link data-orange-hover="true" href="/register?plan=FREE_USER&privilege=USER&service=FREE_USER_ACCESS" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--signal)] bg-[var(--signal)] px-4 text-sm font-extrabold text-white hover:border-[var(--accent-hover)] hover:bg-[var(--accent-hover)]">Start free <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </nav>
          <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto border-t border-[var(--line)] px-5 py-2 text-[0.68rem] font-extrabold text-[var(--steel)] md:px-8" aria-label="Section navigation">
            {navLinks.map(([label, href]) => <a key={href} href={href} aria-current={activeSection === href ? "location" : undefined} className={`shrink-0 rounded-md border px-3 py-1.5 ${activeSection === href ? "border-[var(--signal)] bg-[var(--signal-soft)] text-[var(--signal-strong)]" : "border-transparent bg-white hover:border-[var(--line)] hover:text-[var(--ink)]"}`}>{label}</a>)}
          </div>
        </header>

        <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-14 md:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:pb-28 lg:pt-20">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]">Operations without the spreadsheet chaos</p>
            <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.98] tracking-[-0.06em] md:text-7xl">Scan it. Sell it. Track it. Prove it.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--steel)]">King Sparkon Tracker connects inventory, tickets, carts, jobs, worker tips, affiliates and payments through focused dashboards for each role.</p>
            <FounderVerificationCard />
            <div className="mt-8 flex flex-wrap gap-3">
              <Link data-orange-hover="true" href="/register?plan=FREE_TRIAL_BUSINESS&privilege=BUSINESS_OWNER&service=FULL_BUSINESS_SUITE" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-[var(--signal)] bg-[var(--signal)] px-6 text-sm font-extrabold text-white hover:border-[var(--accent-hover)] hover:bg-[var(--accent-hover)]">Start business trial <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/#features" className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[var(--line-strong)] bg-white px-6 text-sm font-extrabold text-[var(--ink)] hover:border-[var(--accent-hover)] hover:text-[var(--accent-hover)]">See platform features</Link>
            </div>
          </div>

          <div className="min-w-0 lg:-mr-6">
            <ScanLoop />
          </div>
        </div>
      </section>

      <section id="vision" className="scroll-mt-28 border-t border-[var(--line)] bg-white px-5 py-16 md:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end"><div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]">Vision</p><h2 className="mt-4 text-4xl font-black tracking-[-0.05em] md:text-6xl">Control real-world operations from one trusted record.</h2></div><p className="text-base leading-8 text-[var(--steel)] lg:text-lg">Every scan, sale, ticket, payment and role action should be understandable without searching through disconnected systems.</p></div>
          <VisionBubbleField items={visionPillars} />
        </div>
      </section>

      <section id="sponsor" className="scroll-mt-28 border-y border-[var(--line)] bg-white px-5 py-16 md:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]">Support King Sparkon</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] md:text-5xl">Help maintain a reliable platform.</h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--steel)]">Sponsorship helps cover the production work that users rarely see but always depend on.</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">{sponsorMaintains.map((item) => <div key={item} className="flex items-start gap-3 border-l-2 border-[var(--line-strong)] py-2 pl-4 text-sm font-semibold leading-6 text-[var(--steel)]"><BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--signal)]" />{item}</div>)}</div>
            <Link data-orange-hover="true" href="/#contact" className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-extrabold text-white hover:border-[var(--accent-hover)] hover:bg-[var(--accent-hover)]">Discuss sponsorship <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <Sponsor3DVisual />
        </div>
      </section>

      <section id="features" className="scroll-mt-28 bg-white px-5 py-16 md:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl"><div className="max-w-3xl"><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]">Features</p><h2 className="mt-4 text-4xl font-black tracking-[-0.05em] md:text-6xl">Built around the work, not the dashboard decoration.</h2><p className="mt-5 text-base leading-8 text-[var(--steel)]">Each feature supports a real operational task and a clearly defined role.</p></div><div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{features.map(({ icon: Icon, title, copy, tags }) => <article key={title} className="rounded-xl border border-[var(--line)] bg-white p-6 transition hover:border-[var(--line-strong)]"><div className="grid h-11 w-11 place-items-center rounded-lg border border-[var(--line)] text-[var(--signal)]"><Icon className="h-5 w-5" /></div><h3 className="mt-5 text-xl font-black tracking-[-0.03em]">{title}</h3><p className="mt-3 text-sm leading-7 text-[var(--steel)]">{copy}</p><div className="mt-5 flex flex-wrap gap-2">{tags.map((tag) => <span key={tag} className="rounded-md border border-[var(--line)] bg-[var(--signal-soft)] px-2.5 py-1 text-xs font-bold text-[var(--signal-strong)]">{tag}</span>)}</div></article>)}</div></div>
      </section>

      <JobOpportunitiesSection />
      <AffiliateProgramSection />
      <DevHubSection />

      <section id="roles" className="scroll-mt-28 border-y border-[var(--line)] bg-white px-5 py-16 md:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
            <div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]">Choose your role</p><h2 className="mt-4 text-4xl font-black tracking-[-0.05em] md:text-6xl">See only the tools you need.</h2><p className="mt-5 text-base leading-8 text-[var(--steel)]">Registration and navigation change according to the selected responsibility.</p></div>
            <Role3DVisual />
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">{roleCards.map(({ icon: Icon, title, price, href, copy }) => <Link key={title} href={href} className="group rounded-xl border border-[var(--line)] bg-white p-5 transition hover:border-[var(--accent-hover)]"><div className="flex items-center justify-between gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg border border-[var(--line)] text-[var(--signal)]"><Icon className="h-5 w-5" /></div><span className="rounded-md border border-[var(--line)] bg-[var(--signal-soft)] px-2.5 py-1 text-xs font-extrabold text-[var(--signal-strong)]">{price}</span></div><h3 className="mt-5 text-xl font-black">{title}</h3><p className="mt-3 text-sm leading-6 text-[var(--steel)]">{copy}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-[var(--signal-strong)] group-hover:text-[var(--accent-hover)]">Open access path <ArrowRight className="h-4 w-4" /></span></Link>)}</div>
        </div>
      </section>

      <section id="capacity" className="scroll-mt-28 bg-white px-5 py-16 md:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
            <div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]">Capacity</p><h2 className="mt-4 text-4xl font-black tracking-[-0.05em] md:text-5xl">Know what is available before operations become a problem.</h2><p className="mt-5 text-base leading-8 text-[var(--steel)]">Capacity views turn activity into clear, actionable totals.</p><Link href="/dashboard/owner/capacity" className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--line-strong)] bg-white px-5 text-sm font-extrabold text-[var(--ink)] hover:border-[var(--accent-hover)] hover:text-[var(--accent-hover)]">View owner capacity <ArrowRight className="h-4 w-4" /></Link></div>
            <Capacity3DVisual />
          </div>
          <div className="mt-10 divide-y divide-[var(--line)] border-y border-[var(--line)]">{capacityRows.map(([title, copy], index) => <div key={title} className="grid gap-3 py-5 sm:grid-cols-[3rem_0.35fr_1fr] sm:items-start"><span className="text-sm font-black text-[var(--signal-strong)]">0{index + 1}</span><h3 className="font-black">{title}</h3><p className="text-sm leading-6 text-[var(--steel)]">{copy}</p></div>)}</div>
        </div>
      </section>

      <section id="complaints" className="scroll-mt-28 border-y border-[var(--line)] bg-white px-5 py-16 md:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]">Engineering principles</p>
              <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] md:text-5xl">Build trust through evidence.</h2>
              <p className="mt-5 text-base leading-8 text-[var(--steel)]">Motion explains how feedback becomes a tested product response. It supports the story instead of decorating every surface.</p>
              <div className="mt-8 grid gap-4">{engineeringPrinciples.map(([title, copy], index) => <article key={title} className="grid gap-3 rounded-xl border border-[var(--line)] bg-white p-5 sm:grid-cols-[3rem_1fr]"><span className="text-sm font-black text-[var(--signal-strong)]">0{index + 1}</span><div><h3 className="font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--steel)]">{copy}</p></div></article>)}</div>
            </div>
            <Engineering3DVisual />
          </div>
        </div>
      </section>

      <section id="pricing" className="scroll-mt-28 bg-white px-5 py-16 md:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl"><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]">Pricing</p><h2 className="mt-4 text-4xl font-black tracking-[-0.05em] md:text-6xl">Simple plans. Serious business control.</h2><p className="mt-4 text-base leading-7 text-[var(--steel)] md:text-lg">Choose the experience that matches what you are here to do. Free accounts stay free. Business plans start with a 14-day trial.</p></div>

          <div className="mt-8 inline-grid w-full gap-2 rounded-xl border border-[var(--line)] bg-white p-2 sm:w-auto sm:grid-cols-3" aria-label="Pricing audience">
            {([["USER", "Use King Sparkon"], ["AFFILIATE", "Earn as an affiliate"], ["BUSINESS", "Run a business"]] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setPricingAudience(value)} aria-pressed={pricingAudience === value} className={`min-h-11 rounded-lg border px-4 text-sm font-extrabold transition ${pricingAudience === value ? "border-[var(--signal)] bg-[var(--signal-soft)] text-[var(--signal-strong)]" : "border-transparent bg-white text-[var(--steel)] hover:border-[var(--accent-hover)] hover:text-[var(--accent-hover)]"}`}>{label}</button>)}
          </div>

          {pricingAudience !== "BUSINESS" ? (() => {
            const plan = BUSINESS_PRICING_PLANS.find((item) => item.registrationPrivilege === pricingAudience);
            if (!plan) return null;
            return <div className="mt-10 grid gap-8 rounded-xl border border-[var(--line-strong)] bg-white p-6 shadow-[var(--shadow-soft)] md:grid-cols-[1fr_0.9fr] md:items-center md:p-8"><div><span className="inline-flex rounded-md border border-[var(--line)] bg-[var(--signal-soft)] px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--signal-strong)]">Free forever</span><h3 className="mt-5 text-3xl font-black tracking-[-0.04em] md:text-4xl">{plan.name}</h3><p className="money mt-3 text-5xl font-black">R0</p><p className="mt-5 max-w-2xl text-base leading-7 text-[var(--steel)]">{plan.description}</p><Link data-orange-hover="true" href={planRegisterHref(plan)} className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-[var(--signal)] bg-[var(--signal)] px-6 text-sm font-extrabold text-white hover:border-[var(--accent-hover)] hover:bg-[var(--accent-hover)]">{pricingAudience === "USER" ? "Create free account" : "Start earning"} <ArrowRight className="h-4 w-4" /></Link></div><ul className="grid gap-3 border-[var(--line)] md:border-l md:pl-8">{plan.features.map((feature) => <li key={feature} className="flex items-start gap-3 text-sm font-semibold text-[var(--steel)]"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--signal)]" />{feature}</li>)}</ul></div>;
          })() : <><div className="mt-10 grid gap-5 lg:grid-cols-3 lg:items-stretch">{BUSINESS_PRICING_PLANS.filter((plan) => plan.registrationPrivilege === "BUSINESS_OWNER").map((plan) => { const isRecommended = plan.planCode === "PLUS"; return <article key={plan.planCode} className={`relative flex h-full flex-col rounded-xl border bg-white p-6 transition ${isRecommended ? "border-[var(--signal)] shadow-[0_18px_45px_rgba(14,165,233,0.14)] lg:-translate-y-2" : "border-[var(--line)] shadow-[var(--shadow-soft)]"}`}>{isRecommended ? <span className="mb-5 inline-flex w-fit rounded-md border border-[var(--line-strong)] bg-[var(--signal-soft)] px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--signal-strong)]">Most popular</span> : null}<p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--steel)]">{plan.planCode === "FREE_TRIAL_BUSINESS" ? "Explore the platform" : plan.planCode === "PLUS" ? "Growing businesses" : "Full operations"}</p><h3 className="mt-3 text-3xl font-black tracking-[-0.04em]">{plan.name === "Free Trial Business" ? "Starter Trial" : plan.name}</h3><div className="mt-5 flex items-end gap-2"><p className="money text-4xl font-black">{plan.planCode === "FREE_TRIAL_BUSINESS" ? "R0" : `R${Number(plan.price).toLocaleString("en-ZA")}`}</p><span className="pb-1 text-sm font-semibold text-[var(--muted)]">{plan.planCode === "FREE_TRIAL_BUSINESS" ? "for 14 days" : "/ month"}</span></div><p className="mt-5 text-sm leading-7 text-[var(--steel)]">{plan.description}</p><ul className="mt-6 grid flex-1 gap-3">{plan.features.slice(0, 6).map((feature) => <li key={feature} className="flex items-start gap-3 text-sm font-semibold text-[var(--steel)]"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--signal)]" />{feature}</li>)}</ul><Link data-orange-hover="true" href={planRegisterHref(plan)} className={`mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border px-5 text-sm font-extrabold transition ${isRecommended ? "border-[var(--signal)] bg-[var(--signal)] text-white" : "border-[var(--line-strong)] bg-white text-[var(--ink)]"} hover:border-[var(--accent-hover)] hover:bg-[var(--accent-hover)] hover:text-white`}>{plan.planCode === "FREE_TRIAL_BUSINESS" ? "Start free trial" : `Choose ${plan.name}`} <ArrowRight className="h-4 w-4" /></Link></article>; })}</div><div className="mt-8 grid gap-3 border-t border-[var(--line)] pt-6 text-sm font-semibold text-[var(--steel)] sm:grid-cols-3"><p className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-[var(--signal)]" /> Role-safe access</p><p className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-[var(--signal)]" /> No setup fee</p><p className="flex items-center gap-2"><BadgeCheck className="h-5 w-5 text-[var(--signal)]" /> Upgrade as operations grow</p></div></>}
        </div>
      </section>

      <section id="contact" className="scroll-mt-28 border-t border-[var(--line)] bg-white px-5 py-16 md:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
            <div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]">Contact</p><h2 className="mt-4 text-4xl font-black tracking-[-0.05em] md:text-5xl">Tell us what your operation needs to prove.</h2><p className="mt-5 text-base leading-8 text-[var(--steel)]">Share the roles, products, ticket flow or payment problem you need the platform to manage.</p><div className="mt-8 grid gap-4">{[["01", "Describe the operation"], ["02", "Identify the users and roles"], ["03", "Define the first successful outcome"]].map(([number, label]) => <div key={number} className="flex items-center gap-4 border-b border-[var(--line)] pb-4"><span className="font-black text-[var(--signal-strong)]">{number}</span><span className="font-semibold text-[var(--steel)]">{label}</span></div>)}</div></div>
            <Contact3DVisual />
          </div>
          <div className="mt-10 rounded-xl border border-[var(--line-strong)] bg-white p-5 shadow-[var(--shadow-soft)] md:p-8"><ContactForm /></div>
        </div>
      </section>

      <SubscriptionSection />
    </main>
  );
}
