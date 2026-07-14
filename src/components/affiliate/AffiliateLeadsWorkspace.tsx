"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgeDollarSign, Filter, Mail, MessageCircle, Phone, Search, Target, UsersRound } from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { getAffiliateLeads, type AffiliateLead } from "@/lib/api/affiliate";
import { normalizeApiError } from "@/lib/api/client";

function contactHref(lead: AffiliateLead) {
  return lead.contactType === "EMAIL" ? `mailto:${lead.contactValue}` : `tel:${lead.contactValue}`;
}

function dateLabel(value?: string | null) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-ZA", { dateStyle: "medium" }).format(date);
}

export function AffiliateLeadsWorkspace() {
  const [leads, setLeads] = useState<AffiliateLead[]>([]);
  const [query, setQuery] = useState("");
  const [channel, setChannel] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getAffiliateLeads(0, 100)
      .then((response) => {
        if (!mounted) return;
        setLeads(response.content ?? []);
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

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchesChannel = channel === "ALL" || lead.preferredChannel === channel;
      const matchesQuery = !normalized || [lead.contactValue, lead.niche, lead.source, lead.opportunity, lead.subscriberType]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
      return matchesChannel && matchesQuery;
    });
  }, [channel, leads, query]);

  const emailLeads = leads.filter((lead) => lead.contactType === "EMAIL").length;
  const whatsappLeads = leads.filter((lead) => lead.contactType === "CELLPHONE").length;
  const unregisteredAffiliates = leads.filter((lead) => lead.subscriberType === "AFFILIATE" && !lead.affiliateRegistered).length;

  return (
    <>
      <DashboardHeader
        role="AFFILIATE"
        title="Affiliate Leads"
        description="Review active subscriber contacts, understand their likely niche, and use the recommended approach before sending your tracked pricing link."
      />
      <main className="grid gap-6 bg-[var(--surface)] p-5 md:p-8">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Active leads" value={String(leads.length)} detail="Subscriber contacts available" tone="confirm" icon={<UsersRound className="h-5 w-5" />} />
          <MetricCard label="Email leads" value={String(emailLeads)} detail="Best for detailed proposals" icon={<Mail className="h-5 w-5" />} />
          <MetricCard label="Phone / WhatsApp" value={String(whatsappLeads)} detail="Best for quick conversations" tone="signal" icon={<MessageCircle className="h-5 w-5" />} />
          <MetricCard label="Affiliate prospects" value={String(unregisteredAffiliates)} detail="Not registered as affiliates yet" icon={<BadgeDollarSign className="h-5 w-5" />} />
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Find the right lead</CardTitle>
            <p className="mt-2 text-sm leading-6 text-[var(--steel)]">Use the operational niche and suggested conversation angle. Commission is earned when a referred business completes a qualifying Plus or Pro subscription through your tracked link.</p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 lg:grid-cols-[1fr_16rem]">
              <label className="flex min-h-12 items-center gap-3 rounded-[1.1rem] border border-[var(--line)] bg-white px-4 focus-within:border-[var(--signal)]">
                <Search className="h-4 w-4 text-[var(--signal)]" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search contact, niche, source or opportunity" className="w-full bg-transparent text-sm font-bold outline-none" />
              </label>
              <label className="flex min-h-12 items-center gap-3 rounded-[1.1rem] border border-[var(--line)] bg-white px-4">
                <Filter className="h-4 w-4 text-[var(--signal)]" />
                <select value={channel} onChange={(event) => setChannel(event.target.value)} className="w-full bg-transparent text-sm font-black outline-none">
                  <option value="ALL">All channels</option>
                  <option value="EMAIL">Email</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="ANY">Any channel</option>
                </select>
              </label>
            </div>
          </CardContent>
        </Card>

        {error ? <p className="rounded-[1.25rem] border border-[var(--danger)]/30 bg-white p-4 text-sm font-bold text-[var(--danger)]">{error}</p> : null}

        <section className="grid gap-4">
          {loading ? (
            <div className="rounded-[2rem] border border-[var(--line)] bg-white p-12 text-center text-sm font-black text-[var(--steel)]">Loading subscriber leads...</div>
          ) : visible.length ? visible.map((lead) => (
            <article key={lead.id} className="grid gap-5 rounded-[1.75rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)] xl:grid-cols-[0.8fr_0.9fr_1.3fr_auto] xl:items-center">
              <div>
                <p className="font-mono text-[0.62rem] font-black uppercase tracking-[0.14em] text-[var(--muted)]">Contact</p>
                <a href={contactHref(lead)} className="mt-2 inline-flex items-center gap-2 break-all text-base font-black text-[var(--ink)] hover:text-[var(--signal)]">
                  {lead.contactType === "EMAIL" ? <Mail className="h-4 w-4 shrink-0" /> : <Phone className="h-4 w-4 shrink-0" />}
                  {lead.contactValue}
                </a>
                <div className="mt-3 flex flex-wrap gap-2">
                  <StatusPill label={lead.preferredChannel} tone="signal" />
                  <StatusPill label={lead.subscriberType} tone="neutral" />
                </div>
              </div>
              <div>
                <p className="font-mono text-[0.62rem] font-black uppercase tracking-[0.14em] text-[var(--muted)]">Likely niche</p>
                <p className="mt-2 font-black leading-6 text-[var(--ink)]">{lead.niche}</p>
                <p className="mt-2 text-xs font-semibold text-[var(--muted)]">Source: {lead.source || "Direct"} · Added {dateLabel(lead.createdDate)}</p>
              </div>
              <div className="rounded-[1.25rem] border border-[var(--gold)]/45 bg-[var(--gold)]/12 p-4">
                <p className="inline-flex items-center gap-2 font-mono text-[0.62rem] font-black uppercase tracking-[0.14em] text-[var(--signal)]"><Target className="h-4 w-4" /> Recommended lead angle</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-[var(--steel)]">{lead.opportunity}</p>
              </div>
              <a href={contactHref(lead)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--ink)] bg-[var(--ink)] px-5 text-sm font-black text-white hover:bg-[var(--signal)]">
                {lead.contactType === "EMAIL" ? <Mail className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                Contact lead
              </a>
            </article>
          )) : (
            <div className="rounded-[2rem] border border-dashed border-[var(--line-strong)] bg-white p-12 text-center shadow-[var(--shadow-soft)]">
              <UsersRound className="mx-auto h-10 w-10 text-[var(--signal)]" />
              <h2 className="mt-4 text-2xl font-black tracking-[-0.04em] text-[var(--ink)]">No leads match the filters</h2>
              <p className="mt-2 text-sm text-[var(--steel)]">Clear the search or channel filter to view more subscriber contacts.</p>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
