import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicBreadcrumb, breadcrumbJsonLd } from "@/components/public/Breadcrumb";
import { Reveal } from "@/components/public/InView";
import { UifScene } from "@/components/public/SceneVisuals";
import { pageMetadata } from "@/lib/seo";

const siteUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://king-sparkon-tracker.com").replace(/\/$/, "");
const path = "/jobs/unemployment-insurance-fund";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Unemployment Insurance Fund (UIF) | King Sparkon",
    description:
      "Find the UIF-related tools King Sparkon provides, and the official Unemployment Insurance Fund information you need, clearly separated.",
    path,
  }),
  title: { absolute: "Unemployment Insurance Fund (UIF) | King Sparkon" },
};

const crumbs = [
  { label: "Home", href: "/" },
  { label: "Job Posts", href: "/jobs" },
  { label: "Unemployment Insurance Fund" },
];

export default function UifPage() {
  return (
    <>
      <PublicHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(crumbs, siteUrl)).replace(/</g, "\\u003c") }} />
      <main className="ks-public">
        <PublicBreadcrumb items={crumbs} />

        <section className="ks-section pt-4">
          <div className="ks-wrap grid items-center gap-12 lg:grid-cols-[1fr_1fr]">
            <div>
              <p className="ks-eyebrow">Employment support</p>
              <h1 className="ks-h1 mt-3">Unemployment Insurance Fund</h1>
              <p className="ks-lead mt-5">
                This page separates two things: the UIF-related tools King Sparkon provides, and official Unemployment Insurance Fund information. Check which one you need before you act.
              </p>
            </div>
            <UifScene />
          </div>
        </section>

        <section className="ks-section border-t border-[var(--ks-line)]">
          <div className="ks-wrap grid gap-6 md:grid-cols-2">
            <Reveal>
              <div className="ks-card h-full">
                <p className="ks-eyebrow">King Sparkon functionality</p>
                <h2 className="mt-3 text-xl font-extrabold">UIF-related tools on this platform</h2>
                <p className="mt-3 text-sm leading-6 text-[var(--ks-muted)]">
                  King Sparkon provides UIF-related tools on its UIF tools page, including status, password and calculator tools. These tools are provided by King Sparkon and do not replace official UIF services.
                </p>
                <Link href="/uif" className="ks-btn ks-btn-secondary mt-6">Open the UIF tools</Link>
              </div>
            </Reveal>
            <Reveal>
              <div className="ks-card h-full">
                <p className="ks-eyebrow">Official UIF information</p>
                <h2 className="mt-3 text-xl font-extrabold">Use the official source</h2>
                <p className="mt-3 text-sm leading-6 text-[var(--ks-muted)]">
                  For eligibility, payment amounts, deadlines and official processes, use the Unemployment Insurance Fund website. King Sparkon does not set these rules.
                </p>
                <a href="https://www.uif.gov.za" target="_blank" rel="noopener noreferrer" className="ks-btn ks-btn-primary mt-6">
                  Visit the official UIF website
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="ks-section border-t border-[var(--ks-line)] pb-24">
          <div className="ks-wrap grid gap-10 md:grid-cols-[1fr_1.2fr]">
            <Reveal>
              <h2 className="ks-h2">What this page is not</h2>
            </Reveal>
            <Reveal>
              <p className="ks-lead">
                King Sparkon is not the Unemployment Insurance Fund. Nothing on this page is legal, tax or government advice, and it does not confirm eligibility or payment. Official guidance always takes priority.
              </p>
            </Reveal>
          </div>
        </section>
      </main>
    </>
  );
}
