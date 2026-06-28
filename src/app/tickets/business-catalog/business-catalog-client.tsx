"use client";

import { useEffect, useState } from "react";
import { Building2, CheckCircle2, Sparkles } from "lucide-react";
import { followBusiness, getBusinessCatalog, unfollowBusiness } from "@/services/ticketEngagementService";
import type { BusinessCatalogItem } from "@/types/tickets";

export function BusinessCatalogClient() {
  const [items, setItems] = useState<BusinessCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBusinessCatalog()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  async function toggleFollow(item: BusinessCatalogItem) {
    const response = item.following ? await unfollowBusiness(item.businessId) : await followBusiness(item.businessId);
    setItems((current) => current.map((candidate) => (candidate.businessId === item.businessId ? { ...candidate, following: response.following } : candidate)));
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-12 md:px-8 lg:py-16">
      <section className="rounded-[2.5rem] border border-[var(--line)] bg-white p-6 shadow-[var(--shadow-ledger)] md:p-8">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[var(--signal)]">Business catalog</p>
            <h1 className="mt-4 text-4xl font-black tracking-[-0.05em] md:text-6xl">Follow event businesses after login.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--steel)] md:text-base">
              Users can discover ticket businesses, follow the ones they trust, and still see paid promoted events from businesses they do not follow.
            </p>
          </div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5">
            <Sparkles className="h-5 w-5 text-[var(--signal)]" />
            <p className="mt-3 text-sm leading-7 text-[var(--steel)]">
              Ticket promotion costs <strong className="text-[var(--ink)]">R1500</strong> and is displayed to users even when they are not following the business.
              Business logos will load from Supabase once the environment variables are added.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-48 rounded-[2rem] border border-[var(--line)] bg-[var(--surface)]" />)
        ) : (
          items.map((item) => (
            <article key={item.businessId} className="rounded-[2rem] border border-[var(--line)] bg-white p-6 shadow-[var(--shadow-soft)]">
              <div className="flex items-start justify-between gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-[1.25rem] border border-[var(--line)] bg-[var(--surface)] text-[var(--signal)]">
                  <Building2 className="h-6 w-6" />
                </div>
                {item.following ? <span className="inline-flex items-center gap-1 rounded-full border border-[var(--confirm)]/25 bg-[var(--confirm)]/10 px-3 py-1 text-xs font-black text-[var(--confirm)]"><CheckCircle2 className="h-3.5 w-3.5" /> Following</span> : null}
              </div>
              <h2 className="mt-5 text-2xl font-black tracking-[-0.04em]">{item.businessName}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--steel)]">{item.eventCount} ticket event{item.eventCount === 1 ? "" : "s"} available.</p>
              <button type="button" onClick={() => toggleFollow(item)} className={`mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full border px-4 text-sm font-black ${item.following ? "border-[var(--line)] bg-white text-[var(--steel)] hover:border-[var(--signal)]" : "border-[var(--signal)] bg-[var(--signal)] text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ember)]"}`}>
                {item.following ? "Unfollow business" : "Follow business"}
              </button>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
