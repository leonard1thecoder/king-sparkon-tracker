import type { Metadata } from "next";
import Link from "next/link";
import { JobOpportunityDetail } from "@/components/jobs/JobOpportunityDetail";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicBreadcrumb } from "@/components/public/Breadcrumb";
import { SampleBadge } from "@/components/public/SampleBadge";
import { getDemoJobById } from "@/lib/public/demo";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Job Detail | King Sparkon",
  description: "Review a King Sparkon job opportunity and submit an application.",
};

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const demoJob = getDemoJobById(Number(id));

  if (demoJob) {
    return (
      <>
        <PublicHeader />
        <main className="ks-public">
          <PublicBreadcrumb items={[{ label: "Home", href: "/" }, { label: "Job Posts", href: "/jobs" }, { label: demoJob.title }]} />
          <section className="ks-section pt-4 pb-24">
            <div className="ks-wrap max-w-3xl">
              <p className="ks-eyebrow">Job Post</p>
              <h1 className="ks-h1 mt-3">{demoJob.title}</h1>
              <SampleBadge />
              <p className="mt-4 text-sm font-bold text-[var(--ks-muted)]">
                {demoJob.companyName} · {demoJob.location} · {demoJob.status}
              </p>
              <p className="mt-6 whitespace-pre-line leading-7 text-[var(--ks-muted)]">{demoJob.description}</p>
              <div className="ks-card mt-8">
                <h2 className="text-lg font-extrabold">Apply for this role</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--ks-muted)]">
                  Sign in to submit an application and track its status from your dashboard.
                </p>
                <Link href={`/login?next=${encodeURIComponent(`/jobs/${demoJob.id}`)}`} className="ks-btn ks-btn-primary mt-5">
                  Sign in to apply
                </Link>
              </div>
            </div>
          </section>
        </main>
      </>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--surface)] p-5 text-[var(--ink)] md:p-8">
      <div className="mx-auto max-w-7xl">
        <JobOpportunityDetail id={id} />
      </div>
    </main>
  );
}
