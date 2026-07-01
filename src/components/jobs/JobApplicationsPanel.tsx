"use client";

import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { FileCheck2, Loader2, RefreshCw, XCircle } from "lucide-react";
import { getJobApplications, getMyJobApplications, updateJobApplicationStatus } from "@/lib/api/job-opportunities";
import type { JobApplication, JobApplicationStatus } from "@/lib/types/backend";
import { messageFromBackendPayload } from "@/lib/utils/errors";

type Props = {
  jobId?: string;
  scope?: "mine" | "manage";
};

const statuses: JobApplicationStatus[] = ["SUBMITTED", "REVIEWING", "SHORTLISTED", "REJECTED", "ACCEPTED", "WITHDRAWN"];

function errorMessage(error: unknown) {
  return axios.isAxiosError(error) ? messageFromBackendPayload(error.response?.data) : "Unable to load job applications.";
}

function badge(status: string) {
  if (status === "ACCEPTED" || status === "SHORTLISTED") return "border-[var(--confirm)] bg-[var(--confirm)]/10 text-[var(--confirm)]";
  if (status === "REJECTED" || status === "WITHDRAWN") return "border-[var(--danger)] bg-[var(--danger)]/10 text-[var(--danger)]";
  if (status === "REVIEWING") return "border-[var(--warning)] bg-[var(--warning)]/10 text-[var(--warning)]";
  return "border-[var(--signal)] bg-[var(--signal)]/10 text-[var(--signal)]";
}

export function JobApplicationsPanel({ jobId, scope = jobId ? "manage" : "mine" }: Props) {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canManage = scope === "manage";
  const needsJobSelection = canManage && !jobId;

  const loadApplications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    if (needsJobSelection) {
      setApplications([]);
      setIsLoading(false);
      return;
    }

    try {
      const result = jobId ? await getJobApplications(jobId) : await getMyJobApplications();
      setApplications(result.content ?? []);
    } catch (loadError) {
      setApplications([]);
      setError(errorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [jobId, needsJobSelection]);

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  async function updateStatus(applicationId: number, status: JobApplicationStatus) {
    setIsSaving(applicationId);
    setError(null);
    try {
      await updateJobApplicationStatus(applicationId, status);
      await loadApplications();
    } catch (saveError) {
      setError(errorMessage(saveError));
    } finally {
      setIsSaving(null);
    }
  }

  return (
    <section className="grid gap-5">
      <div className="rounded-[2.2rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-ledger)] md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[var(--signal)]">Applications</p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.055em] md:text-5xl">{canManage ? "Job applications" : "My applications"}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--steel)]">{canManage ? "Review applicants from a specific job detail page and move them through the backend status pipeline." : "Track the roles you have applied for and keep your next action visible."}</p>
          </div>
          {!needsJobSelection ? (
            <button type="button" onClick={() => void loadApplications()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-5 text-sm font-black text-[var(--ink)] hover:border-[var(--gold)]">
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          ) : null}
        </div>
      </div>

      {needsJobSelection ? (
        <div className="rounded-[2rem] border border-[var(--line)] bg-white p-8 text-center shadow-[var(--shadow-soft)]">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-[1.4rem] bg-[var(--ink)] text-[var(--gold)]"><FileCheck2 className="h-8 w-8" /></div>
          <h2 className="mt-5 text-2xl font-black tracking-[-0.04em]">Select a job to review applications.</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--steel)]">The backend exposes applications by job. Open a job from the Job Opportunities board, then review and update applications from that job detail page.</p>
        </div>
      ) : error ? <div className="flex gap-2 rounded-[1.5rem] border border-[var(--danger)] bg-[var(--danger)]/10 p-4 text-sm font-bold text-[var(--danger)]"><XCircle className="h-5 w-5" /> {error}</div> : null}

      {!needsJobSelection && isLoading ? (
        <div className="grid min-h-72 place-items-center rounded-[2rem] border border-[var(--line)] bg-white shadow-[var(--shadow-soft)]"><div className="inline-flex items-center gap-3 text-sm font-black text-[var(--steel)]"><Loader2 className="h-5 w-5 animate-spin text-[var(--signal)]" /> Loading applications</div></div>
      ) : !needsJobSelection && applications.length === 0 ? (
        <div className="rounded-[2rem] border border-[var(--line)] bg-white p-8 text-center shadow-[var(--shadow-soft)]">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-[1.4rem] bg-[var(--ink)] text-[var(--gold)]"><FileCheck2 className="h-8 w-8" /></div>
          <h2 className="mt-5 text-2xl font-black tracking-[-0.04em]">No applications yet.</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--steel)]">Applications will appear here once users submit them through the job detail page.</p>
        </div>
      ) : !needsJobSelection ? (
        <div className="grid gap-4">
          {applications.map((application) => (
            <article key={application.id} className="rounded-[2rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)] md:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.12em] ${badge(application.status)}`}>{application.status}</span>
                  <h2 className="mt-4 text-2xl font-black tracking-[-0.04em]">{application.applicantName}</h2>
                  <p className="mt-2 text-sm font-bold text-[var(--steel)]">{application.applicantEmail}</p>
                  {application.jobTitle ? <p className="mt-2 text-sm font-semibold text-[var(--steel)]">Role: {application.jobTitle} {application.companyName ? `at ${application.companyName}` : ""}</p> : null}
                </div>
                {canManage ? (
                  <label className="grid gap-2 text-sm font-black text-[var(--ink)]" htmlFor={`status-${application.id}`}>
                    Status
                    <select
                      id={`status-${application.id}`}
                      value={application.status}
                      disabled={isSaving === application.id}
                      onChange={(event) => void updateStatus(application.id, event.target.value as JobApplicationStatus)}
                      className="min-h-11 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-bold outline-none focus:border-[var(--gold)]"
                    >
                      {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </label>
                ) : null}
              </div>
              {application.coverMessage ? <p className="mt-5 rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-4 text-sm leading-7 text-[var(--steel)]">{application.coverMessage}</p> : null}
              <div className="mt-5 flex flex-wrap gap-2 text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">
                {application.phoneNumber ? <span className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5">{application.phoneNumber}</span> : null}
                {application.cvUrl ? <a href={application.cvUrl} target="_blank" rel="noreferrer" className="rounded-full border border-[var(--signal)] bg-white px-3 py-1.5 text-[var(--signal)]">Open CV</a> : null}
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
