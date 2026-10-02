"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BadgePercent,
  Banknote,
  Boxes,
  BriefcaseBusiness,
  CalendarDays,
  ClipboardList,
  Crown,
  Mic2,
  Music,
  QrCode,
  ReceiptText,
  ScanLine,
  ShoppingBag,
  ShoppingCart,
  Store,
  Ticket,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

/* Journey sections for the landing experience. All content here is either
   structural (how things connect) or explicitly labeled illustrative
   example content — never fake production statistics. Motion is CSS-only
   and disabled under prefers-reduced-motion. */

export function ExampleTag({ label = "Example" }: { label?: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--premium-gold)]/40 bg-[var(--premium-gold)]/10 px-2 py-0.5 font-mono text-[0.6rem] font-black uppercase tracking-[0.14em] text-[var(--premium-gold)]">
      {label}
    </span>
  );
}

export function JourneyHead({
  eyebrow,
  title,
  copy,
  dark = false,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  dark?: boolean;
}) {
  return (
    <div className="max-w-3xl">
      <p className={cn("font-mono text-[0.6875rem] font-bold uppercase tracking-[0.16em]", dark ? "text-[var(--premium-gold)]" : "text-[var(--signal-strong)]")}>
        {eyebrow}
      </p>
      <h2 className={cn("mt-2 text-3xl font-black tracking-[-0.04em] md:text-4xl", dark ? "text-white" : "text-[var(--ink)]")}>
        {title}
      </h2>
      {copy ? <p className={cn("mt-3 text-[0.9375rem] leading-7", dark ? "text-white/65" : "text-[var(--steel)]")}>{copy}</p> : null}
    </div>
  );
}

type ChainStep = { icon: LucideIcon; label: string; detail: string };

export function FlowChain({ steps, dark = false }: { steps: ChainStep[]; dark?: boolean }) {
  return (
    <ol className="journey-chain mt-8 grid gap-2 md:flex md:items-stretch md:gap-0">
      {steps.map(({ icon: Icon, label, detail }, index) => (
        <li key={label} className="relative md:min-w-0 md:flex-1">
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl border p-3 md:flex-col md:items-start md:gap-2 md:p-3.5",
              dark ? "border-white/10 bg-white/[0.05]" : "border-[var(--line)] bg-white shadow-[var(--shadow-soft)]",
            )}
          >
            <span
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-lg border",
                dark ? "border-[var(--premium-gold)]/30 bg-[var(--premium-gold)]/10 text-[var(--premium-gold)]" : "border-[var(--line)] bg-[var(--surface)] text-[var(--signal)]",
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span>
              <span className={cn("block text-[0.8125rem] font-bold leading-tight", dark ? "text-white" : "text-[var(--ink)]")}>{label}</span>
              <span className={cn("mt-0.5 block text-xs leading-4", dark ? "text-white/50" : "text-[var(--muted)]")}>{detail}</span>
            </span>
          </div>
          {index < steps.length - 1 ? (
            <span className="journey-link hidden md:block" aria-hidden="true">
              <span className="journey-signal" style={{ animationDelay: `${index * 0.45}s` }} />
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

const mainFlow: ChainStep[] = [
  { icon: Mic2, label: "Artist joins", detail: "A performer appears" },
  { icon: CalendarDays, label: "Event takes shape", detail: "Date, venue, lineup" },
  { icon: Ticket, label: "Tickets move", detail: "Sold and scanned" },
  { icon: ShoppingBag, label: "Products move", detail: "Stock leaves the shelf" },
  { icon: UsersRound, label: "People show up", detail: "Workers and buyers" },
  { icon: Banknote, label: "Payments happen", detail: "Tips, carts, payouts" },
  { icon: ClipboardList, label: "Everything recorded", detail: "Ledger and reports" },
];

export function FlowSequence() {
  return (
    <section id="flow" className="scroll-mt-24 border-t border-[var(--line)] bg-[#050508] px-5 py-10 md:px-8 lg:py-14">
      <div className="mx-auto max-w-7xl">
        <JourneyHead
          dark
          eyebrow="How it moves"
          title="One thing leads to the next."
          copy="An artist joins. An event takes shape. Tickets start moving, products leave the shelf, people show up, payments happen — and everything is recorded. That is the whole platform in one motion."
        />
        <FlowChain steps={mainFlow} dark />
      </div>
    </section>
  );
}

const peopleLinks = [
  { icon: UsersRound, name: "Artist", line: "Finds stages, confirms sets, gets paid." },
  { icon: CalendarDays, name: "Event", line: "Holds the lineup, tickets and timing." },
  { icon: Store, name: "Owner", line: "Watches stock, sales and people." },
  { icon: ShoppingCart, name: "Customer", line: "Buys products and tickets." },
  { icon: QrCode, name: "Worker", line: "Scans, sells and verifies at speed." },
];

export function PeopleWorld({ roleRail }: { roleRail: ReactNode }) {
  return (
    <section id="people" className="scroll-mt-24 bg-white px-5 py-10 md:px-8 lg:py-14">
      <div className="mx-auto max-w-7xl">
        <JourneyHead
          eyebrow="People"
          title="One place. Different people. Same world."
          copy="Owners, artists, workers, customers and affiliates act on the same events, products and records — each seeing only what their role needs."
        />
        <div className="mt-8 flex flex-wrap items-center gap-2" aria-label="How people connect through an event">
          {peopleLinks.map(({ icon: Icon, name, line }, index) => (
            <div key={name} className="flex items-center gap-2">
              <span className="group inline-flex items-center gap-2.5 rounded-xl border border-[var(--line)] bg-white px-3.5 py-2.5 shadow-[var(--shadow-soft)]" title={line}>
                <Icon className="h-4 w-4 text-[var(--signal)]" />
                <span className="text-[0.8125rem] font-bold text-[var(--ink)]">{name}</span>
              </span>
              {index < peopleLinks.length - 1 ? <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[var(--muted)]" aria-hidden="true" /> : null}
            </div>
          ))}
        </div>
        <div className="mt-8">{roleRail}</div>
      </div>
    </section>
  );
}

const exampleActivity = [
  { icon: Mic2, label: "Artist confirmed for Saturday set", time: "moments ago" },
  { icon: Ticket, label: "12 tickets sold for Spring Fest", time: "minutes ago" },
  { icon: ShoppingBag, label: "Stock moved at the counter", time: "minutes ago" },
  { icon: Banknote, label: "Payment received and recorded", time: "just now" },
];

export function ExampleEvent() {
  return (
    <section id="events" className="scroll-mt-24 border-y border-[var(--line)] bg-white px-5 py-10 md:px-8 lg:py-14">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <JourneyHead
          eyebrow="Events"
          title="An event feels alive."
          copy="Identity, lineup, timing, ticket movement, people on the ground and a running record of what just happened — one living page per event, not a database row."
        />
        <article className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow-ledger)]">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] bg-[#0a0a14] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <p className="text-[0.8125rem] font-black tracking-tight text-white">Spring Fest</p>
              <span className="rounded-md bg-emerald-400/15 px-1.5 py-0.5 font-mono text-[0.625rem] font-black uppercase tracking-[0.1em] text-emerald-300">Live</span>
            </div>
            <ExampleTag />
          </div>
          <div className="grid grid-cols-3 divide-x divide-[var(--line)] border-b border-[var(--line)] text-center">
            {[
              ["124", "tickets"],
              ["6", "artists"],
              ["12", "workers"],
            ].map(([value, label]) => (
              <div key={label} className="px-3 py-3">
                <p className="font-mono text-xl font-black text-[var(--ink)]">{value}</p>
                <p className="mt-0.5 text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">{label}</p>
              </div>
            ))}
          </div>
          <ul className="grid gap-px bg-[var(--line)]">
            {exampleActivity.map(({ icon: Icon, label, time }) => (
              <li key={label} className="flex items-center gap-2.5 bg-white px-4 py-2.5">
                <Icon className="h-3.5 w-3.5 shrink-0 text-[var(--signal)]" />
                <span className="min-w-0 flex-1 truncate text-[0.8125rem] font-semibold text-[var(--ink)]">{label}</span>
                <span className="shrink-0 text-[0.6875rem] font-medium text-[var(--muted)]">{time}</span>
              </li>
            ))}
          </ul>
          <p className="bg-[var(--surface)] px-4 py-2.5 text-[0.6875rem] leading-4 text-[var(--muted)]">
            Illustrated example of an event page. Real numbers come from your events, artists and sales.
          </p>
        </article>
      </div>
    </section>
  );
}

const systemChains: Array<{ title: string; copy: string; steps: ChainStep[] }> = [
  {
    title: "Scan to record",
    copy: "A barcode or QR is verified, the event and ticket update, payment clears and the ledger keeps the trace for reports.",
    steps: [
      { icon: ScanLine, label: "Scan", detail: "Verify code" },
      { icon: CalendarDays, label: "Event", detail: "Capacity updates" },
      { icon: Ticket, label: "Ticket", detail: "Issued + checked" },
      { icon: Banknote, label: "Payment", detail: "Confirmed" },
      { icon: ReceiptText, label: "Ledger", detail: "Kept" },
      { icon: ClipboardList, label: "Report", detail: "Readable" },
    ],
  },
  {
    title: "Artist to earnings",
    copy: "A performer finds an open set, agrees the rider, plays the event and the payout follows the booking.",
    steps: [
      { icon: Mic2, label: "Artist", detail: "Applies" },
      { icon: Music, label: "Set", detail: "Confirmed" },
      { icon: ClipboardList, label: "Rider", detail: "Agreed" },
      { icon: CalendarDays, label: "Event", detail: "Performed" },
      { icon: WalletCards, label: "Earnings", detail: "Withdrawn" },
    ],
  },
  {
    title: "Product to record",
    copy: "Stock is listed, ordered and checked out at the counter or online — quantities and records update together.",
    steps: [
      { icon: Boxes, label: "Product", detail: "Listed" },
      { icon: ShoppingCart, label: "Order", detail: "Placed" },
      { icon: QrCode, label: "Checkout", detail: "Paid" },
      { icon: Store, label: "Stock", detail: "Updated" },
      { icon: ReceiptText, label: "Record", detail: "Kept" },
    ],
  },
];

export function SystemChains() {
  return (
    <section id="alive" className="scroll-mt-24 bg-[#050508] px-5 py-10 md:px-8 lg:py-14">
      <div className="mx-auto max-w-7xl">
        <JourneyHead
          dark
          eyebrow="The platform comes alive"
          title="A signal enters. Something changes."
          copy="Every flow below is the same pattern: something happens in the real world, King Sparkon verifies it, and the record follows. Watch how the pieces connect."
        />
        <div className="mt-2 grid gap-8">
          {systemChains.map((chain) => (
            <div key={chain.title}>
              <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="text-[0.9375rem] font-bold text-white">{chain.title}</h3>
                <p className="text-[0.8125rem] text-white/55">{chain.copy}</p>
              </div>
              <FlowChain steps={chain.steps} dark />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const activityFeed = [
  { icon: Mic2, label: "DJ Nova confirmed for the Saturday set", time: "2 min ago" },
  { icon: Ticket, label: "12 tickets sold for Spring Fest", time: "5 min ago" },
  { icon: ShoppingBag, label: "4 products sold at the counter", time: "8 min ago" },
  { icon: Banknote, label: "R850 received and recorded", time: "11 min ago" },
  { icon: BriefcaseBusiness, label: "Job application received", time: "14 min ago" },
];

export function ActivityExample() {
  return (
    <section id="activity" className="scroll-mt-24 bg-white px-5 py-10 md:px-8 lg:py-14">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <JourneyHead
            eyebrow="Activity"
            title="Happening now."
            copy="Every confirmation, sale, scan and payment surfaces as a small meaningful event. Imagine your own activity appearing here — inside the product, it is live."
          />
          <div className="mt-4">
            <ExampleTag label="Illustrated example" />
          </div>
        </div>
        <ul className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow-soft)]">
          {activityFeed.map(({ icon: Icon, label, time }, index) => (
            <li
              key={label}
              className={cn(
                "activity-row flex items-center gap-3 px-4 py-3",
                index > 0 && "border-t border-[var(--line)]",
              )}
              style={{ animationDelay: `${index * 0.6}s` }}
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--signal)]">
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1 truncate text-[0.8125rem] font-semibold text-[var(--ink)]">{label}</span>
              <span className="shrink-0 font-mono text-[0.6875rem] font-medium text-[var(--muted)]">{time}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const commerceSteps: ChainStep[] = [
  { icon: Boxes, label: "Product", detail: "On the shelf" },
  { icon: Store, label: "Shelf", detail: "Stock visible" },
  { icon: ShoppingCart, label: "Order", detail: "Cart built" },
  { icon: QrCode, label: "Checkout", detail: "Paid + verified" },
  { icon: ShoppingBag, label: "Collection", detail: "Handed over" },
  { icon: ClipboardList, label: "Stock updated", detail: "Record kept" },
];

export function CommerceChain() {
  return (
    <section id="commerce" className="scroll-mt-24 border-y border-[var(--line)] bg-white px-5 py-10 md:px-8 lg:py-14">
      <div className="mx-auto max-w-7xl">
        <JourneyHead
          eyebrow="Commerce"
          title="Real things, moving."
          copy="King Sparkon deals with physical stock, real counters and actual collections — the chain below is what a single product travels."
        />
        <FlowChain steps={commerceSteps} />
      </div>
    </section>
  );
}

const moneySteps: ChainStep[] = [
  { icon: ShoppingBag, label: "Sale", detail: "Made" },
  { icon: Banknote, label: "Payment", detail: "Confirmed" },
  { icon: BadgePercent, label: "Allocation", detail: "Split fairly" },
  { icon: WalletCards, label: "People paid", detail: "Artist · worker · owner" },
  { icon: ReceiptText, label: "Record", detail: "Traceable" },
];

export function MoneyFlow() {
  return (
    <section id="money" className="scroll-mt-24 bg-white px-5 py-10 md:px-8 lg:py-14">
      <div className="mx-auto max-w-7xl">
        <JourneyHead
          eyebrow="Money"
          title="Money moves, but it stays understandable."
          copy="Every sale is confirmed, allocated to the people who earned it, and kept as a traceable record. Energy with a paper trail."
        />
        <FlowChain steps={moneySteps} />
      </div>
    </section>
  );
}

export function WorldMoment() {
  return (
    <section id="world" className="scroll-mt-24 overflow-hidden bg-[#050508] px-5 py-12 md:px-8 lg:py-16">
      <div className="mx-auto max-w-4xl text-center">
        <p className="font-mono text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-[var(--premium-gold)]">King Sparkon</p>
        <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-black tracking-[-0.04em] text-white md:text-5xl">
          Not one tool. One world.
        </h2>
        <div className="world-map mx-auto mt-10 grid max-w-2xl gap-2 text-left sm:grid-cols-3" aria-label="How the platform connects">
          {[
            { icon: UsersRound, label: "People", detail: "Artists · workers · owners" },
            { icon: CalendarDays, label: "Events", detail: "Lineups · timing · gates" },
            { icon: ShoppingBag, label: "Commerce", detail: "Products · carts · stock" },
          ].map(({ icon: Icon, label, detail }) => (
            <div key={label} className="rounded-xl border border-white/10 bg-white/[0.05] p-3.5">
              <Icon className="h-4 w-4 text-[var(--premium-gold)]" />
              <p className="mt-2 text-[0.8125rem] font-bold text-white">{label}</p>
              <p className="mt-0.5 text-xs text-white/50">{detail}</p>
            </div>
          ))}
          <div className="rounded-xl border border-[var(--premium-cyan)]/30 bg-[var(--premium-cyan)]/[0.07] p-3.5 sm:col-span-3">
            <p className="text-[0.8125rem] font-bold text-white">Activity → Payments → Records</p>
            <p className="mt-0.5 text-xs text-white/50">Everything that moves leaves a trace you can follow.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

const scenarios = [
  {
    title: "You run events.",
    copy: "You see sales, capacity and who is at the gate.",
    href: "/register?plan=FREE_TRIAL_BUSINESS&privilege=BUSINESS_OWNER&service=FULL_BUSINESS_SUITE",
    action: "Open an owner workspace",
  },
  {
    title: "You make music.",
    copy: "You see open sets, bookings and your payouts.",
    href: "/register?plan=FREE_USER&privilege=USER&service=FREE_USER_ACCESS",
    action: "Join as a member",
  },
  {
    title: "You work.",
    copy: "You see scans, orders, tickets and tips.",
    href: "/login",
    action: "Sign in to work",
  },
  {
    title: "You buy.",
    copy: "You find events, products and your tickets.",
    href: "/#events",
    action: "See an event page",
  },
];

export function ScenarioWindows() {
  return (
    <section id="you" className="scroll-mt-24 bg-white px-5 py-10 md:px-8 lg:py-14">
      <div className="mx-auto max-w-7xl">
        <JourneyHead
          eyebrow="Your place in it"
          title="See yourself inside."
          copy="Four windows into the same world. Each one opens a different view — the platform underneath stays connected."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {scenarios.map(({ title, copy, href, action }) => (
            <Link
              key={title}
              href={href}
              className="group flex flex-col rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:border-[var(--premium-cyan)]/50"
            >
              <p className="text-[1.125rem] font-black tracking-[-0.02em] text-[var(--ink)]">{title}</p>
              <p className="mt-2 flex-1 text-[0.8125rem] leading-5 text-[var(--steel)]">{copy}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-bold text-[var(--signal-strong)] group-hover:text-[var(--premium-cyan)]">
                {action} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingEnding() {
  return (
    <section id="enter" className="scroll-mt-24 bg-[#050508] px-5 py-12 md:px-8 lg:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <Crown className="mx-auto h-6 w-6 text-[var(--premium-gold)]" aria-hidden="true" />
        <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-white md:text-5xl">
          The world doesn&apos;t wait.
        </h2>
        <p className="mt-3 text-[0.9375rem] leading-7 text-white/60">Neither should your platform. Step inside and watch things move.</p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
          <Link
            href="/register"
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-[var(--premium-gold)]/50 bg-[var(--premium-gold)]/10 px-5 text-[0.8125rem] font-extrabold text-[var(--premium-gold)] transition-colors duration-200 hover:bg-[var(--premium-gold)] hover:text-black motion-reduce:transition-none"
          >
            Enter Sparkon <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/#download"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-white/15 bg-white/[0.06] px-5 text-[0.8125rem] font-bold text-white hover:border-[var(--premium-gold)]/50"
          >
            Get the app
          </Link>
          <Link
            href="/#contact"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-white/15 bg-transparent px-5 text-[0.8125rem] font-bold text-white/70 hover:text-white"
          >
            Talk to us
          </Link>
        </div>
      </div>
    </section>
  );
}

const tickerWords = [
  "Barcode verified",
  "QR tickets live",
  "Artists performing",
  "Workers scanning",
  "Tips settling",
  "Payments recorded",
  "Jobs open",
  "Stock moving",
  "Events filling",
  "Riders agreed",
];

export function SignalTicker() {
  const row = (hidden: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden}>
      {tickerWords.map((word) => (
        <span key={`${hidden}-${word}`} className="flex items-center">
          <span className="whitespace-nowrap px-5 font-mono text-[0.6875rem] font-black uppercase tracking-[0.22em] text-white/55">{word}</span>
          <span className="h-1 w-1 rounded-full bg-[var(--premium-gold)]/70" aria-hidden="true" />
        </span>
      ))}
    </div>
  );
  return (
    <div className="signal-ticker relative overflow-hidden border-y border-white/10 bg-black/60 py-3" aria-label="What moves through King Sparkon">
      <div className="signal-ticker-track flex w-max">
        {row(false)}
        {row(true)}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black to-transparent" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black to-transparent" aria-hidden="true" />
    </div>
  );
}

const heroStills = [
  {
    imageSrc:
      "https://veizbtzugssszhxabzrv.supabase.co/storage/v1/object/public/king-sparkon-logo/ChatGPT%20Image%20Jun%2029,%202026,%2001_23_49%20PM.png",
    eyebrow: "King Sparkon brand terminal",
    title: "Present King Sparkon Lego",
    alt: "King Sparkon 3D Lego barcode visual",
  },
  {
    imageSrc:
      "https://veizbtzugssszhxabzrv.supabase.co/storage/v1/object/public/king-sparkon-logo/XSX.png",
    eyebrow: "Sizolwakhe Leonard Mthimunye",
    title: "Present King Sparkon",
    alt: "Sizolwakhe Leonard Mthimunye King Sparkon 3D visual",
  },
] as const;

/* Static hero visual — same brand imagery as the terminal, zero 3D and
   zero animation. Status chips are still, honest labels. */
export function HeroStill() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--line-strong)] bg-black shadow-[0_24px_70px_rgba(0,0,0,0.65)]">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5">
        <span className="inline-flex items-center gap-1.5 font-mono text-[0.625rem] font-black uppercase tracking-[0.16em] text-[var(--premium-cyan)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--premium-cyan)]" aria-hidden="true" /> Barcode verified
        </span>
        <span className="inline-flex items-center gap-1.5 font-mono text-[0.625rem] font-black uppercase tracking-[0.16em] text-[var(--premium-gold)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--premium-gold)]" aria-hidden="true" /> QR ticket live
        </span>
      </div>
      <div className="grid gap-px bg-white/10 sm:grid-cols-2">
        {heroStills.map((card) => (
          <figure key={card.title} className="relative bg-[#0a0a14]">
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={card.imageSrc}
                alt={card.alt}
                fill
                sizes="(min-width: 1024px) 480px, 94vw"
                className="object-contain p-4"
              />
            </div>
            <figcaption className="border-t border-white/10 px-4 py-3 text-center">
              <p className="font-mono text-[0.6rem] font-black uppercase tracking-[0.18em] text-[var(--premium-cyan)]">{card.eyebrow}</p>
              <p className="mt-1 text-sm font-black tracking-tight text-white">{card.title}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

export function JourneyStyles() {
  return (
    <style jsx global>{`
      .journey-link {
        position: absolute;
        top: 50%;
        left: 100%;
        width: 0.5rem;
        height: 2px;
        transform: translateY(-50%);
        background: linear-gradient(90deg, var(--signal), var(--premium-gold));
        opacity: 0.55;
        overflow: visible;
        z-index: 1;
      }
      .journey-signal {
        position: absolute;
        top: 50%;
        left: 0;
        width: 5px;
        height: 5px;
        border-radius: 999px;
        background: var(--premium-gold);
        box-shadow: 0 0 10px rgba(250, 204, 21, 0.9);
        transform: translate(-50%, -50%);
        animation: journeySignalTravel 2.6s ease-in-out infinite;
      }
      @keyframes journeySignalTravel {
        0% { left: 0; opacity: 0; }
        25% { opacity: 1; }
        75% { opacity: 1; }
        100% { left: 100%; opacity: 0; }
      }
      .signal-ticker-track { animation: signalTickerSlide 36s linear infinite; }
      @keyframes signalTickerSlide {
        from { transform: translateX(0); }
        to { transform: translateX(-50%); }
      }
      .signal-ticker:hover .signal-ticker-track { animation-play-state: paused; }
      .arrival-grid {
        background-image:
          linear-gradient(rgba(34, 211, 238, 0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(139, 92, 246, 0.06) 1px, transparent 1px);
        background-size: 44px 44px;
        -webkit-mask-image: radial-gradient(ellipse 90% 80% at 50% 20%, black 30%, transparent 75%);
        mask-image: radial-gradient(ellipse 90% 80% at 50% 20%, black 30%, transparent 75%);
      }
      .arrival-beam {
        background: conic-gradient(from 180deg at 50% 0%, transparent 0deg, rgba(34, 211, 238, 0.12) 40deg, transparent 80deg, transparent 180deg, rgba(250, 204, 21, 0.1) 220deg, transparent 260deg);
        filter: blur(10px);
      }
      .display-shine {
        background: linear-gradient(180deg, #ffffff 30%, rgba(255, 255, 255, 0.55) 75%, rgba(34, 211, 238, 0.65) 100%);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
      .activity-row { animation: activityRowGlow 7s ease-in-out infinite; }
      @keyframes activityRowGlow {
        0%, 100% { background: transparent; }
        12% { background: rgba(34, 211, 238, 0.06); }
        24%, 100% { background: transparent; }
      }
      .world-map > div:nth-child(-n+3) { animation: worldNodePulse 6s ease-in-out infinite; }
      .world-map > div:nth-child(2) { animation-delay: -2s; }
      .world-map > div:nth-child(3) { animation-delay: -4s; }
      @keyframes worldNodePulse {
        0%, 100% { border-color: rgba(255, 255, 255, 0.1); }
        50% { border-color: rgba(250, 204, 21, 0.35); }
      }
      @media (prefers-reduced-motion: reduce) {
        .journey-signal, .activity-row, .world-map > div:nth-child(-n+3), .signal-ticker-track { animation: none !important; }
      }
    `}</style>
  );
}
