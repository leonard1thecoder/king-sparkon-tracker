import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Building2, ScanLine, ShieldCheck, UsersRound } from "lucide-react";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { GlassCard } from "@/components/ui/GlassCard";
import { PremiumHeader } from "@/components/marketing/PremiumHeader";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About King Sparkon Tracker | Founder, Purpose & Platform Principles",
  description:
    "Learn who built King Sparkon Tracker, why it exists, and how Sizolwakhe Leonard Mthimunye — Oracle-verified developer and founder known as King Sparkon — designed a barcode, QR ticket and role-safe operations platform for South African businesses.",
  path: "/about",
  keywords: ["about King Sparkon", "Sizolwakhe Leonard Mthimunye", "King Sparkon founder", "barcode platform South Africa"],
});

const principles = [
  {
    title: "Evidence over decoration",
    copy: "Every scan, payment, tip and audit event leaves a reviewable record. The UI shows real backend data, not fabricated metrics.",
  },
  {
    title: "Role-safe by default",
    copy: "Owners, workers, affiliates, users and admins see only the tools their responsibility requires. No overlapping powers, no guessing.",
  },
  {
    title: "Production discipline",
    copy: "Continuous integration, QA, manual review and cloud maintenance keep barcode and QR flows reliable even during growth.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PremiumHeader />
      <main className="bg-white text-[var(--ink)]">
        <div className="mx-auto max-w-7xl px-5 py-6 md:px-8">
          <Breadcrumbs items={[{ label: "About" }]} />
        </div>

        <section className="relative overflow-hidden border-y border-[var(--line)]">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--signal-soft)] via-[var(--surface)] to-[var(--surface)]" aria-hidden="true" />
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-sky-100/40 blur-3xl" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-7xl gap-8 px-5 py-10 md:px-8 md:py-14 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="inline-flex rounded-full border border-[var(--signal)]/20 bg-[var(--signal-soft)] px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]">About the platform</p>
              <h1 className="mt-4 text-4xl font-black tracking-[-0.05em] md:text-5xl">A South African operations platform built for verifiable work.</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--steel)] md:text-lg md:leading-8">
                King Sparkon Tracker™ is the trademark platform of <strong className="font-extrabold text-[var(--ink)]">Sizolwakhe Leonard Mthimunye</strong>, known as King Sparkon. It was created to replace spreadsheet chaos with a single auditable record for barcode inventory, QR tickets, cart checkout, jobs, affiliate referrals, worker tips and payouts.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/how-it-works" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-extrabold text-white hover:bg-[var(--signal-strong)]">
                  How it works <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/contact" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--line-strong)] bg-white px-5 text-sm font-extrabold hover:border-[var(--signal)]">
                  Contact the team
                </Link>
              </div>
            </div>
            <GlassCard variant="elevated" className="relative">
              <div className="flex items-center gap-4">
                <Image src="/king-sparkon-logo.png" alt="King Sparkon Tracker logo" width={64} height={64} className="rounded-xl border border-[var(--line)] bg-white p-1.5" />
                <div>
                  <p className="text-sm font-black">Sizolwakhe Leonard Mthimunye</p>
                  <p className="text-xs font-semibold text-[var(--steel)]">Founder • King Sparkon • Oracle Verified</p>
                  <a href="https://www.credly.com/badges/b324470a-4b81-4f2f-8d6c-141fc17a5287/linked_in_profile" target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-extrabold text-[var(--signal-strong)] hover:text-[var(--accent-hover)]">
                    <BadgeCheck className="h-3.5 w-3.5" /> Verify Oracle credential
                  </a>
                </div>
              </div>
              <p className="mt-5 text-sm leading-6 text-[var(--steel)]">
                The platform is designed around real retail and event operations: physical barcodes on stock units, QR codes at the gate, workers scanning at the till, and owners reviewing transactions before closing.
              </p>
              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-[var(--line)] pt-5">
                <div className="text-center"><p className="font-mono text-xs font-black text-[var(--signal-strong)]">Founder-led</p><p className="mt-1 text-xs leading-4 text-[var(--muted)]">Single accountable author</p></div>
                <div className="text-center"><p className="font-mono text-xs font-black text-[var(--signal-strong)]">Audit-ready</p><p className="mt-1 text-xs leading-4 text-[var(--muted)]">Every action recorded</p></div>
                <div className="text-center"><p className="font-mono text-xs font-black text-[var(--signal-strong)]">SA-ready</p><p className="mt-1 text-xs leading-4 text-[var(--muted)]">ZAR, ZA addresses</p></div>
              </div>
            </GlassCard>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
          <div className="grid gap-6 md:grid-cols-3">
            <GlassCard variant="subtle" className="flex gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[var(--line)] bg-white text-[var(--signal)]"><Building2 className="h-5 w-5" /></div>
              <div><h2 className="font-black">Trademark, not a marketplace clone</h2><p className="mt-2 text-sm leading-6 text-[var(--steel)]">King Sparkon Tracker is not a reseller skin. It is a custom commerce + operations platform with its own business workspaces, scan protocols and audit logs.</p></div>
            </GlassCard>
            <GlassCard variant="subtle" className="flex gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[var(--line)] bg-white text-[var(--signal)]"><ShieldCheck className="h-5 w-5" /></div>
              <div><h2 className="font-black">Built for trust & POPIA compliance</h2><p className="mt-2 text-sm leading-6 text-[var(--steel)]">From login to UIF status checks, sensitive user data is handled under South Africa&apos;s POPIA principles. Personal identifiers are encrypted and never abused.</p></div>
            </GlassCard>
            <GlassCard variant="subtle" className="flex gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[var(--line)] bg-white text-[var(--signal)]"><UsersRound className="h-5 w-5" /></div>
              <div><h2 className="font-black">People first & public services</h2><p className="mt-2 text-sm leading-6 text-[var(--steel)]">Users buy tickets, workers scan, affiliates earn, and users access government UIF services like status checks and password updates seamlessly.</p></div>
            </GlassCard>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-12 md:px-8">
          <GlassCard variant="highlighted" className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]">Public Service Integration</p>
              <h2 className="mt-2 text-2xl font-black">How We Use the UIF System</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--steel)]">
                Our platform provides direct user dashboard access to South Africa&apos;s UIF Online System services. Citizens can check benefit claims via <Link href="/dashboard/user/uif/status" className="font-bold text-[var(--signal-strong)] hover:underline">/dashboard/user/uif/status</Link> and request secure UIF Online password updates via <Link href="/dashboard/user/uif/password" className="font-bold text-[var(--signal-strong)] hover:underline">/dashboard/user/uif/password</Link>.
              </p>
            </div>
            <div className="rounded-xl border border-[var(--line)] bg-white p-5">
              <h3 className="font-black text-sm text-[var(--ink)]">POPIA Protection Safeguards</h3>
              <p className="mt-2 text-xs leading-5 text-[var(--steel)]">
                To guarantee the Protection of Personal Information Act (POPIA) is never abused, 13-digit SA ID numbers are validated strictly on demand. Identifiers are never cached, sold to third parties, or harvested for marketing.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                <Link href="/privacy" className="text-[var(--signal-strong)] hover:underline">POPIA Policy →</Link>
                <Link href="/features" className="text-[var(--signal-strong)] hover:underline">UIF System Specs →</Link>
              </div>
            </div>
          </GlassCard>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-12 md:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]">How we build</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] md:text-4xl">Principles you can verify in the product.</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--steel)]">No slogans without a corresponding screen, permission or log.</p>
            </div>
            <div className="grid gap-4">
              {principles.map((p, i) => (
                <GlassCard key={p.title} className="flex gap-4">
                  <span className="font-mono text-sm font-black text-[var(--signal-strong)]">0{i + 1}</span>
                  <div><h3 className="font-black">{p.title}</h3><p className="mt-2 text-sm leading-6 text-[var(--steel)]">{p.copy}</p></div>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-16 md:px-8">
          <GlassCard variant="highlighted" className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-black tracking-[-0.03em]">What King Sparkon means in practice</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--steel)]">
                Scan inventory in the morning, sell tickets at noon, review worker transactions at night — all from the same auditable ledger. Owners keep business identity, location and compliance data in one place. Workers keep QR procedures. Affiliates keep referral assets. Everything is traceable.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                <span className="rounded-full border border-[var(--line)] bg-white px-3 py-1">Barcode inventory</span>
                <span className="rounded-full border border-[var(--line)] bg-white px-3 py-1">QR tickets</span>
                <span className="rounded-full border border-[var(--line)] bg-white px-3 py-1">Worker tips</span>
                <span className="rounded-full border border-[var(--line)] bg-white px-3 py-1">Audit trails</span>
              </div>
            </div>
            <Link href="/features" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-[var(--signal)] bg-[var(--signal)] px-6 text-sm font-extrabold text-white hover:bg-[var(--signal-strong)]">
              Explore features <ScanLine className="h-4 w-4" />
            </Link>
          </GlassCard>
        </section>
      </main>
    </>
  );
}
