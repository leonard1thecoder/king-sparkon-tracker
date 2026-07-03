import Link from "next/link";
import { ArrowRight, BadgeCheck, BriefcaseBusiness, Globe2, UsersRound } from "lucide-react";

const jobStats = [
  ["1,000+", "LinkedIn professional connections", "Global network across software, business, retail, events, and operations."],
  ["2,400+", "Job hunts", "Job seekers can discover roles, save opportunities, and apply from a cleaner platform flow."],
  ["1,200+", "Potential employees", "Business owners can build a talent pipeline before hiring becomes urgent."],
  ["320+", "Open posts", "Role posts, hiring notices, internships, contract work, and business opportunities."],
] as const;

const jobHighlights = [
  "Easy platform for employees and job hunters to find business opportunities.",
  "Owners can publish open posts and review potential employees from one dashboard.",
  "Job seekers can move from discovery to application without losing the business context.",
] as const;

export function JobOpportunitiesSection() {
  return (
    <section id="jobs" className="scroll-mt-28 px-5 py-16 md:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.75rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-ledger)] md:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--signal)]">04 / job opportunities</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.055em] md:text-6xl">A jobs engine built from real professional connection.</h2>
          </div>
          <div>
            <p className="text-sm leading-7 text-[var(--steel)] md:text-base">
              King Sparkon has more than <span className="font-black text-[var(--ink)]">1,000 professional LinkedIn connections</span> across the world. The jobs layer turns that network energy into a simple platform for employees, job hunters, business owners, and open posts.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/jobs" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-6 font-bold text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ink)]">
                Explore job posts <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/dashboard/owner/jobs" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--line)] bg-white px-6 font-bold text-[var(--ink)] shadow-[var(--shadow-soft)] hover:border-[var(--gold)]">
                Post opportunity
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {jobStats.map(([value, label, copy]) => (
            <article key={label} className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow-soft)] hover:-translate-y-1 hover:border-[var(--gold)]">
              <p className="font-mono text-4xl font-black tracking-[-0.08em] text-[var(--ink)]">{value}</p>
              <h3 className="mt-4 text-xl font-black tracking-[-0.03em]">{label}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--steel)]">{copy}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div className="rounded-[2rem] bg-[var(--ink)] p-6 text-white shadow-[var(--shadow-depth)] scan-grid">
            <div className="grid h-14 w-14 place-items-center rounded-[1.25rem] bg-[var(--gold)] text-[var(--ink)]">
              <BriefcaseBusiness className="h-6 w-6" />
            </div>
            <h3 className="mt-6 text-3xl font-black tracking-[-0.05em]">Business logic meets hiring logic.</h3>
            <p className="mt-3 text-sm leading-7 text-white/66">The same platform that tracks barcode inventory, tickets, and campaigns can expose hiring demand and match it to real people.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {jobHighlights.map((item, index) => (
              <div key={item} className="rounded-[1.65rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)]">
                {index === 0 ? <Globe2 className="h-5 w-5 text-[var(--signal)]" /> : index === 1 ? <UsersRound className="h-5 w-5 text-[var(--signal)]" /> : <BadgeCheck className="h-5 w-5 text-[var(--signal)]" />}
                <p className="mt-4 text-sm font-bold leading-6 text-[var(--steel)]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
