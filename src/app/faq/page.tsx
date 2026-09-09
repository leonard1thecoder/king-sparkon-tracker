import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { Faq } from "@/components/content/Faq";
import { GlassCard } from "@/components/ui/GlassCard";
import { PremiumHeader } from "@/components/marketing/PremiumHeader";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "FAQ | King Sparkon Tracker — Common Questions Answered",
  description:
    "Answers to common questions about King Sparkon Tracker: founder verification, inventory & barcodes, QR tickets, worker tips, affiliates, billing, dashboards and data privacy.",
  path: "/faq",
});

const faqs = [
  {
    question: "Who built King Sparkon Tracker and is it a real trademark?",
    answer:
      "King Sparkon Tracker™ is the trademark platform of Sizolwakhe Leonard Mthimunye, known as King Sparkon, an Oracle-verified developer. The About page shows the founder card and credential link to Credly. The platform is not a white-label marketplace skin; it has custom business workspaces, scan protocols and audit logs backed by the Spring Boot backend leonard1thecoder/king-sparkon-tracker-backend.",
  },
  {
    question: "What problem does it actually solve?",
    answer:
      "It replaces spreadsheet chaos with one auditable ledger for: barcode inventory (unit-level tracking), QR ticket sales and gate verification, cart checkout and collection, job postings and applications, worker tips and withdrawals, affiliate referrals and promotions, billing and audit-ready reports. Each job maps to a role-safe dashboard.",
  },
  {
    question: "How do barcodes and SELL vs BUY work?",
    answer:
      "SELL requires barcodes.length to equal total quantity — the API enforces it so every sold unit is traceable. BUY must not send barcodes. Stock quantity and barcode count are separate fields; remainingBarcodeSlots = stockQuantity − barcodeCount is computed server-side and shown in the product screens.",
  },
  {
    question: "How do QR tickets and capacity work?",
    answer:
      "Owners create events with ticket classes (quantity, price, sold, checkedIn). Users buy and keep QR tickets in My Tickets. Workers scan at the gate via /dashboard/worker/tickets/scan. The backend marks tickets fulfilled and prevents reuse. Capacity dashboards aggregate tickets, workers, jobs, stock and platform totals.",
  },
  {
    question: "Are payments and fees transparent?",
    answer:
      "Yes. Transactions support CASH, SWIPE_MACHINE and WEBSITE_PAYMENT. Website payments return paymentUrl, paymentStatus and referenceEmail. Tips expose grossAmount, feeAmount and netAmount — never computed in the browser. Withdrawals show gross/fee/net and status before the owner approves. No hidden rounding.",
  },
  {
    question: "What do the plans mean for workers?",
    answer:
      "FREE_TRIAL allows up to 2 workers, PLUS up to 5, PRO is unlimited. Pro unlocks WORKER_TIPS_PLATFORM, BUSINESS_ANALYSIS_AI and WORKER_CLOCKER. The UI respects backend feature locks and shows a coherent upsell rather than a dead button. Billing plans are viewed via /dashboard/owner/billing.",
  },
  {
    question: "Which dashboards do I get?",
    answer:
      "Owner: products, workers, transactions, tips, promotions, reports, audit logs, billing. Worker: scan terminal, barcodes, transactions, tips, claims. Affiliate: referrals, commissions, payouts, assets. User: shop, tickets, jobs, carts. Admin: users, businesses, promotions, scan logs, settings. Each has its own layout and nav component; the proxy guards role access server-side.",
  },
  {
    question: "How is my data handled?",
    answer:
      "Auth tokens are stored as httpOnly cookies via /api/auth/* route handlers; the browser never handles backend secrets. Backend contact handling for WEBSITE_PAYMENT can create a CLIENT subscriber via the API, but CASH/SWIPE_MACHINE flows never subscribe customers. See the Privacy page for the full inquiry, subscriber and cookie policy.",
  },
];

export default function FaqPage() {
  return (
    <>
      <PremiumHeader />
      <main className="bg-white text-[var(--ink)]">
        <div className="mx-auto max-w-7xl px-5 py-6 md:px-8"><Breadcrumbs items={[{ label: "FAQ" }]} /></div>
        <section className="relative overflow-hidden border-y border-[var(--line)]">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--signal-soft)] via-white to-white" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-12">
            <p className="inline-flex rounded-full border border-[var(--signal)]/20 bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]">Answers</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-[-0.05em] md:text-5xl">Questions users actually ask before they register.</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--steel)]">No generic filler. Each answer maps to a real screen, endpoint or policy you can verify. If you need a deeper walkthrough, follow the guide links inside each answer.</p>
          </div>
        </section>
        <div className="mx-auto max-w-4xl px-5 py-10 md:px-8 md:py-12">
          <Faq items={faqs} />
          <GlassCard variant="subtle" className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm font-semibold text-[var(--steel)]">Still unsure which guide fits your job?</p>
            <Link href="/guides" className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-extrabold text-white hover:bg-[var(--signal-strong)]">Browse guides <ArrowRight className="h-4 w-4" /></Link>
          </GlassCard>
        </div>
      </main>
    </>
  );
}
