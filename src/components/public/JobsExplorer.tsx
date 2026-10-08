"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { PublicJob } from "@/lib/public/data";

function excerpt(text: string, length = 140) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > length ? `${clean.slice(0, length).trimEnd()}…` : clean;
}

export function JobsExplorer({ jobs }: { jobs: PublicJob[] }) {
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return jobs;
    return jobs.filter((job) =>
      [job.title, job.companyName, job.location, job.description].some((field) => field?.toLowerCase().includes(needle)),
    );
  }, [jobs, query]);

  return (
    <div>
      <label className="flex w-full items-center gap-3 rounded-full border border-[var(--ks-line)] ks-surface px-5 py-3 md:max-w-md">
        <span className="sr-only">Search job posts</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search title, company or location"
          className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--ks-muted)]"
        />
      </label>
      <p className="mt-4 text-sm text-[var(--ks-muted)]" aria-live="polite">
        {visible.length} {visible.length === 1 ? "job post" : "job posts"} shown
      </p>

      {visible.length > 0 ? (
        <ul className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((job) => (
            <li key={job.id}>
              <Link href={`/jobs/${job.id}`} className="ks-card flex h-full flex-col">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--ks-muted)]">
                  {job.companyName} · {job.location}
                </p>
                <h3 className="mt-3 text-lg font-extrabold leading-tight">{job.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--ks-muted)]">{excerpt(job.description ?? "")}</p>
                <span className="mt-auto pt-6 text-sm font-bold">View post →</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-10 rounded-[var(--ks-radius)] border border-dashed border-[var(--ks-line)] p-8 text-center text-sm text-[var(--ks-muted)]">
          {jobs.length === 0 ? "No open job posts right now. New posts appear here when businesses publish them." : "No job posts match that search."}
        </p>
      )}
    </div>
  );
}
