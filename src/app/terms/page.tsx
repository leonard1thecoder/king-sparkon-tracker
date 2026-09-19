import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { Prose } from "@/components/content/Prose";
import { GlassCard } from "@/components/ui/GlassCard";
import { PremiumHeader } from "@/components/marketing/PremiumHeader";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service | King Sparkon",
  description: "Terms of service for King Sparkon: eligibility, accounts, acceptable use, inventory & ticket accuracy, fees, and liability limits.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <PremiumHeader />
      <main className="bg-white text-[var(--ink)]">
        <div className="mx-auto max-w-7xl px-5 py-6 md:px-8"><Breadcrumbs items={[{ label: "Terms of service" }]} /></div>
        <section className="relative overflow-hidden border-y border-[var(--line)]">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface)] via-[var(--signal-soft)] to-[var(--surface)]" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-12">
            <p className="inline-flex rounded-full border border-[var(--signal)]/20 bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]">Legal</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-[-0.05em] md:text-5xl">Terms of service</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--steel)]">Last updated: 12 February 2026 • By registering or using King Sparkon™ you agree to these terms as offered by Sizolwakhe Leonard Mthimunye.</p>
          </div>
        </section>

        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:px-8 lg:grid-cols-[1.7fr_0.8fr]">
          <Prose>
            <h2>1. Eligibility & accounts</h2>
            <p>You must be able to form a binding contract and provide accurate registration information. Business Owner accounts must provide a valid business name and business address. Affiliate accounts require a valid physical address and PayPal link. You are responsible for the confidentiality of your username and password and for all activity under your account.</p>
            <h2>2. Role-safe use</h2>
            <p>Access is role-gated. Owners manage products, tickets, workers, promotions and billing; workers scan and process sales; affiliates manage referrals and campaigns; users shop and apply for jobs; admins manage platform configuration. Attempting to bypass role guards via the API or proxy is prohibited.</p>
            <h2>3. Inventory & ticket accuracy</h2>
            <p>You are responsible for the accuracy of product data, stock quantities, barcodes/unit codes, prices, and ticket capacities you publish. The platform enforces SELL barcode-count validation and preserves audit history, but does not independently verify physical stock counts or event venue compliance. Test one SELL and one BUY before live operation.</p>
            <h2>4. Payments, tips & fees</h2>
            <p>Website payments, tip payments and withdrawals are processed through the configured backend and payment providers. Fees are shown as feeAmount alongside grossAmount and netAmount. By initiating a transaction or payout you authorize the displayed fee. Plan limits (FREE_TRIAL max 2 workers, PLUS max 5, PRO unlimited) and Pro feature locks (WORKER_TIPS_PLATFORM, BUSINESS_ANALYSIS_AI, WORKER_CLOCKER) are enforced server-side.</p>
            <h2>5. Promotions & affiliate honesty</h2>
            <p>Promotions require a truthful title, message and landingUrl, and must respect the audience and channel you select. Affiliates must not misrepresent earnings, fabricate endorsements, or spam contacts. Target counts and bulk pricing are shown via GET /api/promotions/quote before any send.</p>
            <h2>6. Acceptable use</h2>
            <p>Do not upload unlawful content, infringe trademarks or copyrights, attempt to intercept scan data, probe the backend proxy, scrape private dashboards, or submit automated registrations that evade rate limits. Rate-limit responses include retryAfterSeconds or Retry-After headers — respect the cooldown.</p>
            <h2>7. Intellectual property</h2>
            <p>King Sparkon™ and related logos are trademarks of the founder. Your business names, product images and ticket creatives remain yours. You grant a limited license to host and display them to operate the platform. The underlying software, 3D visuals and ledger logic remain the property of the platform.</p>
            <h2>8. Disclaimer & limits</h2>
            <p>The platform is provided on an &quot;as is&quot; basis. We do not warrant uninterrupted camera scanning on all devices, carrier delivery of portal messages, or venue acceptance of QR codes. To the fullest extent permitted by law, liability is limited to the fees paid for the service in the 3 months prior to the claim. Nothing limits liability where law prohibits.</p>
            <h2>9. Changes</h2>
            <p>We may update these terms and the platform&apos;s capability set. Material changes will be indicated by an updated date on this page and, where appropriate, an in-app notice.</p>
            <h2>10. Contact</h2>
            <p>Questions about these terms: use the <Link href="/contact">contact page</Link> and include your account email. This is not a law-firm template; it describes the actual roles, endpoints and fee mechanics in the codebase.</p>
          </Prose>
          <div className="space-y-5">
            <GlassCard variant="subtle">
              <p className="text-sm font-black">No fake statistics</p>
              <p className="mt-2 text-sm leading-6 text-[var(--steel)]">We do not publish invented user counts, revenue figures, certifications or partnerships. Capabilities, limits and fees are stated exactly as the backend enforces them.</p>
            </GlassCard>
            <GlassCard>
              <p className="text-sm font-black">Related</p>
              <ul className="mt-3 space-y-2 text-sm font-semibold">
                <li><Link href="/privacy" className="text-[var(--signal-strong)] hover:text-[var(--accent-hover)]">Privacy policy →</Link></li>
                <li><Link href="/how-it-works" className="text-[var(--signal-strong)] hover:text-[var(--accent-hover)]">How it works →</Link></li>
              </ul>
            </GlassCard>
          </div>
        </div>
      </main>
    </>
  );
}
