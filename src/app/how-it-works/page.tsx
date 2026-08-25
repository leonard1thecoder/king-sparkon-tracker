import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Barcode, CheckCircle2, QrCode, ScanLine, UsersRound, Wallet } from "lucide-react";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { GlassCard } from "@/components/ui/GlassCard";
import { PremiumHeader } from "@/components/marketing/PremiumHeader";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "How King Sparkon Tracker Works | Inventory, Tickets, Checkout & Payouts",
  description:
    "A step-by-step explanation of how King Sparkon Tracker handles barcode inventory, QR ticket sales and gate verification, cart checkout, worker scans, tips and affiliate payouts — with role-safe dashboards and audit trails.",
  path: "/how-it-works",
});

const steps = [
  {
    n: "01",
    title: "Owner registers the business",
    icon: UsersRound,
    copy: "Create a Business Owner account. The backend provisions a businessId, business QR and owner workspace. Free trial starts immediately; Plus/Pro billing is confirmed from the dashboard, not the signup form.",
    link: "/register?plan=FREE_TRIAL_BUSINESS&privilege=BUSINESS_OWNER&service=FULL_BUSINESS_SUITE",
    linkLabel: "Register as business owner",
  },
  {
    n: "02",
    title: "Inventory is created with barcodes",
    icon: Barcode,
    copy: "Add products with price, category, stock quantity and optional night-shift pricing. Each unit receives a scanable barcode or unit code. Quantity adjustments are patched and logged; barcodes are appended without overwriting history.",
  },
  {
    n: "03",
    title: "Tickets or carts are opened to buyers",
    icon: QrCode,
    copy: "Events get ticket classes with capacity, or products are exposed in the tuck-shop/cart. Buyers receive QR tickets and purchase QRs. Workers later scan these at collection or gate.",
  },
  {
    n: "04",
    title: "Workers scan, users pay",
    icon: ScanLine,
    copy: "At the terminal, workers scan barcodes for SELL transactions (barcodes must match quantity) or process BUY purchases. Website payments surface paymentUrl, paymentStatus and referenceEmail for the client subscriber record.",
  },
  {
    n: "05",
    title: "Tips, affiliates and payouts are settled",
    icon: Wallet,
    copy: "Worker tips use QR + callbackUrl. Affiliates share referral links and promotion assets. Withdrawals (transactions or tips) show gross, fee, net and status so owners never guess where money is.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <PremiumHeader />
      <main className="bg-white text-[var(--ink)]">
        <div className="mx-auto max-w-7xl px-5 py-6 md:px-8"><Breadcrumbs items={[{ label: "How it works" }]} /></div>

        <section className="relative overflow-hidden border-y border-[var(--line)]">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--signal-soft)] via-white to-sky-50/60" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
            <p className="inline-flex rounded-full border border-[var(--signal)]/20 bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]">Workflow</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-[-0.05em] md:text-5xl">Different roles different worlds, using cutting edge solutions</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--steel)]">No hidden steps. Each role has it&apos;s own dashboard with specific features for specific roles, easy to use in both mobile and Desktop view. The guide below follows the actual data flow</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/guides/barcode-inventory-guide" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-extrabold text-white hover:bg-[var(--signal-strong)]">Inventory guide <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/guides/qr-ticket-operations" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--line-strong)] bg-white px-5 text-sm font-extrabold hover:border-[var(--signal)]">QR tickets guide</Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
          <div className="grid gap-5">
            {steps.map((s) => (
              <GlassCard key={s.n} variant={s.n === "01" ? "highlighted" : "default"} className="grid gap-5 md:grid-cols-[auto_1fr_auto] md:items-center">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm font-black text-[var(--signal-strong)]">{s.n}</span>
                  <div className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--line)] bg-white text-[var(--signal)]"><s.icon className="h-5 w-5" /></div>
                </div>
                <div>
                  <h2 className="text-lg font-black">{s.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--steel)]">{s.copy}</p>
                </div>
                {s.link ? (
                  <Link href={s.link} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-white px-4 text-sm font-extrabold hover:border-[var(--signal)] hover:text-[var(--signal-strong)]">
                    {s.linkLabel} <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : null}
              </GlassCard>
            ))}
          </div>

          <GlassCard variant="strong" className="mt-8 grid gap-6 md:grid-cols-3">
            <div><h3 className="font-black">Role → screen mapping</h3><p className="mt-2 text-sm leading-6 text-[var(--steel)]">Owner: products, tickets, transactions, promotions, billing. Worker: scan, barcodes, claims. Affiliate: referrals, commissions, assets. User: shop, tickets, jobs. Admin: users, businesses, scan-logs.</p></div>
            <div><h3 className="font-black">Why audit matters</h3><p className="mt-2 text-sm leading-6 text-[var(--steel)]">Stock movement, ticket check-ins and tip payouts are persisted and reportable. Reports use GET /api/reports/* and audit logs GET /api/audit-logs — the UI never invents totals.</p></div>
            <div><h3 className="font-black">Payments</h3><p className="mt-2 text-sm leading-6 text-[var(--steel)]">CASH and SWIPE_MACHINE never subscribe the customer. WEBSITE_PAYMENT can create a CLIENT subscriber with paymentContact — handled server-side via the backend proxy.</p></div>
          </GlassCard>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-16 md:px-8">
          <GlassCard variant="elevated" className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-black">Want the full capability list?</h2>
              <p className="mt-1 text-sm leading-6 text-[var(--steel)]">Features are grouped by job-to-be-done, not UI decoration. Each card shows who it serves and what ledger it writes to.</p>
            </div>
            <Link href="/features" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--signal)] bg-[var(--signal)] px-6 text-sm font-extrabold text-white hover:bg-[var(--signal-strong)]">See all features <CheckCircle2 className="h-4 w-4" /></Link>
          </GlassCard>
        </section>
      </main>
    </>
  );
}
