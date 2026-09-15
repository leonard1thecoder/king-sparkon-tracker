import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Barcode, CheckCircle2, AlertTriangle } from "lucide-react";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { GlassCard } from "@/components/ui/GlassCard";
import { Prose } from "@/components/content/Prose";
import { PremiumHeader } from "@/components/marketing/PremiumHeader";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Barcode Inventory Guide | Products, Unit Codes & Stock Audits",
  description:
    "Learn how to create products, assign barcodes or unit codes, manage stock quantity and remaining slots, and use night-shift pricing in King Sparkon Tracker — with troubleshooting for common scan errors.",
  path: "/guides/barcode-inventory-guide",
});

export default function BarcodeGuide() {
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Barcode Inventory Guide",
    author: { "@type": "Person", name: "Sizolwakhe Leonard Mthimunye" },
    publisher: { "@type": "Organization", name: "King Sparkon Tracker", logo: { "@type": "ImageObject", url: "https://king-sparkon-tracker.com/king-sparkon-logo.png" } },
    datePublished: "2026-01-01",
    dateModified: new Date().toISOString().slice(0, 10),
    mainEntityOfPage: "https://king-sparkon-tracker.com/guides/barcode-inventory-guide",
  };
  return (
    <>
      <PremiumHeader />
      <main className="bg-white text-[var(--ink)]">
        <div className="mx-auto max-w-7xl px-5 py-6 md:px-8"><Breadcrumbs items={[{ label: "Guides", href: "/guides" }, { label: "Barcode inventory" }]} /></div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
        <section className="relative overflow-hidden border-y border-[var(--line)]">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--signal-soft)] via-[var(--surface)] to-[var(--surface)]" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-12">
            <p className="inline-flex rounded-full border border-[var(--signal)]/20 bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]"><Barcode className="mr-1.5 inline h-3.5 w-3.5" /> Guide</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-[-0.05em] md:text-5xl">Barcode inventory that survives the real stockroom.</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--steel)]">From product creation to quantity patch and barcode append — what each screen writes, why remaining slots matter, and what to do when a scan fails. Written for Owners and Workers using <code className="rounded bg-[var(--signal-soft)] px-1.5 py-0.5 font-mono text-sm">/dashboard/owner/products</code> and <code className="rounded bg-[var(--signal-soft)] px-1.5 py-0.5 font-mono text-sm">/dashboard/worker/products</code>.</p>
          </div>
        </section>

        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:px-8 lg:grid-cols-[1.65fr_0.85fr]">
          <Prose>
            <h2>When to use this guide</h2>
            <p>Use it when you set up a new business, receive new stock, or need to explain to workers why a SELL fails. It answers: what is a product barcode vs a unit code, how does quantity differ from barcode count, and why night-shift pricing exists.</p>

            <h2>Step 1 — Create the product correctly</h2>
            <p>Owners create products from <em>Products → New Product</em>. Required fields: name, category (Alcohol / NonAlcohol or custom), price, stockQuantity. Optional: returnableEnabled/Price, nightShiftEnabled/Price and window. The backend returns a product with <code>remainingBarcodeSlots = stockQuantity − barcodeCount</code>.</p>
            <ul>
              <li>Choose a clear name: &quot;Castle Lager 500ml&quot; not &quot;Beer&quot;.</li>
              <li>Set price to the day price. Use nightShiftPrice only if the business charges differently after hours.</li>
              <li>Leave productImageUrl empty if you have no photo — the UI shows a fallback rather than a broken image.</li>
            </ul>

            <h2>Step 2 — Assign barcodes or unit codes</h2>
            <p>POST <code>/api/products/&#123;id&#125;/barcodes</code> appends barcodes. Each entry is a physical unit&apos;s saleable barcode. The platform also stores a unit code for internal tracking. GET <code>/api/products/barcode/&#123;barcode&#125;</code> resolves a single scan to its product.</p>
            <GlassCard variant="subtle" className="not-prose my-6 grid gap-3">
              <p className="text-sm font-black">Rule you can rely on</p>
              <p className="text-sm leading-6 text-[var(--steel)]">SELL transactions require <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs">barcodes.length === total quantity</code> across items. BUY transactions must not send barcodes. The API enforces it; the UI shows a clear inline error before submission.</p>
            </GlassCard>

            <h2>Step 3 — Quantity changes are patches, not overwrites</h2>
            <p>Stock corrections use PATCH <code>/api/products/&#123;id&#125;/quantity</code>. This keeps a ledger entry rather than silently mutating inventory. Owners see the movement in Reports → Product Movement.</p>

            <h2>Troubleshooting</h2>
            <h3>“Barcode not found”</h3>
            <p>Verify the scan actually hit the unit barcode, not the outer case code. Use the worker barcode lookup page to test the scan in isolation before checking out.</p>
            <h3>Sell fails but quantity is available</h3>
            <p>Count barcodes scanned vs item quantities. One missing barcode out of 5 units fails the whole checkout — the design prevents untraceable sales.</p>
            <h3>Night price not applying</h3>
            <p>Check nightShiftEnabled and that the server time window includes the current sale time. The flag is Pro-plan aware and backend-locked if the plan doesn&apos;t support it.</p>

            <h2>Related reading</h2>
            <ul>
              <li><Link href="/guides/qr-ticket-operations">QR Ticket operations manual</Link> — capacity and gate scan parallels.</li>
              <li><Link href="/guides/worker-tips-payouts">Worker tips &amp; payouts</Link> — what happens after the transaction commits.</li>
              <li><Link href="/features">All features</Link> — who uses inventory screens by role.</li>
            </ul>
          </Prose>

          <div className="space-y-5">
            <GlassCard variant="elevated">
              <p className="font-mono text-xs font-black uppercase tracking-[0.14em] text-[var(--muted)]">Quick checklist</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--steel)]">
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--signal)]" /> Name and category are accurate</li>
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--signal)]" /> Day price and optional night price are set</li>
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--signal)]" /> stockQuantity equals physical units on hand</li>
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--signal)]" /> Every unit has a barcode scanned and saved</li>
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--signal)]" /> Test one SELL and one BUY before going live</li>
              </ul>
              <Link href="/how-it-works" className="mt-5 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-[var(--signal)] bg-[var(--signal)] px-4 text-sm font-extrabold text-white hover:bg-[var(--signal-strong)]">See full workflow <ArrowRight className="h-4 w-4" /></Link>
            </GlassCard>

            <GlassCard variant="subtle" className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--warning)]" />
              <div><p className="text-sm font-black">Don&apos;t invent barcodes</p><p className="mt-1 text-sm leading-6 text-[var(--steel)]">Copy the printed barcode exactly. A mistyped code creates a unit that can never be scanned at the till — it will block SELL checkout until corrected.</p></div>
            </GlassCard>
          </div>
        </div>
      </main>
    </>
  );
}
