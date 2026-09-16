"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { BriefcaseBusiness, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { createJobOpportunity } from "@/lib/api/job-opportunities";
import type { CreateJobOpportunityPayload, EmploymentType, ExperienceLevel, JobApplicationType, WorkplaceType } from "@/lib/types/backend";
import { messageFromBackendPayload } from "@/lib/utils/errors";

const workplaceTypes: Array<{ value: WorkplaceType; label: string }> = [
  { value: "ONSITE", label: "On-site" },
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
];

const employmentTypes: Array<{ value: EmploymentType; label: string }> = [
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "TEMPORARY", label: "Temporary" },
];

const experienceLevels: Array<{ value: ExperienceLevel; label: string }> = [
  { value: "ENTRY_LEVEL", label: "Entry level" },
  { value: "JUNIOR", label: "Junior" },
  { value: "MID_LEVEL", label: "Mid-level" },
  { value: "SENIOR", label: "Senior" },
  { value: "LEAD", label: "Lead" },
  { value: "EXECUTIVE", label: "Executive" },
];

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function optionalNumber(formData: FormData, key: string) {
  const value = text(formData, key);
  return value ? Number(value) : undefined;
}

function errorMessage(error: unknown) {
  return axios.isAxiosError(error) ? messageFromBackendPayload(error.response?.data) : "Unable to save this job opportunity.";
}

export function JobOpportunityForm({ audience = "owner" }: { audience?: "owner" | "admin" }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [applicationType, setApplicationType] = useState<JobApplicationType>("INTERNAL");

  function isValidExternalTarget(value: string) {
    const trimmed = value.trim();
    if (/^https?:\/\/[^\s]+\.[^\s]{2,}/i.test(trimmed)) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  }

  async function submitJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      const formData = new FormData(event.currentTarget);
      const externalTarget = text(formData, "applyUrl");
      if (applicationType === "EXTERNAL" && !isValidExternalTarget(externalTarget)) {
        setStatus({ tone: "error", message: "External posts need an application website (https://…) or email address." });
        return;
      }
      const payload: CreateJobOpportunityPayload = {
        title: text(formData, "title"),
        companyName: text(formData, "companyName"),
        location: text(formData, "location"),
        workplaceType: text(formData, "workplaceType") as WorkplaceType,
        employmentType: text(formData, "employmentType") as EmploymentType,
        experienceLevel: text(formData, "experienceLevel") as ExperienceLevel,
        salaryMin: optionalNumber(formData, "salaryMin"),
        salaryMax: optionalNumber(formData, "salaryMax"),
        salaryCurrency: text(formData, "salaryCurrency") || "ZAR",
        description: text(formData, "description"),
        responsibilities: text(formData, "responsibilities"),
        requirements: text(formData, "requirements"),
        benefits: text(formData, "benefits"),
        applicationType,
        applyUrl: applicationType === "EXTERNAL" ? externalTarget : "",
        contactEmail: text(formData, "contactEmail"),
      };

      await createJobOpportunity(payload);
      setStatus({ tone: "success", message: "Job opportunity saved. Publish it from the job board when it is ready." });
      router.push(`/dashboard/${audience}/jobs`);
    } catch (error) {
      setStatus({ tone: "error", message: errorMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="grid gap-6">
      <div className="rounded-[2.4rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-ledger)] md:p-7">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[var(--signal)]">Post a job</p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.055em] md:text-6xl">Create job opportunity</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--steel)] md:text-base">Owners and admins can create professional roles for users to discover and apply to. Required fields are labelled clearly.</p>
          </div>
          <div className="grid h-14 w-14 place-items-center rounded-[1.35rem] bg-[var(--ink)] text-[var(--gold)]"><BriefcaseBusiness className="h-7 w-7" /></div>
        </div>
      </div>

      <form onSubmit={submitJob} className="grid gap-5 rounded-[2.4rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)] md:p-7">
        <div className="grid gap-5 md:grid-cols-2">
          <Field name="title" label="Job title" placeholder="Senior Frontend Developer" required />
          <Field name="companyName" label="Company name" placeholder="King Sparkon Partner Business" required />
          <Field name="location" label="Location" placeholder="Johannesburg, South Africa" required />
          <Field name="salaryCurrency" label="Salary currency" placeholder="ZAR" defaultValue="ZAR" />
          <Field name="salaryMin" label="Salary min" placeholder="25000" type="number" />
          <Field name="salaryMax" label="Salary max" placeholder="65000" type="number" />
          <Select name="workplaceType" label="Workplace type" options={workplaceTypes} />
          <Select name="employmentType" label="Employment type" options={employmentTypes} />
          <Select name="experienceLevel" label="Experience level" options={experienceLevels} />
          <Field name="contactEmail" label="Contact email" placeholder="recruitment@example.com" type="email" />
        </div>

        <fieldset className="grid gap-3">
          <legend className="text-sm font-black text-[var(--ink)]">How do candidates apply? <span className="text-[var(--danger)]"> *</span></legend>
          <div className="grid gap-3 md:grid-cols-2">
            {([
              { value: "INTERNAL", title: "Internal application", copy: "Candidates apply with the in-app form, CV upload and tracking." },
              { value: "EXTERNAL", title: "External application", copy: "Candidates are redirected to your website or email. No in-app form." },
            ] as const).map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer items-start gap-3 rounded-[1.35rem] border p-4 transition ${applicationType === option.value ? "border-[var(--signal)] bg-[var(--signal-soft)]" : "border-[var(--line)] bg-[var(--surface)] hover:border-[var(--line-strong)]"}`}
              >
                <input
                  type="radio"
                  name="applicationType"
                  value={option.value}
                  checked={applicationType === option.value}
                  onChange={() => setApplicationType(option.value)}
                  className="mt-1 h-4 w-4 accent-[#22d3ee]"
                />
                <span>
                  <span className="block text-sm font-black text-[var(--ink)]">{option.title}</span>
                  <span className="mt-1 block text-xs font-semibold leading-5 text-[var(--steel)]">{option.copy}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {applicationType === "EXTERNAL" ? (
          <Field name="applyUrl" label="Application website or email" placeholder="https://company.com/careers or jobs@company.com" required />
        ) : null}

        <Textarea name="description" label="Description" placeholder="Explain the role, team, product, and why the opportunity matters." required />
        <Textarea name="responsibilities" label="Responsibilities" placeholder="List the daily responsibilities and delivery expectations." />
        <Textarea name="requirements" label="Requirements" placeholder="List skills, experience, tools, and must-have qualifications." required />
        <Textarea name="benefits" label="Benefits" placeholder="Hybrid work, training budget, equipment, bonuses, etc." />

        {status ? <div className={`flex gap-2 rounded-[1.35rem] border p-3 text-sm font-bold ${status.tone === "success" ? "border-[var(--confirm)] bg-[var(--confirm)]/10 text-[var(--confirm)]" : "border-[var(--danger)] bg-[var(--danger)]/10 text-[var(--danger)]"}`}>{status.tone === "success" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />} {status.message}</div> : null}

        <button type="submit" disabled={isSubmitting} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-6 text-sm font-black text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ink)] disabled:opacity-50">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isSubmitting ? "Saving job..." : "Save job opportunity"}
        </button>
      </form>
    </section>
  );
}

function Field({ name, label, placeholder, type = "text", required = false, defaultValue }: { name: string; label: string; placeholder: string; type?: string; required?: boolean; defaultValue?: string }) {
  return (
    <label className="grid gap-2 text-sm font-black text-[var(--ink)]" htmlFor={name}>
      <span>{label}{required ? <span className="text-[var(--danger)]"> *</span> : null}</span>
      <input id={name} name={name} type={type} required={required} defaultValue={defaultValue} placeholder={placeholder} className="min-h-12 rounded-[1.35rem] border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-semibold outline-none placeholder:text-[var(--muted)] focus:border-[var(--gold)]" />
    </label>
  );
}

function Select<T extends string>({ name, label, options }: { name: string; label: string; options: Array<{ value: T; label: string }> }) {
  return (
    <label className="grid gap-2 text-sm font-black text-[var(--ink)]" htmlFor={name}>
      {label}<span className="sr-only"> required</span>
      <select id={name} name={name} required className="min-h-12 rounded-[1.35rem] border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-semibold outline-none focus:border-[var(--gold)]">
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function Textarea({ name, label, placeholder, required = false }: { name: string; label: string; placeholder: string; required?: boolean }) {
  return (
    <label className="grid gap-2 text-sm font-black text-[var(--ink)]" htmlFor={name}>
      <span>{label}{required ? <span className="text-[var(--danger)]"> *</span> : null}</span>
      <textarea id={name} name={name} required={required} placeholder={placeholder} className="min-h-36 resize-none rounded-[1.35rem] border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm font-semibold leading-6 outline-none placeholder:text-[var(--muted)] focus:border-[var(--gold)]" />
    </label>
  );
}
