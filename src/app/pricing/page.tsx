import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicBreadcrumb, breadcrumbJsonLd } from "@/components/public/Breadcrumb";
import { Reveal, Scene } from "@/components/public/InView";
import { BUSINESS_PRICING_PLANS, SOFTWARE_APPLICATION_OFFERS } from "@/lib/config/business-policy";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Pricing | King Sparkon Plans",
  description:
    "King Sparkon pricing: free user, affiliate and business trial plans, plus Plus and Pro for growing businesses — workers, scanning, tickets, jobs and Dev Hub support.",
  path: "/pricing",
  keywords: ["King Sparkon pricing", "Plus plan", "Pro plan", "business plans", "Dev Hub quote"],
});

const siteUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://king-sparkon-tracker.com").replace(/\/$/, "");

export default function PricingPage() {
  const offersJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "King Sparkon Business Plans",
    description:
      "Subscription plans for the King Sparkon platform: free user, affiliate and trial access, plus paid Plus and Pro business plans.",
    url: `${siteUrl}/pricing`,
    brand: { "@type": "Brand", name: "King Sparkon" },
    offers: SOFTWARE_APPLICATION_OFFERS,
  };

  return (
    <>
      <PublicHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(offersJsonLd).replace(/</g, "\\u003c") }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([{ label: "Home", href: "/" }, { label: "Pricing" }], siteUrl),
          ).replace(/</g, "\\u003c"),
        }}
      />
      <main className="ks-public">
        <PublicBreadcrumb items={[{ label: "Home", href: "/" }, { label: "Pricing" }]} />

        <section className="ks-section pt-4">
          <div className="ks-wrap grid items-end gap-10 lg:grid-cols-[1.1fr_1fr]">
            <div className="text-center">
              <p className="ks-eyebrow">Pricing</p>
              <h1 className="ks-h1 mt-3">Simple plans that grow with you</h1>
              <p className="ks-lead mx-auto mt-5">
                Start free as a user, affiliate or trial business. Move to Plus or Pro when you need workers,
                scanning, tickets, jobs and Dev Hub strength.
              </p>
            </div>
            <Scene className="grid grid-cols-3 gap-3">
              {["Free start", "Plus growth", "Pro scale"].map((label, index) => (
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
              <h2 className="ks-h2 text-center">Plans</h2>
            </Reveal>
            <ul className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {BUSINESS_PRICING_PLANS.map((plan) => (
                <li key={plan.planCode} className="ks-card flex h-full flex-col">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--ks-muted)]">{plan.caption}</p>
                    {plan.highlight ? (
                      <span className="rounded-full bg-[var(--ks-yellow)] px-3 py-1 text-xs font-bold">Popular</span>
                    ) : null}
                  </div>
                  <h3 className="mt-2 text-xl font-extrabold leading-tight">{plan.name}</h3>
                  <p className="mt-2 text-2xl font-black">
                    {plan.priceDisplay}
                    {plan.billingSuffix ? <span className="text-sm font-bold text-[var(--ks-muted)]"> / {plan.billingSuffix}</span> : null}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[var(--ks-muted)]">{plan.description}</p>
                  <ul className="mt-4 grid gap-2 text-sm">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-6">
                    <Link href="/register" className="ks-btn ks-btn-primary w-full justify-center">
                      Get Started
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="ks-section border-t border-[var(--ks-line)] pb-24">
          <div className="ks-wrap">
            <Reveal>
              <div className="mx-auto max-w-2xl text-center">
                <p className="ks-eyebrow">Custom builds</p>
                <h2 className="ks-h2 mt-3">Need software, not a plan?</h2>
                <p className="ks-lead mx-auto mt-4">
                  The Dev Hub quotes custom software separately — request a free discovery quote before choosing Plus or Pro.
                </p>
                <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <Link href="/services" className="ks-btn ks-btn-primary">
                    Explore Services <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <Link href="/dev-hub" className="ks-btn ks-btn-secondary">
                    Open Dev Hub
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
