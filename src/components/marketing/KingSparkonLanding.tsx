"use client";

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
import { JobOpportunitiesSection } from "@/components/marketing/JobOpportunitiesSection";
import { AffiliateProgramSection } from "@/components/marketing/AffiliateProgramSection";
import { DevHubSection } from "@/components/marketing/DevHubSection";
import { SubscriptionSection } from "@/components/marketing/SubscriptionSection";
import { BUSINESS_PRICING_PLANS } from "@/lib/config/business-policy";
import { useEffect, useState } from "react";

const navLinks = [
  ["Vision", "#vision"],
  ["Features", "#features"],
  ["Jobs", "#jobs"],
  ["Affiliate", "#affiliate"],
  ["Dev Hub", "#dev-hub"],
  ["Roles", "#roles"],
  ["Capacity", "#capacity"],
  ["Complaints", "#complaints"],
  ["Pricing", "#pricing"],
  ["Contact", "#contact"],
  ["Subscribe", "#subscribe"],
] as const;

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

const visionPillars: Array<{ icon: LucideIcon; title: string; copy: string }> = [
  { icon: ScanLine, title: "One scan identity", copy: "Every product, ticket, worker tip, promotion, and purchase should have a clean QR or barcode trail." },
  { icon: Crown, title: "Small business command center", copy: "Owners should run stock, events, jobs, workers, affiliates, tips, and reports from one trusted dashboard." },
  { icon: WalletCards, title: "Transparent money movement", copy: "Tips, sponsorships, payments, withdrawals, and platform fees should be visible, reviewable, and fair." },
  { icon: ShieldCheck, title: "Role-safe access", copy: "Users, owners, workers, affiliates, and admins should only see the tools that match their responsibility." },
  { icon: BarChart3, title: "Capacity before chaos", copy: "The system should show what is sold, available, scanned, paid, pending, and growing before problems happen." },
  { icon: Megaphone, title: "Free growth channels", copy: "Free users and free affiliates should help businesses grow without losing the professional platform discipline." },
];

const roleCards = [
  { icon: UsersRound, title: "Free User", price: "R0", href: "/register?plan=FREE_USER&privilege=USER&service=FREE_USER_ACCESS", copy: "Tickets, cart checkout, job applications, profile, and purchase QR access." },
  { icon: QrCode, title: "Free Affiliate", price: "R0", href: "/register?plan=FREE_AFFILIATE&privilege=AFFILIATE&service=FREE_AFFILIATE_ACCESS", copy: "Referral links, QR promotion assets, campaign workspace, and commission visibility." },
  { icon: Crown, title: "Business Owner", price: "from R0 trial", href: "/register?plan=FREE_TRIAL_BUSINESS&privilege=BUSINESS_OWNER&service=FULL_BUSINESS_SUITE", copy: "Inventory, tickets, Dev Hub quote, King-Sparkon-Strengths, and capacity control." },
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

const complaintSignals = [
  ["Public interest", "Software should protect health, safety, welfare, and the public interest before shortcuts or hidden risk."],
  ["Professional standards", "Every product and modification should meet high standards, legal expectations, and ethical engineering practice."],
  ["Integrity and learning", "Good engineering keeps judgement independent, supports colleagues, and improves through lifelong learning."],
] as const;

const sponsorMaintains = [
  "Cloud hosting, storage, database backups, and uptime discipline.",
  "QR scanning reliability, ticket verification, and barcode improvements.",
  "Security, QA testing, audits, bug fixes, and safer payment flows.",
  "New features for workers, affiliates, businesses, and free users.",
] as const;

const qrCells = new Set([
  0, 1, 2, 3, 4, 6, 7, 8,
  9, 13, 15, 17,
  18, 20, 21, 22, 24, 26,
  27, 31, 33, 35,
  36, 37, 38, 39, 40, 42, 44,
  46, 47, 50, 52, 53,
  54, 56, 58, 59, 60, 62,
  63, 67, 69, 71,
  72, 73, 74, 75, 76, 78, 79, 80,
]);

const TIP_KING_SPARKON_IMAGE = "https://veizbtzugssszhxabzrv.supabase.co/storage/v1/object/public/king-sparkon-logo/AAA.png";
const CHOOSE_FORM_IMAGE = "https://veizbtzugssszhxabzrv.supabase.co/storage/v1/object/public/king-sparkon-logo/AXA.png";
const ADMIN_CAPACITY_IMAGE = "https://veizbtzugssszhxabzrv.supabase.co/storage/v1/object/public/king-sparkon-logo/ChatGPT%20Image%20Jul%202,%202026,%2004_35_43%20PM%20(3).png";
const OWNER_CAPACITY_IMAGE = "https://veizbtzugssszhxabzrv.supabase.co/storage/v1/object/public/king-sparkon-logo/ChatGPT%20Image%20Jul%202,%202026,%2004_26_15%20PM%20(3).png";
const CONTACT_FORM_IMAGE = "https://veizbtzugssszhxabzrv.supabase.co/storage/v1/object/public/king-sparkon-logo/ChatGPT%20Image%20Jul%202,%202026,%2004_35_42%20PM%20(1).png";
const APPLICATION_COMPLAINT_PRIMARY_IMAGE = "https://veizbtzugssszhxabzrv.supabase.co/storage/v1/object/public/king-sparkon-logo/ChatGPT%20Image%20Jul%202,%202026,%2004_35_42%20PM%20(2).png";
const APPLICATION_COMPLAINT_SECONDARY_IMAGE = "https://veizbtzugssszhxabzrv.supabase.co/storage/v1/object/public/king-sparkon-logo/ChatGPT%20Image%20Jul%202,%202026,%2004_26_11%20PM%20(2).png";
const FACEBOOK_COMPLAINT_LINK = "https://www.facebook.com/share/1CaAzEGBJb/";

function planRegisterHref(plan: (typeof BUSINESS_PRICING_PLANS)[number]) {
  return `/register?plan=${plan.planCode}&privilege=${plan.registrationPrivilege}&service=${plan.registrationService}`;
}

export function KingSparkonLanding() {
  const [activeSection, setActiveSection] = useState("#vision");

  useEffect(() => {
    const sections = navLinks
      .map(([, href]) => document.querySelector(href))
      .filter((section): section is Element => Boolean(section));
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
      <section className="relative overflow-hidden bg-white pt-36 enterprise-grid">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-18rem] top-[-18rem] h-[44rem] w-[44rem] rounded-full bg-[var(--gold)]/20 blur-3xl" />
          <div className="absolute right-[-12rem] top-8 h-[34rem] w-[34rem] rounded-full bg-[var(--ember)]/16 blur-3xl" />
        </div>

        <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--line)] bg-white/88 shadow-[0_18px_60px_rgba(7,19,31,0.08)] backdrop-blur-xl">
          <div className="border-b border-[var(--gold)]/30 bg-[#8e3f68] px-5 py-2 text-center text-white/90 text-xs font-black">
            <span className="text-[var(--gold)]">Sparks evolved:</span> King Sparkon powers scanning, tickets, jobs, Dev Hub, free affiliates, and role-safe dashboards.
          </div>
          <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 md:px-8" aria-label="Primary navigation">
            <Link href="/" className="flex min-w-0 items-center gap-3">
              <Image src="/king-sparkon-logo.png" alt="King Sparkon Tracker barcode logo" width={48} height={48} className="rounded-[1.15rem] border border-[var(--line)] bg-white p-1 shadow-[var(--shadow-soft)]" priority />
              <div>
                <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[var(--signal)]">Sparks to King Sparkon</p>
                <p className="font-black uppercase tracking-[-0.02em]">King Sparkon Tracker</p>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/login" className="hidden min-h-11 items-center justify-center rounded-full border border-[var(--line)] px-4 text-sm font-bold text-[var(--steel)] hover:border-[var(--gold)] sm:inline-flex">Login</Link>
              <Link href="/register?plan=FREE_USER&privilege=USER&service=FREE_USER_ACCESS" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-4 text-sm font-bold text-white shadow-[var(--shadow-soft)] hover:bg-[#8e3f68]">Start free <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </nav>
          <div className="mx-auto flex max-w-7xl gap-1.5 overflow-x-auto border-t border-[var(--line)] px-5 py-2.5 text-[0.68rem] font-black uppercase tracking-[0.08em] text-[var(--steel)] md:px-8" aria-label="Section navigation">
            {navLinks.map(([label, href]) => (
              <a key={href} href={href} aria-current={activeSection === href ? "location" : undefined} className={`shrink-0 rounded-full border px-3 py-1.5 transition ${activeSection === href ? "border-[var(--gold)] bg-[var(--gold)]/45 text-[var(--ink)] shadow-[0_8px_18px_rgba(255,179,107,0.2)]" : "border-[var(--gold)]/35 bg-[var(--gold)]/12 text-[var(--ink)]/70 hover:border-[var(--gold)] hover:bg-[var(--gold)]/30 hover:text-[var(--ink)]"}`}>{label}</a>
            ))}
          </div>
        </header>

        <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-12 md:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:pb-24 lg:pt-18">
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--line)] bg-white px-3 py-2 font-mono text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--steel)] shadow-[var(--shadow-soft)]">
              <Flame className="h-4 w-4 text-[var(--ember)]" /> Real product discipline. Crown-level energy.
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.02] tracking-[-0.055em] md:text-6xl xl:text-7xl">
              Trademark <span className="mx-1 rounded-[0.16em] bg-[var(--gold)] px-[0.14em] text-[#000]">not brand</span>. It is <span className="mx-1 rounded-[0.16em] bg-[var(--gold)] px-[0.14em] text-[#000]">all in</span> platform.
            </h1>
            <FounderVerificationCard />
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--steel)]">Barcode inventory, QR tickets, cart checkout, job opportunities, worker tips, Dev Hub software delivery, free affiliates, promotions, payments, capacity views, and role-safe dashboards.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register?plan=FREE_USER&privilege=USER&service=FREE_USER_ACCESS" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 py-2 text-sm font-bold text-white shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:bg-[#8e3f68]">Create free user <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/register?plan=FREE_AFFILIATE&privilege=AFFILIATE&service=FREE_AFFILIATE_ACCESS" className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--line)] bg-white px-5 py-2 text-sm font-bold text-[var(--ink)] shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:border-[var(--gold)]">Join free affiliate</Link>
              <Link href="/register?plan=FREE_TRIAL_BUSINESS&privilege=BUSINESS_OWNER&service=FULL_BUSINESS_SUITE" className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--gold)] bg-[var(--gold)] px-5 py-2 text-sm font-bold text-[var(--ink)] shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:border-[var(--ink)]">Start business free 14 trial</Link>
            </div>
          </div>

          <div className="grid gap-5">
            <ScanLoop />
            <div className="grid gap-3 rounded-[2rem] border border-[var(--line)] bg-white/82 p-4 shadow-[var(--shadow-ledger)] backdrop-blur sm:grid-cols-2 xl:grid-cols-4">
              {[["Identity", "King Sparkon"], ["User plan", "R0"], ["Affiliate plan", "R0"], ["Owner suite", "14-day trial"]].map(([label, value]) => (
                <div key={label} className="rounded-[1.35rem] border border-[var(--line)] bg-[var(--surface)] p-4">
                  <p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.16em] text-[var(--signal)]">{label}</p>
                  <p className="mt-2 text-lg font-black text-[var(--ink)]">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="vision" className="scroll-mt-28 px-5 py-16 md:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--signal)]">01 / King Sparkon vision</p>
              <h2 className="mt-4 text-4xl font-black tracking-[-0.055em] md:text-6xl">Build the operating crown for real-world commerce.</h2>
            </div>
            <p className="text-base leading-8 text-[var(--steel)] lg:text-lg">
              King Sparkon exists to connect scanning, ticketing, cart checkout, worker tips, job opportunities, Dev Hub delivery, affiliate growth, and business capacity into one disciplined platform. The vision is simple: every action should be traceable, every role should be protected, and every business should understand what is happening before chaos starts.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visionPillars.map(({ icon: Icon, title, copy }) => (
              <article key={title} className="rounded-[2rem] border border-[var(--line)] bg-white p-6 shadow-[var(--shadow-soft)] transition duration-200 ease-out hover:-translate-y-1 hover:border-[var(--gold)] hover:shadow-[var(--shadow-ledger)]">
                <div className="grid h-14 w-14 place-items-center rounded-[1.25rem] bg-[#8e3f68] text-[var(--gold)]">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-2xl font-black tracking-[-0.04em]">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--steel)]">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="sponsor" className="scroll-mt-28 px-5 py-16 md:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 overflow-hidden rounded-[2.75rem] bg-[#8e3f68] p-6 text-white shadow-[var(--shadow-depth)] enterprise-grid lg:grid-cols-[0.9fr_1.1fr] lg:p-8">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">02 / Sponsor or Tip King Sparkon</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.055em] md:text-6xl">Support the platform that keeps QR commerce alive.</h2>
            <p className="mt-5 text-sm leading-7 text-white/68 md:text-base">
              Every tip or sponsorship helps maintain and grow King Sparkon: hosting, storage, security, QA, scan reliability, ticket verification, and new features for businesses, workers, affiliates, and free users.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {sponsorMaintains.map((item) => (
                <div key={item} className="rounded-[1.35rem] border border-white/10 bg-white/[0.06] p-4 text-sm font-semibold leading-6 text-white/72">
                  <BadgeCheck className="mb-3 h-5 w-5 text-[var(--gold)]" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2.25rem] border border-white/10 bg-white/[0.07] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="relative overflow-hidden rounded-[1.9rem] border border-white/10 bg-[radial-gradient(circle_at_50%_20%,rgba(255,210,90,0.18),rgba(255,255,255,0.06)_48%,rgba(7,19,31,0.22))] shadow-[0_22px_70px_rgba(0,0,0,0.28)]">
              <img src={TIP_KING_SPARKON_IMAGE} alt="Tip King Sparkon support visual" loading="lazy" decoding="async" className="h-72 w-full object-contain p-4" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(7,19,31,0.96)] via-[rgba(7,19,31,0.55)] to-transparent px-5 pb-5 pt-20">
                <p className="font-mono text-[0.62rem] font-black uppercase tracking-[0.18em] text-[var(--gold)]">Tip King Sparkon</p>
                <p className="mt-2 text-2xl font-black tracking-[-0.05em]">Maintain. Build. Grow.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-[0.9fr_1.1fr] md:items-center">
              <div className="rounded-[1.85rem] bg-white p-4 text-[var(--ink)] shadow-[var(--shadow-soft)]">
                <div className="grid grid-cols-9 gap-1 rounded-[1.25rem] border border-[var(--line)] bg-white p-3">
                  {Array.from({ length: 81 }).map((_, index) => (
                    <span key={index} className={`aspect-square rounded-[0.18rem] ${qrCells.has(index) ? "bg-[#8e3f68]" : "bg-[var(--surface)]"}`} />
                  ))}
                </div>
                <p className="mt-4 text-center font-mono text-[0.62rem] font-black uppercase tracking-[0.16em] text-[var(--signal)]">King Sparkon QR Support</p>
              </div>
              <div>
                <QrCode className="h-10 w-10 text-[var(--gold)]" />
                <h3 className="mt-4 text-3xl font-black tracking-[-0.045em]">Tip or sponsor to maintain and grow the platform.</h3>
                <p className="mt-4 text-sm leading-7 text-white/66">This QR support block is for the King Sparkon mission: keeping the platform stable, secure, tested, and ready for more businesses.</p>
                <a href="#contact" className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--gold)] bg-[var(--gold)] px-6 font-black text-[var(--ink)] shadow-[var(--shadow-soft)] hover:border-white">
                  Sponsor / Tip King Sparkon <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="scroll-mt-28 px-5 py-16 md:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--signal)]">03 / no weak UI</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.055em] md:text-6xl">A full platform with every feature visible.</h2>
            <p className="mt-4 text-sm leading-7 text-[var(--steel)] md:text-base">Scanning, tickets, cart, jobs, tips, affiliates, Dev Hub, capacity, and role-safe dashboards.</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {features.map(({ icon: Icon, title, copy, tags }) => (
              <article key={title} className="rounded-[2rem] border border-[var(--line)] bg-white p-6 shadow-[var(--shadow-soft)] hover:-translate-y-1 hover:border-[var(--gold)]">
                <div className="grid h-14 w-14 place-items-center rounded-[1.25rem] bg-[#8e3f68] text-[var(--gold)]">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-2xl font-black tracking-[-0.04em]">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--steel)]">{copy}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs font-bold text-[var(--steel)]">{tag}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <JobOpportunitiesSection />
      <AffiliateProgramSection />
      <DevHubSection />

      <section id="roles" className="scroll-mt-28 px-5 py-16 md:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 rounded-[2.75rem] bg-[#8e3f68] p-6 text-white shadow-[var(--shadow-depth)] enterprise-grid lg:p-8">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="max-w-4xl">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">07 / choose your form</p>
              <h2 className="mt-4 text-4xl font-black tracking-[-0.055em] md:text-6xl">Every role gets the right door.</h2>
              <p className="mt-5 text-sm leading-7 text-white/68 md:text-base">Registration now renders based on the selected role: User, Affiliate, Owner, or locked Admin.</p>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.07] p-3 shadow-[0_26px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <div className="relative overflow-hidden rounded-[1.65rem] bg-[radial-gradient(circle_at_50%_20%,rgba(255,210,90,0.16),rgba(255,255,255,0.05)_48%,rgba(7,19,31,0.42))]">
                <img src={CHOOSE_FORM_IMAGE} alt="King Sparkon choose your form visual" loading="lazy" decoding="async" className="h-72 w-full object-contain p-4" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(7,19,31,0.96)] via-[rgba(7,19,31,0.48)] to-transparent px-5 pb-5 pt-20">
                  <p className="font-mono text-[0.62rem] font-black uppercase tracking-[0.18em] text-[var(--gold)]">Choose your King Sparkon door</p>
                  <p className="mt-2 text-2xl font-black tracking-[-0.05em]">User. Affiliate. Owner. Admin.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {roleCards.map(({ icon: Icon, title, price, href, copy }) => (
              <Link key={title} href={href} className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 text-white backdrop-blur hover:-translate-y-1 hover:border-[var(--gold)]">
                <div className="flex items-start justify-between gap-4">
                  <Icon className="h-7 w-7 text-[var(--gold)]" />
                  <span className="rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-xs font-black uppercase tracking-[0.1em] text-white/72">{price}</span>
                </div>
                <h3 className="mt-6 text-2xl font-black tracking-[-0.04em]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/64">{copy}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="capacity" className="scroll-mt-28 px-5 py-16 md:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.75rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-ledger)] md:p-8">
          <div className="mx-auto max-w-4xl text-center">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--signal)]">08 / capacity views</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.055em] md:text-6xl">Dashboards show how much the system can hold.</h2>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[var(--steel)] md:text-base">Capacity is workers, stock, jobs, tickets, campaigns, reports, and platform control.</p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/dashboard/admin/capacity" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-6 font-bold text-white shadow-[var(--shadow-soft)] hover:bg-[#8e3f68]">View admin capacity <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/dashboard/owner/capacity" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--line)] bg-white px-6 font-bold text-[var(--ink)] shadow-[var(--shadow-soft)] hover:border-[var(--gold)]">Owner capacity</Link>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
            <div className="capacity-hero-stage relative overflow-hidden rounded-[2.4rem] border border-[var(--line)] bg-[radial-gradient(circle_at_50%_18%,rgba(255,217,102,0.26),rgba(40,214,198,0.12)_34%,rgba(247,250,252,0.98)_72%)] p-4 shadow-[var(--shadow-depth)] sm:p-6">
              <div className="pointer-events-none absolute inset-0 enterprise-grid opacity-70" />
              <div className="capacity-dashboard-glow pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--gold)]/24 blur-3xl" />
              <div className="capacity-hero-deck relative min-h-[32rem] overflow-hidden rounded-[2rem] border border-white/80 bg-white/42 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur sm:min-h-[36rem]">
                <div className="absolute inset-x-8 bottom-10 h-36 rounded-[50%] border border-[var(--signal)]/20 bg-[linear-gradient(135deg,rgba(29,92,131,0.10),rgba(255,217,102,0.18))] shadow-[0_42px_90px_rgba(7,19,31,0.18)] [transform:rotateX(64deg)_rotateZ(-2deg)_translateZ(-80px)]" />
                <div className="absolute left-5 top-6 z-20 rounded-full border border-[var(--line)] bg-white/86 px-4 py-2 font-mono text-[0.62rem] font-black uppercase tracking-[0.16em] text-[var(--signal)] shadow-[var(--shadow-soft)]">Live capacity cockpit</div>
                <div className="absolute right-5 top-6 z-20 rounded-full border border-[var(--gold)]/50 bg-[#8e3f68] px-4 py-2 font-mono text-[0.62rem] font-black uppercase tracking-[0.16em] text-[var(--gold)] shadow-[var(--shadow-soft)]">Admin + owner views</div>
                <div className="capacity-card-3d capacity-card-3d-admin absolute left-2 top-20 z-10 w-[72%] max-w-[25rem] rounded-[1.85rem] border border-white/80 bg-white/78 p-3 shadow-[0_32px_90px_rgba(7,19,31,0.26)] backdrop-blur sm:left-8 sm:w-[60%]">
                  <div className="relative overflow-hidden rounded-[1.45rem] bg-[var(--surface)]">
                    <img src={ADMIN_CAPACITY_IMAGE} alt="3D admin capacity dashboard visual" loading="lazy" decoding="async" className="h-56 w-full object-contain p-2 sm:h-72" />
                    <div className="capacity-signal-line absolute inset-y-0 w-24 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.82),transparent)]" />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-mono text-[0.6rem] font-black uppercase tracking-[0.16em] text-[var(--signal)]">Admin capacity</p>
                      <p className="mt-1 text-xl font-black tracking-[-0.04em]">Platform control</p>
                    </div>
                    <BarChart3 className="h-7 w-7 text-[var(--signal)]" />
                  </div>
                </div>
                <div className="capacity-card-3d capacity-card-3d-owner absolute bottom-16 right-2 z-30 w-[72%] max-w-[25rem] rounded-[1.85rem] border border-[var(--gold)]/45 bg-[#8e3f68]/94 p-3 text-white shadow-[0_34px_100px_rgba(7,19,31,0.34)] backdrop-blur sm:right-8 sm:w-[58%]">
                  <div className="relative overflow-hidden rounded-[1.45rem] bg-[radial-gradient(circle_at_50%_20%,rgba(255,217,102,0.22),rgba(255,255,255,0.06)_54%,rgba(7,19,31,0.38))]">
                    <img src={OWNER_CAPACITY_IMAGE} alt="3D owner capacity dashboard visual" loading="lazy" decoding="async" className="h-56 w-full object-contain p-2 sm:h-72" />
                    <div className="capacity-signal-line absolute inset-y-0 w-24 bg-[linear-gradient(90deg,transparent,rgba(255,217,102,0.7),transparent)]" />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-mono text-[0.6rem] font-black uppercase tracking-[0.16em] text-[var(--gold)]">Owner capacity</p>
                      <p className="mt-1 text-xl font-black tracking-[-0.04em]">Business command</p>
                    </div>
                    <Crown className="h-7 w-7 text-[var(--gold)]" />
                  </div>
                </div>
                <div className="absolute bottom-5 left-5 right-5 z-40 grid gap-2 rounded-[1.45rem] border border-white/70 bg-white/84 p-3 shadow-[var(--shadow-soft)] backdrop-blur sm:grid-cols-3">
                  {["Workers", "Stock", "Tickets"].map((label, index) => (
                    <div key={label} className="rounded-[1rem] border border-[var(--line)] bg-white p-3">
                      <p className="font-mono text-[0.58rem] font-black uppercase tracking-[0.14em] text-[var(--signal)]">0{index + 1}</p>
                      <p className="mt-1 text-sm font-black text-[var(--ink)]">{label} capacity</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {capacityRows.map(([title, copy]) => (
                <article key={title} className="rounded-[1.65rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)] hover:-translate-y-1 hover:border-[var(--gold)]">
                  <BadgeCheck className="h-5 w-5 text-[var(--signal)]" />
                  <h3 className="mt-4 text-xl font-black tracking-[-0.03em]">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--steel)]">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="complaints" className="scroll-mt-28 px-5 py-16 md:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.75rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow-ledger)] md:p-8">
          <div className="mx-auto max-w-4xl text-center">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--signal)]">09 / application complaints</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.055em] md:text-6xl">A complaint from 2018 becomes product discipline now.</h2>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[var(--steel)] md:text-base">From the uploaded complaint note: software should comply with South African law, protect public health, safety, and welfare, serve clients ethically, keep products at a high professional standard, and promote integrity, colleagues, and lifelong learning.</p>
            <a href={FACEBOOK_COMPLAINT_LINK} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-6 font-bold text-white shadow-[var(--shadow-soft)] hover:bg-[#8e3f68]">
              Read Facebook complaint <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {complaintSignals.map(([title, copy]) => (
                <article key={title} className="rounded-[1.65rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)] hover:-translate-y-1 hover:border-[var(--gold)]">
                  <Megaphone className="h-5 w-5 text-[var(--signal)]" />
                  <h3 className="mt-4 text-xl font-black tracking-[-0.03em]">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--steel)]">{copy}</p>
                </article>
              ))}
            </div>

            <div className="capacity-hero-stage relative overflow-hidden rounded-[2.4rem] border border-[var(--line)] bg-[radial-gradient(circle_at_50%_18%,rgba(255,217,102,0.25),rgba(40,214,198,0.10)_34%,rgba(255,255,255,0.98)_72%)] p-4 shadow-[var(--shadow-depth)] sm:p-6">
              <div className="pointer-events-none absolute inset-0 enterprise-grid opacity-75" />
              <div className="capacity-dashboard-glow pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--gold)]/24 blur-3xl" />
              <div className="capacity-hero-deck relative min-h-[32rem] overflow-hidden rounded-[2rem] border border-white/80 bg-white/44 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur sm:min-h-[36rem]">
                <div className="absolute inset-x-8 bottom-10 h-36 rounded-[50%] border border-[var(--signal)]/20 bg-[linear-gradient(135deg,rgba(29,92,131,0.10),rgba(255,217,102,0.18))] shadow-[0_42px_90px_rgba(7,19,31,0.18)] [transform:rotateX(64deg)_rotateZ(-2deg)_translateZ(-80px)]" />
                <div className="absolute left-5 top-6 z-20 rounded-full border border-[var(--line)] bg-white/86 px-4 py-2 font-mono text-[0.62rem] font-black uppercase tracking-[0.16em] text-[var(--signal)] shadow-[var(--shadow-soft)]">2018 complaint memory</div>
                <div className="absolute right-5 top-6 z-20 rounded-full border border-[var(--gold)]/50 bg-[#8e3f68] px-4 py-2 font-mono text-[0.62rem] font-black uppercase tracking-[0.16em] text-[var(--gold)] shadow-[var(--shadow-soft)]">Build from friction</div>
                <div className="capacity-card-3d capacity-card-3d-admin absolute left-2 top-20 z-10 w-[72%] max-w-[25rem] rounded-[1.85rem] border border-white/80 bg-white/78 p-3 shadow-[0_32px_90px_rgba(7,19,31,0.26)] backdrop-blur sm:left-8 sm:w-[60%]">
                  <div className="relative overflow-hidden rounded-[1.45rem] bg-[var(--surface)]">
                    <img src={APPLICATION_COMPLAINT_PRIMARY_IMAGE} alt="3D application complaint visual" loading="lazy" decoding="async" className="h-56 w-full object-contain p-2 sm:h-72" />
                    <div className="capacity-signal-line absolute inset-y-0 w-24 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.82),transparent)]" />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-mono text-[0.6rem] font-black uppercase tracking-[0.16em] text-[var(--signal)]">Complaint input</p>
                      <p className="mt-1 text-xl font-black tracking-[-0.04em]">User pain captured</p>
                    </div>
                    <Megaphone className="h-7 w-7 text-[var(--signal)]" />
                  </div>
                </div>
                <div className="capacity-card-3d capacity-card-3d-owner absolute bottom-16 right-2 z-30 w-[72%] max-w-[25rem] rounded-[1.85rem] border border-[var(--gold)]/45 bg-[#8e3f68]/94 p-3 text-white shadow-[0_34px_100px_rgba(7,19,31,0.34)] backdrop-blur sm:right-8 sm:w-[58%]">
                  <div className="relative overflow-hidden rounded-[1.45rem] bg-[radial-gradient(circle_at_50%_20%,rgba(255,217,102,0.22),rgba(255,255,255,0.06)_54%,rgba(7,19,31,0.38))]">
                    <img src={APPLICATION_COMPLAINT_SECONDARY_IMAGE} alt="3D application complaint evidence visual" loading="lazy" decoding="async" className="h-56 w-full object-contain p-2 sm:h-72" />
                    <div className="capacity-signal-line absolute inset-y-0 w-24 bg-[linear-gradient(90deg,transparent,rgba(255,217,102,0.7),transparent)]" />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-mono text-[0.6rem] font-black uppercase tracking-[0.16em] text-[var(--gold)]">Product answer</p>
                      <p className="mt-1 text-xl font-black tracking-[-0.04em]">Complaint to roadmap</p>
                    </div>
                    <ShieldCheck className="h-7 w-7 text-[var(--gold)]" />
                  </div>
                </div>
                <div className="absolute bottom-5 left-5 right-5 z-40 grid gap-2 rounded-[1.45rem] border border-white/70 bg-white/84 p-3 shadow-[var(--shadow-soft)] backdrop-blur sm:grid-cols-3">
                  {["Listen", "Fix", "Prove"].map((label, index) => (
                    <div key={label} className="rounded-[1rem] border border-[var(--line)] bg-white p-3">
                      <p className="font-mono text-[0.58rem] font-black uppercase tracking-[0.14em] text-[var(--signal)]">0{index + 1}</p>
                      <p className="mt-1 text-sm font-black text-[var(--ink)]">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="scroll-mt-28 px-5 py-16 md:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--signal)]">10 / pricing</p>
              <div className="mt-4 inline-flex rounded-full border border-[var(--gold)] bg-[var(--gold)] px-4 py-2 font-mono text-[0.66rem] font-black uppercase tracking-[0.16em] text-[var(--ink)]">King-Sparkon-Strengths</div>
              <h2 className="mt-4 text-4xl font-black tracking-[-0.055em] md:text-6xl">Free where it must be free. Paid where business gets power.</h2>
              <p className="mt-4 text-sm leading-7 text-[var(--steel)] md:text-base">Prices come from the shared business policy. User and Affiliate start at R0. Business starts with a gold 14-day trial and a Dev Hub free quote path.</p>
            </div>
            <Link href="/register?plan=FREE_TRIAL_BUSINESS&privilege=BUSINESS_OWNER&service=FULL_BUSINESS_SUITE" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--gold)] bg-[var(--gold)] px-6 font-black text-[var(--ink)] shadow-[var(--shadow-soft)] hover:border-[var(--ink)] hover:bg-white">
              Start business free 14 trial <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-4 lg:grid-cols-5">
            {BUSINESS_PRICING_PLANS.map((plan) => (
              <article key={plan.planCode} className={`relative overflow-hidden rounded-[2rem] border p-5 shadow-[var(--shadow-soft)] ${plan.highlight ? "border-[var(--gold)] bg-[var(--surface)]" : "border-[var(--line)] bg-white"}`}>
                {plan.highlight ? <span className="absolute right-4 top-4 rounded-full bg-[#8e3f68] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[var(--gold)]">Best grow</span> : null}
                <p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-[var(--signal)]">{plan.caption}</p>
                <h3 className="mt-3 text-2xl font-black tracking-[-0.05em]">{plan.name}</h3>
                <p className="money mt-4 text-4xl font-black">{plan.priceDisplay}</p>
                <p className="mt-4 text-sm leading-7 text-[var(--steel)]">{plan.description}</p>
                <ul className="mt-5 grid gap-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2 text-sm font-bold text-[var(--steel)]"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--signal)]" />{feature}</li>
                  ))}
                </ul>
                <Link href={planRegisterHref(plan)} className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[var(--signal)] bg-[var(--signal)] px-4 text-sm font-black text-white hover:bg-[#8e3f68]">Choose {plan.name}</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="scroll-mt-28 px-5 py-16 md:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.75rem] border border-white/20 bg-[#8e3f68] p-5 text-white shadow-[var(--shadow-depth)] enterprise-grid md:p-8">
          <div className="mx-auto max-w-4xl text-center">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">11 / contact</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.055em] md:text-6xl">Build the King Sparkon operation properly.</h2>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/68 md:text-base">Tell us what you track, which roles use the system, and what the first dashboard must prove.</p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
            <div className="contact-hero-stage relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-white/[0.07] p-4 shadow-[0_30px_100px_rgba(0,0,0,0.36)] backdrop-blur-xl sm:p-6">
              <div className="pointer-events-none absolute inset-0 scan-grid opacity-80" />
              <div className="contact-dashboard-glow pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--gold)]/24 blur-3xl" />
              <div className="relative min-h-[31rem] overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_50%_12%,rgba(255,217,102,0.20),rgba(255,255,255,0.06)_46%,rgba(7,19,31,0.42))] p-4">
                <div className="absolute inset-x-8 bottom-10 h-36 rounded-[50%] border border-[var(--gold)]/20 bg-[linear-gradient(135deg,rgba(255,217,102,0.18),rgba(40,214,198,0.12))] shadow-[0_46px_100px_rgba(0,0,0,0.35)] [transform:rotateX(64deg)_rotateZ(3deg)_translateZ(-80px)]" />
                <div className="absolute left-5 top-5 z-20 rounded-full border border-white/10 bg-white/[0.08] px-4 py-2 font-mono text-[0.62rem] font-black uppercase tracking-[0.16em] text-[var(--gold)] shadow-[var(--shadow-soft)]">Contact pipeline</div>
                <div className="absolute right-5 top-5 z-20 rounded-full border border-[var(--gold)]/40 bg-[var(--gold)] px-4 py-2 font-mono text-[0.62rem] font-black uppercase tracking-[0.16em] text-[var(--ink)] shadow-[var(--shadow-soft)]">Message to action</div>
                <div className="contact-card-3d absolute inset-x-4 top-20 z-30 rounded-[1.9rem] border border-white/14 bg-white/[0.08] p-3 shadow-[0_34px_110px_rgba(0,0,0,0.42)] backdrop-blur sm:inset-x-8">
                  <div className="relative overflow-hidden rounded-[1.55rem] bg-[radial-gradient(circle_at_50%_20%,rgba(255,217,102,0.18),rgba(255,255,255,0.08)_52%,rgba(7,19,31,0.34))]">
                    <img src={CONTACT_FORM_IMAGE} alt="3D King Sparkon contact form visual" loading="lazy" decoding="async" className="h-80 w-full object-contain p-3 sm:h-[26rem]" />
                    <div className="contact-signal-line absolute inset-y-0 w-24 bg-[linear-gradient(90deg,transparent,rgba(255,217,102,0.72),transparent)]" />
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {["Track", "Review", "Build"].map((label, index) => (
                      <div key={label} className="rounded-[1rem] border border-white/10 bg-white/[0.08] p-3">
                        <p className="font-mono text-[0.58rem] font-black uppercase tracking-[0.14em] text-[var(--gold)]">0{index + 1}</p>
                        <p className="mt-1 text-sm font-black text-white">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <span className="contact-orbit-dot absolute bottom-20 left-8 h-3 w-3 rounded-full bg-[var(--gold)] shadow-[0_0_28px_rgba(255,217,102,0.85)]" />
                <span className="contact-orbit-dot absolute bottom-28 right-12 h-2.5 w-2.5 rounded-full bg-[var(--signal)] shadow-[0_0_28px_rgba(40,214,198,0.75)] [animation-delay:900ms]" />
                <span className="contact-orbit-dot absolute left-1/2 top-16 h-2 w-2 rounded-full bg-white shadow-[0_0_24px_rgba(255,255,255,0.72)] [animation-delay:1500ms]" />
              </div>
            </div>

            <div className="rounded-[2.4rem] border border-white/10 bg-white p-5 text-[var(--ink)] shadow-[0_30px_100px_rgba(0,0,0,0.26)] md:p-8">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <SubscriptionSection />
    </main>
  );
}
