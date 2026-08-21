"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Barcode, CheckCircle2, Crown, QrCode, ScanLine, ShieldCheck, ShoppingCart, Wallet, Megaphone, BriefcaseBusiness, UsersRound } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ScanLoop } from "@/components/hero/ScanLoop";
import { Faq } from "@/components/content/Faq";

const pillars = [
  { icon: ScanLine, title: "Trace every action", copy: "Products, tickets, tips and payouts stay reviewable — no phantom totals." },
  { icon: Crown, title: "One owner workspace", copy: "Stock, events, jobs, workers and reports from a single role-safe place." },
  { icon: Wallet, title: "Transparent money", copy: "Gross, fee and net are shown before any withdrawal is approved." },
];

const capabilities = [
  { icon: Barcode, title: "Barcode inventory", copy: "Unit-level barcodes, remaining slots, night-shift pricing and audit-logged quantity patches.", tags: ["SELL validation", "Audit"], href: "/guides/barcode-inventory-guide" },
  { icon: QrCode, title: "QR tickets & gate scan", copy: "Capacity-aware ticket classes, buyer QR archive and worker gate verification without double-counting.", tags: ["Capacity", "Gate scan"], href: "/guides/qr-ticket-operations" },
  { icon: ShoppingCart, title: "Cart & collection", copy: "Tuck-shop exposure, idempotent checkout, payment status and collection QR.", tags: ["Cart", "Collection QR"], href: "/how-it-works" },
  { icon: BriefcaseBusiness, title: "Jobs & applications", copy: "Publish roles, receive applications with CV URL, and move through SUBMITTED → ACCEPTED.", tags: ["Jobs", "Applications"], href: "/jobs" },
  { icon: Wallet, title: "Worker tips & withdrawals", copy: "Tip QR + callbackUrl, transparent fees, and withdrawal ledgers for tips and transactions.", tags: ["Tips", "Payouts"], href: "/guides/worker-tips-payouts" },
  { icon: Megaphone, title: "Affiliates & promotions", copy: "Referral codes, quote-before-send, audience targeting and commission visibility.", tags: ["Referrals", "Quote"], href: "/guides/affiliate-referrals" },
];

const steps = [
  { n: "01", title: "Owner registers business", copy: "Free trial business with role-safe workspace." },
  { n: "02", title: "Inventory & tickets prepared", copy: "Products with barcodes, events with capacity." },
  { n: "03", title: "Users shop or apply", copy: "Tickets, cart, jobs — all as the correct role." },
  { n: "04", title: "Workers scan at the point of action", copy: "Gate or till — barcodes must match quantity." },
  { n: "05", title: "Money and audit are settled", copy: "Gross/fee/net visible before withdrawal." },
];

const faqs = [
  { question: "Is King Sparkon Tracker a real trademark platform or a template?", answer: "It is the trademark platform of Sizolwakhe Leonard Mthimunye (King Sparkon), Oracle-verified via Credly. The codebase contains custom role workspaces, scan protocols and audit trails backed by a Spring Boot backend — not a cloned marketplace skin." },
  { question: "Why does SELL require barcodes to match quantity?", answer: "To prevent untraceable sales. The API enforces barcodes.length === total quantity. One missing barcode fails the checkout — deliberately — so every unit sold has a ledger entry." },
  { question: "Can I use it without taking website payments?", answer: "Yes. CASH and SWIPE_MACHINE flows work without paymentUrl and never subscribe the customer. WEBSITE_PAYMENT is optional and surfaces paymentUrl, status and referenceEmail when the backend returns them." },
  { question: "What do Free Trial, Plus and Pro limit?", answer: "Free Trial max 2 workers, Plus max 5, Pro unlimited. Pro unlocks worker tips platform, business analysis AI and worker clocker. Limits and locks are enforced server-side; the UI only reflects them." },
];

export function PremiumLanding() {
  return (
    <main className="bg-white text-[var(--ink)]">
      {/* Hero - glass */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--signal-soft)] via-white to-sky-50" aria-hidden="true" />
        <div className="absolute -top-32 -right-32 h-[32rem] w-[32rem] rounded-full bg-sky-200/25 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-[var(--signal)]/5 blur-3xl" aria-hidden="true" />

        <div className="relative mx-auto grid max-w-7xl gap-8 px-5 pb-10 pt-8 md:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pb-16 lg:pt-10">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[var(--signal)]/20 bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]">
              <span className="h-2 w-2 rounded-full bg-[var(--signal)]" aria-hidden="true" /> Operations without spreadsheet chaos
            </p>
            <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.94] tracking-[-0.06em] md:text-[3.75rem] lg:text-[4.25rem]">
              Scan it. Sell it. <span className="bg-gradient-to-br from-[var(--signal)] to-[var(--signal-strong)] bg-clip-text text-transparent">Track it. Prove it.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-7 text-[var(--steel)]">
              King Sparkon Tracker connects inventory, tickets, carts, jobs, worker tips and affiliates through role-safe dashboards — each one showing only what that role needs, and every action leaving an audit trail.
            </p>

            <GlassCard variant="subtle" className="mt-6 flex items-center gap-4">
              <Image
                src="https://veizbtzugssszhxabzrv.supabase.co/storage/v1/object/public/king-sparkon-logo/ChatGPT%20Image%20Jul%202,%202026,%2001_29_39%20AM.png"
                alt="Oracle University verification badge for Sizolwakhe Leonard Mthimunye"
                width={56}
                height={56}
                unoptimized
                className="h-14 w-14 shrink-0 rounded-xl border border-[var(--line)] bg-white p-1 object-contain"
              />
              <div>
                <p className="text-sm font-black leading-tight">Built by Sizolwakhe Leonard Mthimunye</p>
                <p className="text-xs leading-5 text-[var(--steel)]">Founder known as King Sparkon • Oracle University verified</p>
                <a href="https://www.credly.com/badges/b324470a-4b81-4f2f-8d6c-141fc17a5287/linked_in_profile" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-extrabold text-[var(--signal-strong)] hover:text-[var(--accent-hover)]">
                  <BadgeCheck className="h-3.5 w-3.5" /> Verify credential
                </a>
              </div>
            </GlassCard>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/register?plan=FREE_TRIAL_BUSINESS&privilege=BUSINESS_OWNER&service=FULL_BUSINESS_SUITE" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[var(--signal)] bg-[var(--signal)] px-6 text-sm font-extrabold text-white shadow-[0_12px_24px_rgba(14,165,233,0.22)] hover:bg-[var(--signal-strong)]">
                Create business account <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/how-it-works" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--line-strong)] bg-white px-6 text-sm font-extrabold hover:border-[var(--signal)] hover:text-[var(--signal-strong)]">
                How it works
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold text-[var(--muted)]">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-[var(--signal)]" /> No spreadsheet</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-[var(--signal)]" /> Role-safe</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-[var(--signal)]" /> Audit-ready</span>
            </div>
          </div>

          <div className="min-w-0 lg:justify-self-end">
            <ScanLoop />
            {/* Small floating metric */}
            <GlassCard variant="elevated" className="mt-4 flex items-center justify-between">
              <div>
                <p className="font-mono text-xs font-black uppercase tracking-[0.14em] text-[var(--muted)]">Platform ledger</p>
                <p className="mt-1 text-sm font-black">Barcodes • Tickets • Tips • Payouts</p>
              </div>
              <span className="rounded-full border border-[var(--signal)]/20 bg-[var(--signal-soft)] px-3 py-1 text-xs font-extrabold text-[var(--signal-strong)]">Traceable</span>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
        <div className="grid gap-5 md:grid-cols-3">
          {pillars.map((p) => (
            <GlassCard key={p.title} className="flex gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[var(--line)] bg-white text-[var(--signal)]">
                <p.icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-black">{p.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--steel)]">{p.copy}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Capabilities - glass */}
      <section className="relative overflow-hidden border-y border-[var(--line)] bg-[var(--signal-soft)]/30">
        <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
          <div className="max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]">Capabilities</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] md:text-4xl">Built around the work, not the decoration.</h2>
            <p className="mt-3 text-base leading-7 text-[var(--steel)]">Each capability maps to a role and to an endpoint you can verify. No fake charts — only the totals the backend actually returns.</p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {capabilities.map((c) => (
              <GlassCard key={c.title} variant="default" className="group flex flex-col">
                <div className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--line)] bg-white text-[var(--signal)]">
                  <c.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-black">{c.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-[var(--steel)]">{c.copy}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {c.tags.map((t) => (
                    <span key={t} className="rounded-full border border-[var(--line)] bg-white px-2.5 py-1 text-xs font-bold text-[var(--steel)]">{t}</span>
                  ))}
                </div>
                <Link href={c.href} className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-[var(--signal-strong)] group-hover:text-[var(--accent-hover)]">
                  Learn more <ArrowRight className="h-4 w-4" />
                </Link>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* How it works timeline */}
      <section className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]">Workflow</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] md:text-4xl">Five steps from registration to proof.</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--steel)]">Follow the ledger: each step writes a record you can audit later. No hidden middleware.</p>
            <Link href="/how-it-works" className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-extrabold text-white hover:bg-[var(--signal-strong)]">
              See full workflow <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4">
            {steps.map((s) => (
              <GlassCard key={s.n} className="flex gap-4">
                <span className="font-mono text-sm font-black text-[var(--signal-strong)]">{s.n}</span>
                <div>
                  <h3 className="font-black">{s.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--steel)]">{s.copy}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Role section glass */}
      <section className="relative overflow-hidden border-y border-[var(--line)]">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-white" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]">Roles</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] md:text-4xl">See only what your role needs.</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[var(--steel)]">The proxy guards every dashboard server-side. No role can open another&apos;s workspace by changing the URL.</p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[
              { icon: UsersRound, title: "User", price: "Free", href: "/register?plan=FREE_USER&privilege=USER&service=FREE_USER_ACCESS", copy: "Buy tickets, apply for jobs, keep purchase QR." },
              { icon: Megaphone, title: "Affiliate", price: "Free", href: "/register?plan=FREE_AFFILIATE&privilege=AFFILIATE&service=FREE_AFFILIATE_ACCESS", copy: "Referral code, campaign assets, commission ledger." },
              { icon: Crown, title: "Business Owner", price: "Free trial", href: "/register?plan=FREE_TRIAL_BUSINESS&privilege=BUSINESS_OWNER&service=FULL_BUSINESS_SUITE", copy: "Products, workers, tickets, tips, billing, reports." },
              { icon: ShieldCheck, title: "Worker", price: "By owner", href: "/login", copy: "Scan barcodes, verify tickets, process sales, review tips." },
            ].map((r) => (
              <GlassCard key={r.title} variant="interactive" className="flex flex-col p-0! overflow-hidden">
                <Link href={r.href} className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--line)] bg-white text-[var(--signal)]"><r.icon className="h-5 w-5" /></div>
                    <span className="rounded-full border border-[var(--line)] bg-[var(--signal-soft)] px-2.5 py-1 text-xs font-extrabold text-[var(--signal-strong)]">{r.price}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-black">{r.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--steel)]">{r.copy}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-[var(--signal-strong)]">Open path <ArrowRight className="h-4 w-4" /></span>
                </Link>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Trust + FAQ */}
      <section className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]">Trust</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">Production discipline, not promises.</h2>
            <div className="mt-6 grid gap-4">
              {[
                ["Evidence over decoration", "Real data in every card, never fabricated totals."],
                ["Testable changes", "Routes, types and API contracts are type-checked before deploy."],
                ["Guarded money", "Fees and withdrawals are server-computed and status-driven."],
              ].map(([t, c]) => (
                <GlassCard key={t} variant="subtle" className="flex gap-3">
                  <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--signal)]" />
                  <div><p className="text-sm font-black">{t}</p><p className="mt-1 text-sm leading-6 text-[var(--steel)]">{c}</p></div>
                </GlassCard>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/about" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--line)] bg-white px-5 text-sm font-extrabold hover:border-[var(--signal)]">About the founder</Link>
              <Link href="/features" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--line)] bg-white px-5 text-sm font-extrabold hover:border-[var(--signal)]">All features</Link>
            </div>
          </div>
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black">Common questions</h2>
              <Link href="/faq" className="text-sm font-extrabold text-[var(--signal-strong)] hover:text-[var(--accent-hover)]">View all →</Link>
            </div>
            <Faq items={faqs} jsonLd={false} />
          </div>
        </div>
      </section>

      {/* Final CTA - glass */}
      <section className="relative overflow-hidden border-t border-[var(--line)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--signal)] via-sky-500 to-sky-600" aria-hidden="true" />
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
          <GlassCard variant="strong" className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-black tracking-[-0.04em]">Ready to run an auditable operation?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[var(--steel)]">Start free as User, Affiliate or Business Owner. The guidance, fields and privilege update instantly for the role you choose — no separate portals to hunt down.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/register?plan=FREE_TRIAL_BUSINESS&privilege=BUSINESS_OWNER&service=FULL_BUSINESS_SUITE" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--signal)] bg-[var(--signal)] px-6 text-sm font-extrabold text-white hover:bg-[var(--signal-strong)]">Create business account <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/contact" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--line-strong)] bg-white px-6 text-sm font-extrabold hover:border-[var(--signal)]">Talk to us</Link>
            </div>
          </GlassCard>
        </div>
      </section>
    </main>
  );
}
