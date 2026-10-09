import type { Metadata } from "next";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicBreadcrumb } from "@/components/public/Breadcrumb";
import { UifTools } from "@/components/public/UifTools";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "UIF System & POPIA Portal | Status Check, Password Reset & Calculator",
  description:
    "Official King Sparkon portal for South Africa Unemployment Insurance Fund (UIF) Online System services: check claim status, request password updates, calculate contributions under strict POPIA compliance.",
  path: "/uif",
  keywords: ["UIF South Africa", "UIF Status Check", "UIF Password Update", "UIF Calculator", "POPIA Compliance UIF"],
});

export default function UifPortalPage() {
  return (
    <>
      <PublicHeader />
      <main className="ks-public">
        <PublicBreadcrumb items={[{ label: "Home", href: "/" }, { label: "UIF tools" }]} />

        <section className="ks-section pt-4">
          <div className="ks-wrap">
            <p className="ks-eyebrow">Public service tools</p>
            <h1 className="ks-h1 mt-3">UIF tools</h1>
            <p className="ks-lead mt-5">Check a claim, update your UIF Online password or estimate a benefit.</p>

            <div className="mt-10">
              <UifTools />
            </div>

            <p className="mt-8 max-w-2xl text-xs leading-6 text-[var(--ks-muted)]">
              King Sparkon provides these tools. Decisions on claims and payments are made by the Department of Employment and Labour.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
