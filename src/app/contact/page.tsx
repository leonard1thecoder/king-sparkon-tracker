import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { GlassCard } from "@/components/ui/GlassCard";
import { PremiumHeader } from "@/components/marketing/PremiumHeader";
import { DownloadAppButton } from "@/components/marketing/DownloadAppButtons";
import { ContactForm } from "@/app/contact-form";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact King Sparkon Tracker | Implementation & Support Inquiries",
  description:
    "Contact King Sparkon Tracker for implementation inquiries, support questions, billing, and affiliate or worker setup. Get guidance on barcode inventory, QR tickets and role-safe operations.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PremiumHeader />
      <main className="bg-white text-[var(--ink)]">
        <div className="mx-auto max-w-7xl px-5 py-6 md:px-8"><Breadcrumbs items={[{ label: "Contact" }]} /></div>

        <section className="relative overflow-hidden border-y border-[var(--line)]">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--signal-soft)] via-[var(--surface)] to-[var(--surface)]" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-7xl gap-8 px-5 py-10 md:px-8 md:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div>
              <p className="inline-flex rounded-full border border-[var(--signal)]/20 bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]">Contact</p>
              <h1 className="mt-4 text-4xl font-black tracking-[-0.05em] md:text-5xl">Tell us what your operation needs to prove.</h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-[var(--steel)]">Describe the roles, products, ticket flow or transaction problem you need the platform to manage. We reply with a concrete implementation path — not marketing fluff.</p>

              <div className="mt-6 grid gap-4">
                <GlassCard variant="subtle" className="flex gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[var(--line)] bg-white text-[var(--signal)]"><Mail className="h-5 w-5" /></div>
                  <div><p className="text-sm font-black">Implementation inquiry</p><p className="text-sm leading-6 text-[var(--steel)]">Share business name, location, and which jobs (inventory, tickets, tips) you need first.</p></div>
                </GlassCard>
                <div className="flex flex-wrap gap-3 text-sm font-semibold text-[var(--muted)]">
                  <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" /> South Africa ready</span>
                  <span className="inline-flex items-center gap-2"><Phone className="h-4 w-4" /> Use the form — no phone queue</span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <DownloadAppButton />
                <Link href="/how-it-works" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-white px-5 text-sm font-extrabold hover:border-[var(--signal)]">How it works <ArrowRight className="h-4 w-4" /></Link>
                <Link href="/faq" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--line)] bg-white px-5 text-sm font-extrabold hover:border-[var(--signal)]">Read FAQ</Link>
              </div>
            </div>

            <GlassCard variant="elevated">
              <h2 className="text-lg font-black">Send an inquiry</h2>
              <p className="mt-1 text-sm leading-6 text-[var(--steel)]">We store inquiries via POST /api/contact-inquiries through the frontend proxy. No secrets are exposed to the browser.</p>
              <div className="mt-6"><ContactForm /></div>
            </GlassCard>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-16 md:px-8">
          <div className="grid gap-5 md:grid-cols-3">
            <GlassCard><h3 className="font-black">What to include</h3><p className="mt-2 text-sm leading-6 text-[var(--steel)]">Operation type (retail, events, tuck-shop), number of workers, whether you need tickets, tips or affiliates.</p></GlassCard>
            <GlassCard><h3 className="font-black">Response</h3><p className="mt-2 text-sm leading-6 text-[var(--steel)]">A role map, recommended first guides, and whether Free Trial, Plus or Pro fits your worker count.</p></GlassCard>
            <GlassCard><h3 className="font-black">Links</h3><p className="mt-2 text-sm leading-6 text-[var(--steel)]">About the founder, how the workflow runs, and the full feature map are all public — no account needed.</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                <Link href="/about" className="text-[var(--signal-strong)] hover:text-[var(--accent-hover)]">About →</Link>
                <Link href="/features" className="text-[var(--signal-strong)] hover:text-[var(--accent-hover)]">Features →</Link>
              </div>
            </GlassCard>
          </div>
        </section>
      </main>
    </>
  );
}
