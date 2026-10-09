import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Building2, ScanLine, ShieldCheck, UsersRound } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicBreadcrumb } from "@/components/public/Breadcrumb";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About King Sparkon | Founder, Purpose & Platform Principles",
  description:
    "Learn who built King Sparkon, why it exists, and how Sizolwakhe Leonard Mthimunye — Oracle-verified developer and founder known as King Sparkon — designed a barcode, QR ticket and role-safe operations platform for South African businesses.",
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

const iconBox = "grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[var(--ks-line)] bg-[var(--ks-white)] text-[var(--ks-ink)]";

export default function AboutPage() {
  return (
    <>
      <PublicHeader />
      <main className="ks-public">
        <PublicBreadcrumb items={[{ label: "Home", href: "/" }, { label: "About" }]} />

        <section className="ks-section pt-4">
          <div className="ks-wrap grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <div>
              <p className="ks-eyebrow">About the platform</p>
              <h1 className="ks-h1 mt-3">A South African operations platform built for verifiable work.</h1>
              <p className="ks-lead mt-5">
                King Sparkon™ is the trademark platform of <strong className="font-extrabold text-[var(--ks-ink)]">Sizolwakhe Leonard Mthimunye</strong>, known as King Sparkon. It was created to replace spreadsheet chaos with a single auditable record for barcode inventory, QR tickets, cart checkout, jobs, affiliate referrals, worker tips and payouts.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/how-it-works" className="ks-btn ks-btn-primary">
                  How it works <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/contact" className="ks-btn ks-btn-secondary">
                  Contact the team
                </Link>
              </div>
            </div>

            <div className="ks-card p-6 md:p-8">
              <div className="flex items-center gap-4">
                <Image src="/king-sparkon-logo.svg" alt="King Sparkon logo" width={250} height={110} className="h-auto w-[140px] shrink-0 object-contain" />
                <div>
                  <p className="text-sm font-black text-[var(--ks-ink)]">Sizolwakhe Leonard Mthimunye</p>
                  <p className="text-xs font-semibold text-[var(--ks-muted)]">Founder • King Sparkon • Oracle Verified</p>
                  <a
                    href="https://www.credly.com/badges/b324470a-4b81-4f2f-8d6c-141fc17a5287/linked_in_profile"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-xs font-extrabold text-[var(--ks-ink)] hover:underline"
                  >
                    <BadgeCheck className="h-3.5 w-3.5" /> Verify Oracle credential
                  </a>
                </div>
              </div>
              <p className="mt-5 text-sm leading-6 text-[var(--ks-muted)]">
                The platform is designed around real retail and event operations: physical barcodes on stock units, QR codes at the gate, workers scanning at the till, and owners reviewing transactions before closing.
              </p>
              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-[var(--ks-line)] pt-5">
                <div className="text-center"><p className="text-xs font-black text-[var(--ks-ink)]">Founder-led</p><p className="mt-1 text-xs leading-4 text-[var(--ks-muted)]">Single accountable author</p></div>
                <div className="text-center"><p className="text-xs font-black text-[var(--ks-ink)]">Audit-ready</p><p className="mt-1 text-xs leading-4 text-[var(--ks-muted)]">Every action recorded</p></div>
                <div className="text-center"><p className="text-xs font-black text-[var(--ks-ink)]">SA-ready</p><p className="mt-1 text-xs leading-4 text-[var(--ks-muted)]">ZAR, ZA addresses</p></div>
              </div>
            </div>
          </div>
        </section>

        <section className="ks-section pt-0">
          <div className="ks-wrap grid gap-6 md:grid-cols-3">
            <div className="ks-card flex gap-4 p-6">
              <div className={iconBox}><Building2 className="h-5 w-5" /></div>
              <div><h2 className="font-black text-[var(--ks-ink)]">Trademark, not a marketplace clone</h2><p className="mt-2 text-sm leading-6 text-[var(--ks-muted)]">King Sparkon is not a reseller skin. It is a custom commerce + operations platform with its own business workspaces, scan protocols and audit logs.</p></div>
            </div>
            <div className="ks-card flex gap-4 p-6">
              <div className={iconBox}><ShieldCheck className="h-5 w-5" /></div>
              <div><h2 className="font-black text-[var(--ks-ink)]">Built for trust & POPIA compliance</h2><p className="mt-2 text-sm leading-6 text-[var(--ks-muted)]">From login to UIF status checks, sensitive user data is handled under South Africa&apos;s POPIA principles. Personal identifiers are encrypted and never abused.</p></div>
            </div>
            <div className="ks-card flex gap-4 p-6">
              <div className={iconBox}><UsersRound className="h-5 w-5" /></div>
              <div><h2 className="font-black text-[var(--ks-ink)]">People first & public services</h2><p className="mt-2 text-sm leading-6 text-[var(--ks-muted)]">Users buy tickets, workers scan, affiliates earn, and users access government UIF services like status checks and password updates seamlessly.</p></div>
            </div>
          </div>
        </section>

        <section className="ks-section pt-0">
          <div className="ks-wrap">
            <div className="ks-card grid gap-6 p-6 md:grid-cols-2 md:p-8">
              <div>
                <p className="ks-eyebrow">Public service integration</p>
                <h2 className="mt-2 text-2xl font-black text-[var(--ks-ink)]">How We Use the UIF System</h2>
                <p className="mt-3 text-sm leading-6 text-[var(--ks-muted)]">
                  Our platform provides direct user dashboard access to South Africa&apos;s UIF Online System services. Citizens can check benefit claims via <Link href="/dashboard/user/uif/status" className="font-bold text-[var(--ks-ink)] hover:underline">/dashboard/user/uif/status</Link> and request secure UIF Online password updates via <Link href="/dashboard/user/uif/password" className="font-bold text-[var(--ks-ink)] hover:underline">/dashboard/user/uif/password</Link>.
                </p>
              </div>
              <div className="rounded-xl border border-[var(--ks-line)] bg-[var(--ks-white)] p-5">
                <h3 className="text-sm font-black text-[var(--ks-ink)]">POPIA Protection Safeguards</h3>
                <p className="mt-2 text-xs leading-5 text-[var(--ks-muted)]">
                  To guarantee the Protection of Personal Information Act (POPIA) is never abused, 13-digit SA ID numbers are validated strictly on demand. Identifiers are never cached, sold to third parties, or harvested for marketing.
                </p>
                <div className="mt-4 flex flex-wrap gap-3 text-xs font-bold">
                  <Link href="/privacy" className="text-[var(--ks-ink)] hover:underline">POPIA Policy →</Link>
                  <Link href="/features" className="text-[var(--ks-ink)] hover:underline">UIF System Specs →</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="ks-section pt-0">
          <div className="ks-wrap grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="ks-eyebrow">How we build</p>
              <h2 className="ks-h2 mt-3">Principles you can verify in the product.</h2>
              <p className="ks-lead mt-4">No slogans without a corresponding screen, permission or log.</p>
            </div>
            <div className="grid gap-4">
              {principles.map((p, i) => (
                <div key={p.title} className="ks-card flex gap-4 p-6">
                  <span className="text-sm font-black text-[var(--ks-ink)]">0{i + 1}</span>
                  <div><h3 className="font-black text-[var(--ks-ink)]">{p.title}</h3><p className="mt-2 text-sm leading-6 text-[var(--ks-muted)]">{p.copy}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="ks-section pt-0 pb-24">
          <div className="ks-wrap">
            <div className="ks-card flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
              <div className="max-w-2xl">
                <h2 className="text-2xl font-black tracking-[-0.03em] text-[var(--ks-ink)]">What King Sparkon means in practice</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--ks-muted)]">
                  Scan inventory in the morning, sell tickets at noon, review worker transactions at night — all from the same auditable ledger. Owners keep business identity, location and compliance data in one place. Workers keep QR procedures. Affiliates keep referral assets. Everything is traceable.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                  <span className="rounded-full border border-[var(--ks-line)] bg-[var(--ks-white)] px-3 py-1 text-[var(--ks-ink)]">Barcode inventory</span>
                  <span className="rounded-full border border-[var(--ks-line)] bg-[var(--ks-white)] px-3 py-1 text-[var(--ks-ink)]">QR tickets</span>
                  <span className="rounded-full border border-[var(--ks-line)] bg-[var(--ks-white)] px-3 py-1 text-[var(--ks-ink)]">Worker tips</span>
                  <span className="rounded-full border border-[var(--ks-line)] bg-[var(--ks-white)] px-3 py-1 text-[var(--ks-ink)]">Audit trails</span>
                </div>
              </div>
              <Link href="/features" className="ks-btn ks-btn-primary shrink-0">
                Explore features <ScanLine className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
