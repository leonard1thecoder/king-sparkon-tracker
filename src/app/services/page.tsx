import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Code2, Settings } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicBreadcrumb, breadcrumbJsonLd } from "@/components/public/Breadcrumb";
import { Reveal, Scene } from "@/components/public/InView";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Services | NM Computer Care & Dev Hub",
  description:
    "King Sparkon services: NM Computer Care for device servicing and upgrades, and the Dev Hub for software requests, AI estimates and project delivery.",
  path: "/services",
  keywords: ["NM Computer Care", "Dev Hub", "computer servicing", "software development", "King Sparkon services"],
});

const siteUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://king-sparkon-tracker.com").replace(/\/$/, "");

const careTiers = [
  {
    title: "Basic Care",
    text: "Operating-system installs, driver refreshes and performance software add-ons for everyday devices.",
  },
  {
    title: "Performance Care",
    text: "CPU, RAM and GPU upgrades with session pricing for machines that need more power.",
  },
  {
    title: "Business Care",
    text: "Bulk device servicing per business tier, quoted and tracked per plan.",
  },
];

export default function ServicesPage() {
  const servicesJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "King Sparkon Services",
    url: `${siteUrl}/services`,
    itemListElement: [
      {
        "@type": "Service",
        position: 1,
        name: "NM Computer Care",
        description:
          "Device servicing and upgrades: Basic Care, Performance Care and Business Care plans with quotes and status tracking.",
        url: `${siteUrl}/services`,
        provider: { "@type": "Organization", name: "King Sparkon" },
      },
      {
        "@type": "Service",
        position: 2,
        name: "King Sparkon Dev Hub",
        description:
          "Software requests with AI-generated price estimates, phased project plans and owner accept-or-reject workflows.",
        url: `${siteUrl}/dev-hub`,
        provider: { "@type": "Organization", name: "King Sparkon" },
      },
    ],
  };

  return (
    <>
      <PublicHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesJsonLd).replace(/</g, "\\u003c") }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([{ label: "Home", href: "/" }, { label: "Services" }], siteUrl),
          ).replace(/</g, "\\u003c"),
        }}
      />
      <main className="ks-public">
        <PublicBreadcrumb items={[{ label: "Home", href: "/" }, { label: "Services" }]} />

        <section className="ks-section pt-4">
          <div className="ks-wrap grid items-end gap-10 lg:grid-cols-[1.1fr_1fr]">
            <div className="text-center">
              <p className="ks-eyebrow">Services</p>
              <h1 className="ks-h1 mt-3">King Sparkon Services</h1>
              <p className="ks-lead mx-auto mt-5">
                Device care from NM Computer Care and software delivery from the Dev Hub — quoted, tracked and
                delivered in one place.
              </p>
            </div>
            <Scene className="grid grid-cols-2 gap-3">
              {["NM Computer Care", "Dev Hub"].map((label, index) => (
                <div key={label} className="ks-float ks-card text-center" style={{ animationDelay: `${-index * 1.4}s` }}>
                  <span className="mx-auto block h-1.5 w-10 rounded-full bg-[var(--ks-yellow)]" aria-hidden="true" />
                  <span className="mt-4 block text-sm font-bold">{label}</span>
                </div>
              ))}
            </Scene>
          </div>
        </section>

        <section className="ks-section border-t border-[var(--ks-line)]" aria-labelledby="computer-care">
          <div className="ks-wrap">
            <Reveal>
              <div className="mx-auto max-w-2xl text-center">
                <p className="ks-eyebrow">Device servicing</p>
                <h2 id="computer-care" className="ks-h2 mt-3">
                  NM Computer Care
                </h2>
                <p className="ks-lead mx-auto mt-4">
                  Servicing and upgrades for personal and business devices. Every plan carries a quote and a live
                  status — from created and paid to completed.
                </p>
              </div>
            </Reveal>
            <ul className="mt-8 grid gap-5 md:grid-cols-3">
              {careTiers.map((tier) => (
                <li key={tier.title} className="ks-card flex h-full flex-col">
                  <span className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--ks-line)] ks-surface">
                    <Settings className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-xl font-extrabold leading-tight">{tier.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--ks-muted)]">{tier.text}</p>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/dashboard/user/computer-care" className="ks-btn ks-btn-primary">
                Request device care
              </Link>
              <Link href="/login?next=%2Fdashboard%2Fuser%2Fcomputer-care" className="ks-btn ks-btn-secondary">
                Sign in to track plans
              </Link>
            </div>
          </div>
        </section>

        <section className="ks-section border-t border-[var(--ks-line)] pb-24" aria-labelledby="dev-hub-service">
          <div className="ks-wrap">
            <Reveal>
              <div className="mx-auto max-w-2xl text-center">
                <p className="ks-eyebrow">Software delivery</p>
                <h2 id="dev-hub-service" className="ks-h2 mt-3">
                  King Sparkon Dev Hub
                </h2>
                <p className="ks-lead mx-auto mt-4">
                  Submit a software request, receive an AI-generated price estimate and phased plan, then accept or
                  reject from the owner console — through CI/CD, QA and cloud maintenance.
                </p>
              </div>
            </Reveal>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              <div className="ks-card">
                <span className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--ks-line)] ks-surface">
                  <Code2 className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-xl font-extrabold leading-tight">Request &amp; estimate</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--ks-muted)]">
                  Describe the build. The Dev Hub returns an estimate range and a staged delivery plan.
                </p>
              </div>
              <div className="ks-card">
                <h3 className="mt-5 text-xl font-extrabold leading-tight">Build &amp; test</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--ks-muted)]">
                  Delivery moves through tracked stages with QA regression and owner visibility throughout.
                </p>
              </div>
              <div className="ks-card">
                <h3 className="mt-5 text-xl font-extrabold leading-tight">Deploy &amp; maintain</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--ks-muted)]">
                  Cloud deployment, maintenance and support keep the software running after launch.
                </p>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/dev-hub" className="ks-btn ks-btn-primary">
                Open Dev Hub <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/dashboard/owner/developer" className="ks-btn ks-btn-secondary">
                Request a build
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
