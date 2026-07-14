"use client";

import { useEffect, useMemo, useState } from "react";
import { Boxes, BriefcaseBusiness, Copy, Download, Image as ImageIcon, Loader2, Ticket, WalletCards } from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Button } from "@/components/ui/Button";
import { listAffiliatePosters, type AffiliatePoster, type AffiliatePosterCategory } from "@/lib/api/affiliate-posters";
import { normalizeApiError } from "@/lib/api/client";

const categories: Array<{ value: "ALL" | AffiliatePosterCategory; label: string }> = [
  { value: "ALL", label: "All posters" },
  { value: "TICKETS", label: "Tickets platform" },
  { value: "PRODUCTS", label: "Products platform" },
  { value: "TIPS", label: "Tips" },
  { value: "JOB_OPPORTUNITIES", label: "Job opportunities" },
];

function categoryLabel(category: AffiliatePosterCategory) {
  return categories.find((item) => item.value === category)?.label ?? category;
}

function CategoryIcon({ category }: { category: AffiliatePosterCategory }) {
  if (category === "TICKETS") return <Ticket className="h-5 w-5" />;
  if (category === "PRODUCTS") return <Boxes className="h-5 w-5" />;
  if (category === "TIPS") return <WalletCards className="h-5 w-5" />;
  return <BriefcaseBusiness className="h-5 w-5" />;
}

export function AffiliatePosterGallery() {
  const [posters, setPosters] = useState<AffiliatePoster[]>([]);
  const [filter, setFilter] = useState<"ALL" | AffiliatePosterCategory>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    listAffiliatePosters()
      .then((rows) => {
        if (!mounted) return;
        setPosters(Array.isArray(rows) ? rows.filter((row) => row.active !== false) : []);
        setError(null);
      })
      .catch((exception) => {
        if (mounted) setError(normalizeApiError(exception).message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const visible = useMemo(
    () => (filter === "ALL" ? posters : posters.filter((poster) => poster.category === filter)),
    [filter, posters],
  );

  async function copyCaption(poster: AffiliatePoster) {
    const caption = [poster.title, poster.description].filter(Boolean).join("\n\n");
    await navigator.clipboard.writeText(caption);
    setCopied(poster.id);
    window.setTimeout(() => setCopied(null), 1600);
  }

  return (
    <>
      <DashboardHeader
        role="AFFILIATE"
        title="Campaign posters"
        description="Download administrator-approved posters for Tickets, Products, Tips and Job Opportunities, then share them with your tracked affiliate link."
      />
      <main className="grid gap-6 bg-[var(--surface)] p-5 md:p-8">
        <section className="rounded-[2rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-ledger)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.16em] text-[var(--signal)]">Approved creative library</p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[var(--ink)]">Ready-to-share visual campaigns</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--steel)]">Every image is uploaded by an administrator. Pair the poster with your tracked referral link so paid Plus and Pro conversions are attributed to you.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className={`min-h-10 rounded-full border px-4 text-xs font-black uppercase tracking-[0.08em] transition ${filter === item.value ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--gold)]" : "border-[var(--line)] bg-white text-[var(--steel)] hover:border-[var(--gold)]"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {error ? <p className="rounded-[1.25rem] border border-[var(--danger)]/30 bg-white p-4 text-sm font-bold text-[var(--danger)]">{error}</p> : null}

        {loading ? (
          <div className="flex min-h-64 items-center justify-center gap-3 rounded-[2rem] border border-[var(--line)] bg-white text-sm font-black text-[var(--steel)]"><Loader2 className="h-5 w-5 animate-spin" /> Loading campaign posters</div>
        ) : visible.length ? (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((poster) => (
              <article key={poster.id} className="overflow-hidden rounded-[1.8rem] border border-[var(--line)] bg-white shadow-[var(--shadow-soft)]">
                <div className="relative aspect-[4/5] overflow-hidden bg-[var(--ink)]">
                  <img src={poster.imageUrl} alt={poster.title} className="h-full w-full object-cover transition duration-300 hover:scale-[1.02]" />
                  <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-[var(--ink)]/85 px-3 py-2 text-[0.65rem] font-black uppercase tracking-[0.12em] text-[var(--gold)] backdrop-blur">
                    <CategoryIcon category={poster.category} /> {categoryLabel(poster.category)}
                  </span>
                </div>
                <div className="grid gap-4 p-5">
                  <div>
                    <h3 className="text-xl font-black tracking-[-0.035em] text-[var(--ink)]">{poster.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--steel)]">{poster.description || "Use this administrator-approved poster with your affiliate referral link."}</p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <a href={poster.imageUrl} target="_blank" rel="noreferrer" download className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--ink)] bg-[var(--ink)] px-4 text-sm font-black text-white hover:bg-[var(--signal)]">
                      <Download className="h-4 w-4" /> Download poster
                    </a>
                    <Button type="button" variant="quiet" onClick={() => void copyCaption(poster)}>
                      <Copy className="h-4 w-4" /> {copied === poster.id ? "Caption copied" : "Copy caption"}
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="rounded-[2rem] border border-dashed border-[var(--line-strong)] bg-white p-12 text-center shadow-[var(--shadow-soft)]">
            <ImageIcon className="mx-auto h-10 w-10 text-[var(--signal)]" />
            <h2 className="mt-4 text-2xl font-black tracking-[-0.04em] text-[var(--ink)]">No posters uploaded yet</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--steel)]">An administrator can upload posters from the Admin Affiliates workspace. They will appear here immediately after upload.</p>
          </section>
        )}
      </main>
    </>
  );
}
