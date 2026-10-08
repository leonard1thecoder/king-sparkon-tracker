import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicBreadcrumb } from "@/components/public/Breadcrumb";
import { Reveal, Scene } from "@/components/public/InView";
import { UifScene } from "@/components/public/SceneVisuals";
import { JobsExplorer } from "@/components/public/JobsExplorer";
import { getPublicJobs } from "@/lib/public/data";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "King Sparkon Job Posts | Find Jobs & Opportunities",
    description:
      "Discover jobs and employment opportunities on King Sparkon and connect with businesses looking for people.",
    path: "/jobs",
  }),
  title: { absolute: "King Sparkon Job Posts | Find Jobs & Opportunities" },
};

export const revalidate = 300;

export default async function JobsPage() {
  const jobs = await getPublicJobs(12);

  return (
    <>
      <PublicHeader />
      <main className="ks-public">
        <PublicBreadcrumb items={[{ label: "Home", href: "/" }, { label: "Job Posts" }]} />

        <section className="ks-section pt-4">
          <div className="ks-wrap grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
            <div>
              <p className="ks-eyebrow">Job Posts</p>
              <h1 className="ks-h1 mt-3">King Sparkon Job Posts</h1>
              <p className="ks-lead mt-5">
                Discover opportunities from businesses on King Sparkon. Read each post and apply in one place.
              </p>
            </div>
            <Scene className="grid grid-cols-3 gap-3">
              {["Person", "Job card", "Business"].map((label, index) => (
                <div key={label} className="ks-float ks-card text-center" style={{ animationDelay: `${-index * 1.2}s` }}>
                  <span className="mx-auto block h-8 w-8 rounded-full bg-[var(--ks-sky)]" aria-hidden="true" />
                  <span className="mt-3 block text-xs font-bold">{label}</span>
                </div>
              ))}
            </Scene>
          </div>
        </section>

        <section className="ks-section border-t border-[var(--ks-line)]">
          <div className="ks-wrap">
            <Reveal>
              <h2 className="ks-h2">Latest Job Posts</h2>
            </Reveal>
            <div className="mt-8">
              <JobsExplorer jobs={jobs} />
            </div>
          </div>
        </section>

        <section className="ks-section border-t border-[var(--ks-line)]">
          <div className="ks-wrap grid gap-6 md:grid-cols-2">
            <Reveal>
              <div className="ks-card h-full">
                <p className="ks-eyebrow">For Employers</p>
                <h2 className="mt-3 text-xl font-extrabold">Publish a role your business needs.</h2>
                <p className="mt-3 text-sm leading-6 text-[var(--ks-muted)]">
                  Business owners publish and manage job posts from the owner dashboard, then review applications there.
                </p>
              </div>
            </Reveal>
            <Reveal>
              <div className="ks-card h-full">
                <p className="ks-eyebrow">For Job Seekers</p>
                <h2 className="mt-3 text-xl font-extrabold">Read a post, then apply.</h2>
                <p className="mt-3 text-sm leading-6 text-[var(--ks-muted)]">
                  Each post shows the role, location and requirements. Sign in to apply and follow your application status.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="ks-section border-t border-[var(--ks-line)]">
          <div className="ks-wrap grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
            <Reveal>
              <p className="ks-eyebrow">Employment Support</p>
              <h2 className="ks-h2 mt-3">Support when work changes.</h2>
              <p className="ks-lead mt-4">
                King Sparkon provides UIF-related tools and links to official information.
              </p>
              <Link href="/jobs/unemployment-insurance-fund" className="ks-btn ks-btn-secondary mt-6">
                Learn about UIF
              </Link>
            </Reveal>
            <UifScene />
          </div>
        </section>

      </main>
    </>
  );
}
