import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Barcode, Megaphone, QrCode, Wallet } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicBreadcrumb } from "@/components/public/Breadcrumb";
import { Reveal, Scene } from "@/components/public/InView";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Articles | King Sparkon Guides & Resources",
  description:
    "Browse all King Sparkon articles and guides — barcode inventory, QR tickets, worker tips, affiliate referrals, how-it-works and feature explainers.",
  path: "/articles",
});

const articles = [
  {
    slug: "barcode-inventory-guide",
    icon: Barcode,
    title: "Barcode Inventory Guide",
    excerpt: "Register products, assign unit barcodes, adjust stock without losing history, and use night-shift pricing.",
    read: "8 min",
  },
  {
    slug: "qr-ticket-operations",
    icon: QrCode,
    title: "QR Ticket Operations Manual",
    excerpt: "Create events, set capacity, sell tickets, and verify QR codes at the gate with correct checked-in totals.",
    read: "7 min",
  },
  {
    slug: "worker-tips-payouts",
    icon: Wallet,
    title: "Worker Tips, Fees & Payouts",
    excerpt: "How tip QR flows, gross/fee/net and withdrawal status keep money transparent before the owner approves.",
    read: "6 min",
  },
  {
    slug: "affiliate-referrals",
    icon: Megaphone,
    title: "Affiliate Referrals & Campaigns",
    excerpt: "Referral codes, promotion quotes, audience targeting and commission visibility — no guesswork on earnings.",
    read: "6 min",
  },
];

export default function ArticlesPage() {
  return (
    <>
      <PublicHeader />
      <main className="ks-public">
        <PublicBreadcrumb items={[{ label: "Home", href: "/" }, { label: "Articles" }]} />

        <section className="ks-section pt-4">
          <div className="ks-wrap grid items-end gap-10 lg:grid-cols-[1.1fr_1fr]">
            <div className="text-center">
              <p className="ks-eyebrow">Articles &amp; Resources</p>
              <h1 className="ks-h1 mt-3">Articles that explain how the work gets done</h1>
              <p className="ks-lead mx-auto mt-5">
                Browse all King Sparkon articles — barcode inventory, QR tickets, worker tips, affiliate referrals and platform explainers.
              </p>
            </div>
            <Scene className="grid grid-cols-3 gap-3">
              {["Guides", "How-tos", "Explainers"].map((label, index) => (
                <div key={label} className="ks-float ks-card text-center" style={{ animationDelay: `${-index * 1.4}s` }}>
                  <span className="mx-auto block h-1.5 w-10 rounded-full bg-[var(--ks-yellow)]" aria-hidden="true" />
                  <span className="mt-4 block text-sm font-bold">{label}</span>
                </div>
              ))}
            </Scene>
          </div>
        </section>

        <section className="ks-section border-t border-[var(--ks-line)]">
          <div className="ks-wrap">
            <Reveal>
              <h2 className="ks-h2 text-center">All articles</h2>
            </Reveal>
            <ul className="mt-8 grid gap-5 md:grid-cols-2">
              {articles.map((article) => (
                <li key={article.slug}>
                  <Link href={`/articles/${article.slug}`} className="ks-card group flex h-full flex-col">
                    <div className="flex items-center justify-between">
                      <span className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--ks-line)] ks-surface text-[var(--ks-ink)]">
                        <article.icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="rounded-full border border-[var(--ks-line)] ks-surface px-3 py-1 text-xs font-bold">
                        {article.read}
                      </span>
                    </div>
                    <h3 className="mt-5 text-xl font-extrabold leading-tight">{article.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-[var(--ks-muted)]">{article.excerpt}</p>
                    <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-bold">
                      Read article
                      <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="ks-section border-t border-[var(--ks-line)] pb-24">
          <div className="ks-wrap">
            <Reveal>
              <div className="mx-auto max-w-2xl text-center">
                <p className="ks-eyebrow">Start here</p>
                <h2 className="ks-h2 mt-3">New to the platform?</h2>
                <p className="ks-lead mx-auto mt-4">
                  Start with how the five-step workflow connects inventory to audit.
                </p>
                <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <Link href="/how-it-works" className="ks-btn ks-btn-primary">
                    How it works <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <Link href="/register" className="ks-btn ks-btn-secondary">
                    Get Started
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
    </>
  );
}
