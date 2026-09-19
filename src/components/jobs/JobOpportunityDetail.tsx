"use client";

import axios from "axios";
import Link from "next/link";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, CheckCircle2, FileText, Loader2, Mail, MapPin, Send, Upload, X, XCircle } from "lucide-react";
import { applyForJob, getJobById, isEmailTarget, uploadJobApplicationCv } from "@/lib/api/job-opportunities";
import type { ApplyForJobPayload, JobOpportunity } from "@/lib/types/backend";
import { messageFromBackendPayload } from "@/lib/utils/errors";

const CV_MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const CV_ACCEPT = ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function isAcceptedCv(file: File) {
  const name = file.name.toLowerCase();
  const acceptedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
  return acceptedTypes.includes(file.type) || name.endsWith(".pdf") || name.endsWith(".doc") || name.endsWith(".docx");
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function errorMessage(error: unknown) {
  return axios.isAxiosError(error) ? messageFromBackendPayload(error.response?.data) : "Unable to load this job opportunity.";
}

function fieldValue(formData: FormData, key: keyof ApplyForJobPayload) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function JobOpportunityDetail({ id, canApply = true, manageHref }: { id: string; canApply?: boolean; manageHref?: string }) {
  const [job, setJob] = useState<JobOpportunity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [phase, setPhase] = useState<"uploading" | "submitting" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applyStatus, setApplyStatus] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvError, setCvError] = useState<string | null>(null);
  const cvInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadJob() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getJobById(id);
        if (isMounted) setJob(result);
      } catch (loadError) {
        if (isMounted) setError(errorMessage(loadError));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    void loadJob();
    return () => { isMounted = false; };
  }, [id]);

  function selectCvFile(candidate: File | null) {
    if (!candidate) {
      setCvFile(null);
      setCvError(null);
      return;
    }
    if (!isAcceptedCv(candidate)) {
      setCvFile(null);
      setCvError("Please attach a PDF, DOC or DOCX file.");
      return;
    }
    if (candidate.size > CV_MAX_SIZE_BYTES) {
      setCvFile(null);
      setCvError("File is too large. Maximum size is 10 MB.");
      return;
    }
    setCvFile(candidate);
    setCvError(null);
  }

  function clearCvFile() {
    setCvFile(null);
    setCvError(null);
    if (cvInputRef.current) cvInputRef.current.value = "";
  }

  async function submitApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsApplying(true);
    setApplyStatus(null);
    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      const pastedCvUrl = fieldValue(formData, "cvUrl");
      if (!cvFile && !pastedCvUrl) {
        setApplyStatus({ tone: "error", message: "Attach your CV file (PDF, DOC or DOCX) or paste a CV link." });
        return;
      }
      let resumeUrl = pastedCvUrl;
      if (cvFile) {
        setPhase("uploading");
        const uploaded = await uploadJobApplicationCv(id, cvFile);
        resumeUrl = uploaded.resumeUrl;
      }
      setPhase("submitting");
      const payload: ApplyForJobPayload = {
        applicantName: fieldValue(formData, "applicantName"),
        applicantEmail: fieldValue(formData, "applicantEmail"),
        phoneNumber: fieldValue(formData, "phoneNumber"),
        coverMessage: fieldValue(formData, "coverMessage"),
        cvUrl: resumeUrl,
      };
      await applyForJob(id, payload);
      form.reset();
      clearCvFile();
      setApplyStatus({ tone: "success", message: "Application submitted. Track it from My Applications." });
    } catch (submitError) {
      setApplyStatus({ tone: "error", message: errorMessage(submitError) });
    } finally {
      setPhase(null);
      setIsApplying(false);
    }
  }

  if (isLoading) {
    return <div className="grid min-h-96 place-items-center rounded-[2rem] border border-[var(--line)] bg-white shadow-[var(--shadow-soft)]"><div className="inline-flex items-center gap-3 text-sm font-black text-[var(--steel)]"><Loader2 className="h-5 w-5 animate-spin text-[var(--signal)]" /> Loading role details</div></div>;
  }

  if (error || !job) {
    return (
      <section className="rounded-[2rem] border border-[var(--danger)] bg-white p-7 text-center shadow-[var(--shadow-soft)]">
        <XCircle className="mx-auto h-10 w-10 text-[var(--danger)]" />
        <h1 className="mt-4 text-2xl font-black tracking-[-0.04em]">Job opportunity unavailable</h1>
        <p className="mt-3 text-sm font-semibold leading-6 text-[var(--steel)]">{error ?? "The backend did not return this job opportunity."}</p>
        <Link href="/jobs" className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white">Back to jobs</Link>
      </section>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_25rem]">
      <section className="overflow-hidden rounded-[2.5rem] border border-[var(--line)] bg-white shadow-[var(--shadow-ledger)]">
        <div className="bg-[var(--ink)] p-6 text-white enterprise-grid md:p-8">
          <Link href="/jobs" className="inline-flex items-center gap-2 text-sm font-black text-white/70 hover:text-[var(--gold)]"><ArrowLeft className="h-4 w-4" /> Back to jobs</Link>
          <div className="mt-8 max-w-4xl">
            <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[var(--gold)]">{job.status} opportunity</p>
            <h1 className="mt-4 text-4xl font-black tracking-[-0.06em] md:text-6xl">{job.title}</h1>
            <p className="mt-4 text-lg font-bold text-white/72">{job.companyName}</p>
          </div>
          <div className="mt-7 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-4 py-2 text-sm font-bold text-white/78"><MapPin className="h-4 w-4 text-[var(--gold)]" /> {job.location}</span>
            <span className="rounded-full border border-white/10 bg-white/[0.08] px-4 py-2 text-sm font-bold text-white/78">{job.workplaceType}</span>
            <span className="rounded-full border border-white/10 bg-white/[0.08] px-4 py-2 text-sm font-bold text-white/78">{job.employmentType}</span>
            <span className="rounded-full border border-white/10 bg-white/[0.08] px-4 py-2 text-sm font-bold text-white/78">{job.experienceLevel}</span>
          </div>
        </div>

        <div className="grid gap-8 p-6 md:p-8">
          {[
            ["Description", job.description],
            ["Responsibilities", job.responsibilities],
            ["Requirements", job.requirements],
            ["Benefits", job.benefits],
          ].map(([heading, copy]) => copy ? (
            <article key={heading} className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface)] p-5">
              <h2 className="text-xl font-black tracking-[-0.03em]">{heading}</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--steel)]">{copy}</p>
            </article>
          ) : null)}
        </div>
      </section>

      <aside className="grid gap-5 self-start xl:sticky xl:top-5">
        <div className="rounded-[2rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)]">
          <div className="grid h-12 w-12 place-items-center rounded-[1.2rem] bg-[var(--ink)] text-[var(--gold)]"><BriefcaseBusiness className="h-6 w-6" /></div>
          <h2 className="mt-5 text-2xl font-black tracking-[-0.04em]">Application options</h2>
          <div className="mt-4 grid gap-3 text-sm font-bold text-[var(--steel)]">
            {job.contactEmail ? <a href={`mailto:${job.contactEmail}`} className="inline-flex items-center gap-2 hover:text-[var(--signal)]"><Mail className="h-4 w-4" /> {job.contactEmail}</a> : null}
            {manageHref ? <Link href={manageHref} className="inline-flex items-center gap-2 text-[var(--signal)] hover:text-[var(--ember)]">Open management view <ArrowRight className="h-4 w-4" /></Link> : null}
          </div>
        </div>

        {job.applicationType === "EXTERNAL" ? (
          <div className="grid gap-4 rounded-[2rem] border border-[var(--signal)]/30 bg-white p-5 shadow-[var(--shadow-soft)]">
            <div>
              <p className="inline-flex rounded-full border border-[var(--signal)]/30 bg-[var(--signal-soft)] px-3 py-1 font-mono text-xs font-black uppercase tracking-[0.16em] text-[var(--signal-strong)]">External posting</p>
              <h2 className="mt-3 text-2xl font-black tracking-[-0.04em]">Apply on the recruiter&apos;s site</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--steel)]">This role is handled outside King Sparkon. Continue on the company website or email your CV directly — applications here are disabled for external posts.</p>
            </div>
            {job.applyUrl ? (
              isEmailTarget(job.applyUrl) ? (
                <a href={job.applyUrl.startsWith("mailto:") ? job.applyUrl : `mailto:${job.applyUrl}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white hover:bg-[var(--ink)]">
                  <Mail className="h-4 w-4" /> Email your application
                </a>
              ) : (
                <a href={job.applyUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white hover:bg-[var(--ink)]">
                  Apply on company website <ArrowRight className="h-4 w-4" />
                </a>
              )
            ) : job.contactEmail ? (
              <a href={`mailto:${job.contactEmail}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white hover:bg-[var(--ink)]">
                <Mail className="h-4 w-4" /> Email your application
              </a>
            ) : (
              <p className="text-sm font-bold text-[var(--steel)]">The recruiter has not provided application contact details yet.</p>
            )}
          </div>
        ) : canApply ? (
          <form onSubmit={submitApplication} className="grid gap-4 rounded-[2rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)]">
            <div>
              <p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-[var(--signal)]">Apply now</p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">Submit application</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--steel)]">Attach your CV file or paste a link. Your application is sent to the backend and can be tracked from My Applications.</p>
            </div>
            {[
              ["applicantName", "Full name", "Example: Sizolwakhe Mkhize", "text"],
              ["applicantEmail", "Email", "you@example.com", "email"],
              ["phoneNumber", "Phone number", "+27...", "tel"],
            ].map(([name, label, placeholder, type]) => (
              <label key={name} className="grid gap-2 text-sm font-black text-[var(--ink)]" htmlFor={name}>
                {label}
                <input id={name} name={name} type={type} required={name === "applicantName" || name === "applicantEmail"} placeholder={placeholder} className="min-h-12 rounded-[1.35rem] border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-semibold outline-none placeholder:text-[var(--muted)] focus:border-[var(--gold)]" />
              </label>
            ))}
            <div className="grid gap-2">
              <span className="text-sm font-black text-[var(--ink)]" id="cv-upload-label">CV / resume <span className="text-[var(--danger)]"> *</span></span>
              <label
                htmlFor="cvFile"
                className="flex cursor-pointer items-center gap-3 rounded-[1.35rem] border border-dashed border-[var(--line-strong)] bg-[var(--surface)] px-4 py-3 transition hover:border-[var(--signal)] focus-within:border-[var(--signal)]"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[var(--line)] bg-white text-[var(--signal)]">
                  {cvFile ? <FileText className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
                </span>
                <span className="min-w-0 flex-1">
                  {cvFile ? (
                    <>
                      <span className="block truncate text-sm font-black text-[var(--ink)]" title={cvFile.name}>{cvFile.name}</span>
                      <span className="block text-xs font-semibold text-[var(--muted)]">{formatBytes(cvFile.size)} • tap to replace</span>
                    </>
                  ) : (
                    <>
                      <span className="block text-sm font-black text-[var(--ink)]">Upload CV (PDF, DOC, DOCX)</span>
                      <span className="block text-xs font-semibold text-[var(--muted)]">Max 10 MB • or paste a link below</span>
                    </>
                  )}
                </span>
                {cvFile ? (
                  <button
                    type="button"
                    onClick={(event) => { event.preventDefault(); clearCvFile(); }}
                    aria-label="Remove selected CV file"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--line)] bg-white text-[var(--danger)] hover:border-[var(--danger)]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
                <input
                  ref={cvInputRef}
                  id="cvFile"
                  name="cvFile"
                  type="file"
                  accept={CV_ACCEPT}
                  aria-labelledby="cv-upload-label"
                  className="sr-only"
                  onChange={(event) => {
                    selectCvFile(event.target.files?.[0] ?? null);
                    event.target.value = "";
                  }}
                />
              </label>
              {cvError ? <p className="text-xs font-bold text-[var(--danger)]" role="alert">{cvError}</p> : null}
              <label className="grid gap-2 text-sm font-black text-[var(--ink)]" htmlFor="cvUrl">
                <span className="text-xs font-bold text-[var(--steel)]">Or paste a CV link instead</span>
                <input id="cvUrl" name="cvUrl" type="url" placeholder="https://..." className="min-h-12 rounded-[1.35rem] border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-semibold outline-none placeholder:text-[var(--muted)] focus:border-[var(--gold)]" />
              </label>
            </div>
            <label className="grid gap-2 text-sm font-black text-[var(--ink)]" htmlFor="coverMessage">
              Cover message
              <textarea id="coverMessage" name="coverMessage" placeholder="Tell the recruiter why you fit this role" className="min-h-32 resize-none rounded-[1.35rem] border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm font-semibold leading-6 outline-none placeholder:text-[var(--muted)] focus:border-[var(--gold)]" />
            </label>
            {applyStatus ? <div className={`flex gap-2 rounded-[1.35rem] border p-3 text-sm font-bold ${applyStatus.tone === "success" ? "border-[var(--confirm)] bg-[var(--confirm)]/10 text-[var(--confirm)]" : "border-[var(--danger)] bg-[var(--danger)]/10 text-[var(--danger)]"}`}>{applyStatus.tone === "success" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />} {applyStatus.message}</div> : null}
            <button type="submit" disabled={isApplying || job.status !== "OPEN"} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white hover:bg-[var(--ink)] disabled:opacity-50">
              {isApplying ? `${phase === "uploading" ? "Uploading CV..." : "Submitting..."}` : "Submit application"} <Send className="h-4 w-4" />
            </button>
          </form>
        ) : null}
      </aside>
    </div>
  );
}
