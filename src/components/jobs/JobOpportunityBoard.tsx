"use client";

import axios from "axios";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, BriefcaseBusiness, CheckCircle2, Loader2, MapPin, RefreshCw, Search, ShieldCheck, XCircle } from "lucide-react";
import {
  archiveJobOpportunity,
  closeJobOpportunity,
  getManagedJobs,
  getPublicJobs,
  publishJobOpportunity,
} from "@/lib/api/job-opportunities";
import type { JobOpportunity } from "@/lib/types/backend";
import { messageFromBackendPayload } from "@/lib/utils/errors";

type Audience = "public" | "user" | "owner" | "admin";

type JobOpportunityBoardProps = {
  audience?: Audience;
  title?: string;
  description?: string;
};

const workplaceLabels: Record<string, string> = {
  ONSITE: "On-site",
  REMOTE: "Remote",
  HYBRID: "Hybrid",
};

const employmentLabels: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
  TEMPORARY: "Temporary",
};

function salary(job: JobOpportunity) {
  if (!job.salaryMin && !job.salaryMax) return "Salary not listed";
  const currency = job.salaryCurrency ?? "ZAR";
  const min = job.salaryMin ? `${currency} ${job.salaryMin.toLocaleString()}` : null;
  const max = job.salaryMax ? `${currency} ${job.salaryMax.toLocaleString()}` : null;
  return [min, max].filter(Boolean).join(" - ");
}

function statusClass(status: string) {
  if (status === "OPEN") return "border-[var(--confirm)] bg-[var(--confirm)]/10 text-[var(--confirm)]";
  if (status === "DRAFT") return "border-[var(--warning)] bg-[var(--warning)]/10 text-[var(--warning)]";
  if (status === "CLOSED") return "border-[var(--danger)] bg-[var(--danger)]/10 text-[var(--danger)]";
  return "border-[var(--line)] bg-[var(--surface)] text-[var(--steel)]";
}

function errorMessage(error: unknown) {
  return axios.isAxiosError(error) ? messageFromBackendPayload(error.response?.data) : "Unable to load job opportunities.";
}

export function JobOpportunityBoard({ audience = "public", title, description }: JobOpportunityBoardProps) {
  const [keyword, setKeyword] = useState("");
  const [jobs, setJobs] = useState<JobOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActioning, setIsActioning] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isManagement = audience === "owner" || audience === "admin";

  const heading = useMemo(() => {
    if (title) return title;
    if (isManagement) return "Manage job opportunities";
    return "Explore job opportunities";
  }, [isManagement, title]);

  const subheading = useMemo(() => {
    if (description) return description;
    if (isManagement) return "Publish roles, close filled openings, and keep applications visible from the role dashboard.";
    return "Browse open roles from businesses using King Sparkon Tracker and apply from one clean workspace.";
  }, [description, isManagement]);

  const loadJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const page = isManagement ? await getManagedJobs({ keyword, size: 30 }) : await getPublicJobs({ keyword, size: 30 });
      setJobs(page.content ?? []);
    } catch (loadError) {
      setJobs([]);
      setError(errorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [isManagement, keyword]);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  async function runAction(jobId: number, action: "publish" | "close" | "archive") {
    setIsActioning(jobId);
    setError(null);
    try {
      if (action === "publish") await publishJobOpportunity(jobId);
      if (action === "close") await closeJobOpportunity(jobId);
      if (action === "archive") await archiveJobOpportunity(jobId);
      await loadJobs();
    } catch (actionError) {
      setError(errorMessage(actionError));
    } finally {
      setIsActioning(null);
    }
  }

  return (
    <section className="grid gap-6">
      <div className="overflow-hidden rounded-[2.4rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-ledger)] md:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[var(--signal)]">Job opportunities</p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.055em] md:text-6xl">{heading}</h1>
            <p className="mt-4 text-sm leading-7 text-[var(--steel)] md:text-base">{subheading}</p>
          </div>
          {isManagement ? (
            <Link href={`/dashboard/${audience}/jobs/new`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-6 text-sm font-black text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ink)]">
              Post a job <ArrowRight className="h-4 w-4" />
            </Link>
          ) : null}
        </div>

        <form
          className="mt-7 flex flex-col gap-3 rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface)] p-3 shadow-[var(--shadow-soft)] md:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            void loadJobs();
          }}
        >
          <label className="flex min-h-12 flex-1 items-center gap-3 rounded-full border border-[var(--line)] bg-white px-4 focus-within:border-[var(--gold)]" htmlFor="job-search">
            <Search className="h-4 w-4 text-[var(--signal)]" />
            <input id="job-search" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Search title, company, location, or keyword" className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-[var(--muted)]" />
          </label>
          <button type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--ink)] bg-[var(--ink)] px-5 text-sm font-black text-white hover:border-[var(--gold)]">
            Search <ArrowRight className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => { setKeyword(""); void loadJobs(); }} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-5 text-sm font-black text-[var(--ink)] hover:border-[var(--gold)]">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </form>
      </div>

      {error ? (
        <div className="flex items-start gap-3 rounded-[1.75rem] border border-[var(--danger)] bg-[var(--danger)]/10 p-4 text-sm font-bold text-[var(--danger)]">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid min-h-72 place-items-center rounded-[2rem] border border-[var(--line)] bg-white shadow-[var(--shadow-soft)]">
          <div className="inline-flex items-center gap-3 text-sm font-black text-[var(--steel)]"><Loader2 className="h-5 w-5 animate-spin text-[var(--signal)]" /> Loading job opportunities</div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-[2rem] border border-[var(--line)] bg-white p-8 text-center shadow-[var(--shadow-soft)]">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-[1.4rem] bg-[var(--ink)] text-[var(--gold)]"><BriefcaseBusiness className="h-8 w-8" /></div>
          <h2 className="mt-5 text-2xl font-black tracking-[-0.04em]">No job opportunities found.</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--steel)]">When the backend returns OPEN jobs they will appear here. Owners and admins can publish new jobs from the dashboard.</p>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {jobs.map((job) => (
            <article key={job.id} className="group rounded-[2rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)] transition hover:-translate-y-1 hover:border-[var(--gold)] md:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.12em] ${statusClass(job.status)}`}>{job.status}</span>
                  <h2 className="mt-4 text-2xl font-black tracking-[-0.04em] text-[var(--ink)]">{job.title}</h2>
                  <p className="mt-2 text-sm font-bold text-[var(--steel)]">{job.companyName}</p>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-[1.2rem] bg-[var(--ink)] text-[var(--gold)]"><BriefcaseBusiness className="h-6 w-6" /></div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs font-black text-[var(--steel)]"><MapPin className="h-3.5 w-3.5 text-[var(--signal)]" /> {job.location}</span>
                <span className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs font-black text-[var(--steel)]">{workplaceLabels[job.workplaceType] ?? job.workplaceType}</span>
                <span className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs font-black text-[var(--steel)]">{employmentLabels[job.employmentType] ?? job.employmentType}</span>
                <span className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs font-black text-[var(--steel)]">{salary(job)}</span>
              </div>

              <p className="mt-5 line-clamp-3 text-sm leading-7 text-[var(--steel)]">{job.description}</p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link href={isManagement ? `/dashboard/${audience}/jobs/${job.id}` : `/jobs/${job.id}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white hover:bg-[var(--ink)]">
                  {isManagement ? "Manage job" : "View role"} <ArrowRight className="h-4 w-4" />
                </Link>
                {isManagement && job.status !== "OPEN" ? (
                  <button type="button" disabled={isActioning === job.id} onClick={() => void runAction(job.id, "publish")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--confirm)] bg-white px-5 text-sm font-black text-[var(--confirm)] hover:bg-[var(--confirm)] hover:text-white disabled:opacity-50">
                    <CheckCircle2 className="h-4 w-4" /> Publish
                  </button>
                ) : null}
                {isManagement && job.status === "OPEN" ? (
                  <button type="button" disabled={isActioning === job.id} onClick={() => void runAction(job.id, "close")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--danger)] bg-white px-5 text-sm font-black text-[var(--danger)] hover:bg-[var(--danger)] hover:text-white disabled:opacity-50">
                    Close
                  </button>
                ) : null}
                {isManagement ? (
                  <button type="button" disabled={isActioning === job.id} onClick={() => void runAction(job.id, "archive")} className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--line)] bg-white px-5 text-sm font-black text-[var(--steel)] hover:border-[var(--gold)] disabled:opacity-50">
                    Archive
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
