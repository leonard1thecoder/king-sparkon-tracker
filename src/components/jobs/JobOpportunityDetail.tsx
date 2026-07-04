"use client";

import axios from "axios";
import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, CheckCircle2, Loader2, Mail, MapPin, Phone, Send, XCircle } from "lucide-react";
import { applyForJob, getJobById } from "@/lib/api/job-opportunities";
import type { ApplyForJobPayload, JobOpportunity } from "@/lib/types/backend";
import { messageFromBackendPayload } from "@/lib/utils/errors";

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
  const [error, setError] = useState<string | null>(null);
  const [applyStatus, setApplyStatus] = useState<{ tone: "success" | "error"; message: string } | null>(null);

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

  async function submitApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsApplying(true);
    setApplyStatus(null);
    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      const payload: ApplyForJobPayload = {
        applicantName: fieldValue(formData, "applicantName"),
        applicantEmail: fieldValue(formData, "applicantEmail"),
        phoneNumber: fieldValue(formData, "phoneNumber"),
        coverMessage: fieldValue(formData, "coverMessage"),
        cvUrl: fieldValue(formData, "cvUrl"),
      };
      await applyForJob(id, payload);
      form.reset();
      setApplyStatus({ tone: "success", message: "Application submitted. Track it from My Applications." });
    } catch (submitError) {
      setApplyStatus({ tone: "error", message: errorMessage(submitError) });
    } finally {
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
            {job.whatsappNumber ? <a href={`https://wa.me/${job.whatsappNumber.replace(/\D/g, "")}`} className="inline-flex items-center gap-2 hover:text-[var(--signal)]"><Phone className="h-4 w-4" /> WhatsApp recruiter</a> : null}
            {job.applyUrl ? <a href={job.applyUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[var(--signal)] hover:text-[var(--ember)]">External application <ArrowRight className="h-4 w-4" /></a> : null}
            {manageHref ? <Link href={manageHref} className="inline-flex items-center gap-2 text-[var(--signal)] hover:text-[var(--ember)]">Open management view <ArrowRight className="h-4 w-4" /></Link> : null}
          </div>
        </div>

        {canApply ? (
          <form onSubmit={submitApplication} className="grid gap-4 rounded-[2rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)]">
            <div>
              <p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-[var(--signal)]">Apply now</p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">Submit application</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--steel)]">Your application is sent to the backend and can be tracked from My Applications.</p>
            </div>
            {[
              ["applicantName", "Full name", "Example: Sizolwakhe Mkhize", "text"],
              ["applicantEmail", "Email", "you@example.com", "email"],
              ["phoneNumber", "Phone / WhatsApp", "+27...", "tel"],
              ["cvUrl", "CV / resume link", "https://...", "url"],
            ].map(([name, label, placeholder, type]) => (
              <label key={name} className="grid gap-2 text-sm font-black text-[var(--ink)]" htmlFor={name}>
                {label}
                <input id={name} name={name} type={type} required={name === "applicantName" || name === "applicantEmail" || name === "cvUrl"} placeholder={placeholder} className="min-h-12 rounded-[1.35rem] border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-semibold outline-none placeholder:text-[var(--muted)] focus:border-[var(--gold)]" />
              </label>
            ))}
            <label className="grid gap-2 text-sm font-black text-[var(--ink)]" htmlFor="coverMessage">
              Cover message
              <textarea id="coverMessage" name="coverMessage" placeholder="Tell the recruiter why you fit this role" className="min-h-32 resize-none rounded-[1.35rem] border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm font-semibold leading-6 outline-none placeholder:text-[var(--muted)] focus:border-[var(--gold)]" />
            </label>
            {applyStatus ? <div className={`flex gap-2 rounded-[1.35rem] border p-3 text-sm font-bold ${applyStatus.tone === "success" ? "border-[var(--confirm)] bg-[var(--confirm)]/10 text-[var(--confirm)]" : "border-[var(--danger)] bg-[var(--danger)]/10 text-[var(--danger)]"}`}>{applyStatus.tone === "success" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />} {applyStatus.message}</div> : null}
            <button type="submit" disabled={isApplying || job.status !== "OPEN"} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white hover:bg-[var(--ink)] disabled:opacity-50">
              {isApplying ? "Submitting..." : "Submit application"} <Send className="h-4 w-4" />
            </button>
          </form>
        ) : null}
      </aside>
    </div>
  );
}
