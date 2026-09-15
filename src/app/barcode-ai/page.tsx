import type { Metadata } from "next";
import Link from "next/link";
import { ScanLine, ArrowRight } from "lucide-react";
import { AiBarcodeVerify } from "@/components/barcode/AiBarcodeVerify";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { GlassCard } from "@/components/ui/GlassCard";
import { PremiumHeader } from "@/components/marketing/PremiumHeader";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "AI Barcode Verify | Scan, Extract & Explain Product Codes",
  description:
    "Upload barcode photos, extract product barcodes or unit codes, verify stored King Sparkon AI data and receive clear explanations — before a stock transaction is committed.",
  path: "/barcode-ai",
});

export default function BarcodeAiPage() {
  return (
    <>
      <PremiumHeader />
      <main className="min-h-screen bg-white text-[var(--ink)]">
        <div className="mx-auto max-w-7xl px-5 py-6 md:px-8"><Breadcrumbs items={[{ label: "Barcode AI" }]} /></div>
        <section className="relative overflow-hidden border-y border-[var(--line)]">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--signal-soft)] via-[var(--surface)] to-[var(--surface)]" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl px-5 py-8 md:px-8">
            <p className="inline-flex items-center gap-2 rounded-full border border-[var(--signal)]/20 bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]"><ScanLine className="h-3.5 w-3.5" /> Barcode AI</p>
            <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] md:text-4xl">Scan a photo, verify the unit, explain the result.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--steel)]">Take a picture of a barcode or unit code, extract the value, compare it to stored product data, and get an AI explanation you can show a worker before the sale is committed. No account required for a preview.</p>
          </div>
        </section>
        <div className="mx-auto max-w-7xl px-5 py-6 md:px-8">
          <GlassCard variant="subtle" className="mb-6">
            <p className="text-sm font-semibold text-[var(--steel)]">Tip: Use a clear, well-lit photo with the barcode filling at least 60% of the frame. Blurred or angled photos reduce extraction accuracy.</p>
          </GlassCard>
          <AiBarcodeVerify />
          <GlassCard className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm font-semibold text-[var(--steel)]">After verification, the real inventory guide shows how SELL barcode validation prevents silent errors.</p>
            <Link href="/guides/barcode-inventory-guide" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[var(--signal)] bg-[var(--signal)] px-4 py-2 text-sm font-extrabold text-white hover:bg-[var(--signal-strong)]">Inventory guide <ArrowRight className="h-4 w-4" /></Link>
          </GlassCard>
        </div>
      </main>
    </>
  );
}
