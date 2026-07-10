"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeDollarSign,
  BarChart3,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Database,
  ExternalLink,
  Link2,
  Loader2,
  Megaphone,
  QrCode,
  RefreshCw,
  Share2,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusPill } from "@/components/ui/StatusPill";
import {
  getAffiliateAssets,
  getAffiliateCommissions,
  getAffiliatePayouts,
  getAffiliateProfile,
  getAffiliateReferrals,
} from "@/lib/api/affiliate";
import { normalizeApiError } from "@/lib/api/client";
import {
  affiliateMockAssets,
  affiliateMockCommissions,
  affiliateMockPayouts,
  affiliateMockProfile,
  affiliateMockReferrals,
  type AffiliateAssetRow,
  type AffiliateCommissionRow,
  type AffiliatePayoutRow,
  type AffiliateProfileView,
  type AffiliateReferralRow,
} from "@/lib/mock/affiliate";

type AffiliateSection = "overview" | "referrals" | "assets" | "commissions" | "payouts";
type SourceState = "backend" | "preview" | "mixed";
type UnknownRecord = Record<string, unknown>;

const PAGE_SIZE = 5;

const sectionCopy: Record<AffiliateSection, { title: string; description: string; objective: string }> = {
  overview: {
    title: "Affiliate growth overview",
    description: "Track the complete path from shared referral link to converted business, earned commission, and settled payout.",
    objective: "Know what to share next, what converted, what you earned, and what is ready to be paid.",
  },
  referrals: {
    title: "Referral links",
    description: "Share one tracked promotion link and QR code, then monitor every referred business through the conversion funnel.",
    objective: "Create measurable business registrations from one copy-ready referral identity.",
  },
  assets: {
    title: "Campaign assets",
    description: "Use channel-ready WhatsApp, social, email, and QR copy without rewriting the King Sparkon value proposition each time.",
    objective: "Give affiliates reusable, consistent material that always points back to their tracked referral link.",
  },
  commissions: {
    title: "Commissions",
    description: "Review which referred businesses generated earnings and whether each commission is pending, approved, or paid.",
    objective: "Make every earned amount traceable to its business, rate, date, and settlement state.",
  },
  payouts: {
    title: "Payouts",
    description: "Track payout requests from processing through provider settlement and confirm when affiliate earnings reached the payment account.",
    objective: "Separate earned commission from money that has actually been transferred.",
  },
};

const navCards = [
  { label: "Referral Links", href: "/dashboard/affiliate/referrals", detail: "Share link + QR", icon: Link2 },
  { label: "Campaign Assets", href: "/dashboard/affiliate/assets", detail: "Copy-ready promotion", icon: Megaphone },
  { label: "Commissions", href: "/dashboard/affiliate/commissions", detail: "Earnings ledger", icon: BarChart3 },
  { label: "Payouts", href: "/dashboard/affiliate/payouts", detail: "Settlement history", icon: WalletCards },
] as const;

function asRecord(value: unknown): UnknownRecord {
  return typeof value === "object" && value !== null ? (value as UnknownRecord) : {};
}

function recordsFromPayload(value: unknown): UnknownRecord[] {
  if (Array.isArray(value)) return value.map(asRecord);
  const record = asRecord(value);
  for (const key of ["content", "data", "items", "results", "referrals", "assets", "commissions", "payouts"]) {
    if (Array.isArray(record[key])) return (record[key] as unknown[]).map(asRecord);
  }
  return Object.keys(record).length ? [record] : [];
}

function text(record: UnknownRecord, keys: string[], fallback = "") {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number") return String(value);
  }
  return fallback;
}

function numberValue(record: UnknownRecord, keys: string[], fallback = 0) {
  for (const key of keys) {
    const value = Number(record[key]);
    if (Number.isFinite(value)) return value;
  }
  return fallback;
}

function money(value: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(Number(value || 0));
}

function dateTime(value?: string | null) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-ZA", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function statusTone(status: string) {
  const normalized = status.toUpperCase();
  if (["ACTIVE", "READY", "CONVERTED", "APPROVED", "PAID", "SUCCESS"].includes(normalized)) return "confirm" as const;
  if (["TRIAL", "QUALIFIED", "PENDING", "PROCESSING", "CONTACTED"].includes(normalized)) return "signal" as const;
  return "neutral" as const;
}

function normalizeProfile(payload: unknown): AffiliateProfileView | null {
  const record = asRecord(payload);
  if (!Object.keys(record).length) return null;
  const nested = asRecord(record.user ?? record.profile ?? record.affiliate);
  const merged = { ...record, ...nested };
  const code = text(merged, ["affiliateCode", "referralCode", "code"]);
  const referralUrl = text(merged, ["affiliatePromotionUrl", "referralUrl", "promotionUrl", "affiliateUrl"]);
  if (!code && !referralUrl) return null;

  return {
    name: text(merged, ["fullName", "name", "username"], "Affiliate partner"),
    email: text(merged, ["emailAddress", "email"], "Not supplied"),
    code: code || "Affiliate code pending",
    referralUrl: referralUrl || `/register?ref=${encodeURIComponent(code)}`,
    qrCodeUrl: text(merged, ["affiliateQrCodeUrl", "qrCodeUrl"], "") || null,
    status: text(merged, ["affiliateStatus", "status"], "ACTIVE"),
    joinedAt: text(merged, ["createdAt", "joinedAt", "registrationDate"], ""),
  };
}

function normalizeReferrals(payload: unknown): AffiliateReferralRow[] {
  return recordsFromPayload(payload).map((record, index) => ({
    id: numberValue(record, ["id", "referralId"], 9000 + index),
    businessName: text(record, ["businessName", "companyName", "name"], `Referred business ${index + 1}`),
    contactName: text(record, ["contactName", "ownerName", "username", "emailAddress"], "Lead contact"),
    source: text(record, ["source", "channel", "campaign"], "Referral link"),
    clicks: numberValue(record, ["clicks", "clickCount", "visits"]),
    signups: numberValue(record, ["signups", "registrations", "conversionCount"], 1),
    status: text(record, ["status", "referralStatus", "state"], "QUALIFIED"),
    createdAt: text(record, ["createdAt", "referredAt", "registrationDate"], ""),
    estimatedValue: numberValue(record, ["estimatedValue", "subscriptionValue", "value", "amount"]),
  }));
}

function normalizeAssets(payload: unknown): AffiliateAssetRow[] {
  return recordsFromPayload(payload).map((record, index) => ({
    id: numberValue(record, ["id", "assetId"], 9200 + index),
    title: text(record, ["title", "name"], `Campaign asset ${index + 1}`),
    channel: text(record, ["channel", "platform"], "Social"),
    format: text(record, ["format", "type"], "Campaign copy"),
    copy: text(record, ["copy", "message", "content", "description"], "Share King Sparkon Tracker with your audience."),
    callToAction: text(record, ["callToAction", "cta"], "Open my affiliate referral link."),
    status: text(record, ["status", "state"], "READY"),
    updatedAt: text(record, ["updatedAt", "createdAt"], ""),
  }));
}

function normalizeCommissions(payload: unknown): AffiliateCommissionRow[] {
  return recordsFromPayload(payload).map((record, index) => ({
    id: numberValue(record, ["id", "commissionId"], 9400 + index),
    reference: text(record, ["reference", "commissionReference", "paymentReference"], `COM-${9400 + index}`),
    businessName: text(record, ["businessName", "companyName", "sourceName"], `Business ${index + 1}`),
    rate: numberValue(record, ["rate", "commissionRate", "percentage"]),
    amount: numberValue(record, ["amount", "commissionAmount", "netAmount", "grossAmount"]),
    status: text(record, ["status", "paymentStatus", "state"], "PENDING"),
    earnedAt: text(record, ["earnedAt", "createdAt", "updatedAt"], ""),
  }));
}

function normalizePayouts(payload: unknown): AffiliatePayoutRow[] {
  return recordsFromPayload(payload).map((record, index) => ({
    id: numberValue(record, ["id", "payoutId"], 9600 + index),
    reference: text(record, ["reference", "payoutReference", "paymentReference"], `PAY-${9600 + index}`),
    amount: numberValue(record, ["amount", "netAmount", "grossAmount"]),
    provider: text(record, ["provider", "paymentProvider", "method"], "PayPal"),
    status: text(record, ["status", "paymentStatus", "state"], "PROCESSING"),
    requestedAt: text(record, ["requestedAt", "createdAt"], ""),
    paidAt: text(record, ["paidAt", "completedAt", "updatedAt"], "") || null,
  }));
}

function SourceBadge({ source }: { source: SourceState }) {
  const backend = source === "backend";
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-[0.1em] ${backend ? "border-[var(--confirm)]/30 bg-[var(--confirm)]/10 text-[var(--confirm)]" : "border-[var(--gold)]/55 bg-[var(--gold)]/15 text-[var(--ink)]"}`}>
      {backend ? <Database className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
      {backend ? "Backend verified" : source === "mixed" ? "Backend + preview" : "Preview data"}
    </span>
  );
}

function Pagination({ page, total, setPage }: { page: number; total: number; setPage: (page: number) => void }) {
  if (total <= 1) return null;
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-[var(--line)] bg-[var(--surface)] px-5 py-4 sm:flex-row">
      <button type="button" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 text-sm font-black disabled:opacity-35 sm:w-auto"><ChevronLeft className="h-4 w-4" /> Previous</button>
      <p className="text-sm font-black text-[var(--ink)]">Page {page + 1} of {total}</p>
      <button type="button" onClick={() => setPage(Math.min(total - 1, page + 1))} disabled={page >= total - 1} className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-[var(--ink)] bg-[var(--ink)] px-4 text-sm font-black text-white disabled:opacity-35 sm:w-auto">Next <ChevronRight className="h-4 w-4" /></button>
    </div>
  );
}

export function AffiliateWorkspace({ section }: { section: AffiliateSection }) {
  const copy = sectionCopy[section];
  const [profile, setProfile] = useState<AffiliateProfileView>(affiliateMockProfile);
  const [referrals, setReferrals] = useState<AffiliateReferralRow[]>(affiliateMockReferrals);
  const [assets, setAssets] = useState<AffiliateAssetRow[]>(affiliateMockAssets);
  const [commissions, setCommissions] = useState<AffiliateCommissionRow[]>(affiliateMockCommissions);
  const [payouts, setPayouts] = useState<AffiliatePayoutRow[]>(affiliateMockPayouts);
  const [source, setSource] = useState<SourceState>("preview");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setNotice(null);
    const failures: string[] = [];
    let backendCount = 0;
    let previewCount = 0;

    const loadOne = async <T,>(label: string, request: () => Promise<unknown>, normalize: (payload: unknown) => T | null, fallback: T, apply: (value: T) => void) => {
      try {
        const normalized = normalize(await request());
        const usable = Array.isArray(normalized) ? normalized.length > 0 : Boolean(normalized);
        if (usable && normalized) {
          apply(normalized);
          backendCount += 1;
        } else {
          apply(fallback);
          previewCount += 1;
          failures.push(`${label} returned no usable records`);
        }
      } catch (error) {
        apply(fallback);
        previewCount += 1;
        failures.push(`${label}: ${normalizeApiError(error).message}`);
      }
    };

    await loadOne("profile", getAffiliateProfile, normalizeProfile, affiliateMockProfile, setProfile);

    if (section === "overview" || section === "referrals") await loadOne("referrals", getAffiliateReferrals, normalizeReferrals, affiliateMockReferrals, setReferrals);
    if (section === "overview" || section === "assets") await loadOne("campaign assets", getAffiliateAssets, normalizeAssets, affiliateMockAssets, setAssets);
    if (section === "overview" || section === "commissions") await loadOne("commissions", getAffiliateCommissions, normalizeCommissions, affiliateMockCommissions, setCommissions);
    if (section === "overview" || section === "payouts") await loadOne("payouts", getAffiliatePayouts, normalizePayouts, affiliateMockPayouts, setPayouts);

    setSource(backendCount > 0 && previewCount > 0 ? "mixed" : backendCount > 0 ? "backend" : "preview");
    setNotice(failures.length ? `${failures.join(" · ")}. Preview records are clearly labelled and will be replaced automatically when backend data is available.` : null);
    setLoading(false);
  }, [section]);

  useEffect(() => {
    setPage(0);
    void load();
  }, [load]);

  const totals = useMemo(() => ({
    clicks: referrals.reduce((sum, item) => sum + item.clicks, 0),
    signups: referrals.reduce((sum, item) => sum + item.signups, 0),
    commissions: commissions.reduce((sum, item) => sum + item.amount, 0),
    pendingCommission: commissions.filter((item) => !["PAID", "COMPLETED"].includes(item.status.toUpperCase())).reduce((sum, item) => sum + item.amount, 0),
    paidOut: payouts.filter((item) => item.status.toUpperCase() === "PAID").reduce((sum, item) => sum + item.amount, 0),
  }), [commissions, payouts, referrals]);

  async function copyValue(key: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(key);
    window.setTimeout(() => setCopied(null), 1600);
  }

  function paged<T>(rows: T[]) {
    return rows.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  }

  const rowCount = section === "referrals" ? referrals.length : section === "commissions" ? commissions.length : section === "payouts" ? payouts.length : 0;
  const totalPages = Math.max(1, Math.ceil(rowCount / PAGE_SIZE));

  return (
    <>
      <DashboardHeader role="AFFILIATE" title={copy.title} description={copy.description} />
      <main className="grid gap-6 bg-[var(--surface)] p-5 md:p-8">
        <section className="flex flex-col gap-4 rounded-[2rem] border border-[var(--gold)]/55 bg-[var(--gold)]/15 p-5 shadow-[var(--shadow-soft)] lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.16em] text-[var(--signal)]">Key objective</p>
            <h2 className="mt-2 max-w-4xl text-xl font-black tracking-[-0.035em] text-[var(--ink)] md:text-2xl">{copy.objective}</h2>
          </div>
          <div className="flex items-center gap-3"><SourceBadge source={source} /><Button type="button" variant="quiet" onClick={() => void load()} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Verify backend</Button></div>
        </section>

        {notice ? <p className="rounded-[1.25rem] border border-[var(--gold)]/50 bg-white p-4 text-sm font-semibold leading-6 text-[var(--steel)]">{notice}</p> : null}

        {loading ? (
          <div className="flex min-h-64 items-center justify-center gap-3 rounded-[2rem] border border-[var(--line)] bg-white text-sm font-black text-[var(--steel)]"><Loader2 className="h-5 w-5 animate-spin" /> Verifying affiliate backend data</div>
        ) : null}

        {!loading && section === "overview" ? (
          <>
            <section className="grid gap-5 rounded-[2.25rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-ledger)] xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[1.8rem] bg-[var(--ink)] p-6 text-white enterprise-grid">
                <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[var(--gold)]">Affiliate identity</p>
                <h2 className="mt-4 text-3xl font-black tracking-[-0.05em]">{profile.name}</h2>
                <p className="mt-2 text-sm text-white/60">{profile.email}</p>
                <div className="mt-6 rounded-[1.35rem] border border-white/10 bg-white/[0.07] p-4">
                  <p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.14em] text-[var(--gold)]">Referral code</p>
                  <p className="code mt-2 break-all text-2xl font-black">{profile.code}</p>
                </div>
                <button type="button" onClick={() => void copyValue("overview-link", profile.referralUrl)} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--gold)] px-5 text-sm font-black text-[var(--ink)]">{copied === "overview-link" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied === "overview-link" ? "Copied" : "Copy referral link"}</button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <MetricCard label="Tracked clicks" value={String(totals.clicks)} detail="Interest created by shared links" tone="signal" icon={<Share2 className="h-5 w-5" />} />
                <MetricCard label="Business signups" value={String(totals.signups)} detail="Registrations attributed to affiliate" tone="confirm" icon={<QrCode className="h-5 w-5" />} />
                <MetricCard label="Commission earned" value={money(totals.commissions)} detail={`${money(totals.pendingCommission)} awaiting settlement`} icon={<BadgeDollarSign className="h-5 w-5" />} />
                <MetricCard label="Paid out" value={money(totals.paidOut)} detail="Confirmed provider settlements" tone="confirm" icon={<WalletCards className="h-5 w-5" />} />
              </div>
            </section>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {navCards.map(({ label, href, detail, icon: Icon }) => <Link key={href} href={href} className="group rounded-[1.5rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)] transition hover:-translate-y-1 hover:border-[var(--gold)]"><div className="flex items-start justify-between"><span className="grid h-11 w-11 place-items-center rounded-[1rem] bg-[var(--ink)] text-[var(--gold)]"><Icon className="h-5 w-5" /></span><ArrowRight className="h-5 w-5 text-[var(--signal)]" /></div><h3 className="mt-5 text-lg font-black text-[var(--ink)]">{label}</h3><p className="mt-2 text-sm font-semibold text-[var(--steel)]">{detail}</p></Link>)}
            </section>
          </>
        ) : null}

        {!loading && section === "referrals" ? (
          <>
            <section className="grid gap-5 rounded-[2rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-ledger)] lg:grid-cols-[1fr_auto] lg:items-center">
              <div><p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.16em] text-[var(--signal)]">Primary tracked link</p><p className="code mt-3 break-all text-xl font-black text-[var(--ink)]">{profile.referralUrl}</p><p className="mt-2 text-sm text-[var(--steel)]">Code: <strong>{profile.code}</strong></p></div>
              <div className="flex flex-wrap gap-2"><Button type="button" onClick={() => void copyValue("referral-link", profile.referralUrl)}>{copied === "referral-link" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied === "referral-link" ? "Copied" : "Copy link"}</Button><a href={profile.referralUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-5 text-sm font-black text-[var(--ink)]">Open <ExternalLink className="h-4 w-4" /></a></div>
            </section>
            <Card><CardHeader><CardTitle>Referred business funnel</CardTitle></CardHeader><CardContent className="p-0"><div className="overflow-x-auto"><table className="min-w-[900px] w-full text-left"><thead className="bg-[var(--surface)] text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]"><tr><th className="px-5 py-4">Business</th><th className="px-5 py-4">Source</th><th className="px-5 py-4">Clicks</th><th className="px-5 py-4">Signups</th><th className="px-5 py-4">Value</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">When</th></tr></thead><tbody>{paged(referrals).map((row) => <tr key={row.id} className="border-t border-[var(--line)] bg-white hover:bg-[var(--gold)]/10"><td className="px-5 py-4"><p className="font-black text-[var(--ink)]">{row.businessName}</p><p className="mt-1 text-xs text-[var(--muted)]">{row.contactName}</p></td><td className="px-5 py-4 font-semibold">{row.source}</td><td className="px-5 py-4 font-black">{row.clicks}</td><td className="px-5 py-4 font-black">{row.signups}</td><td className="money px-5 py-4 font-black">{money(row.estimatedValue)}</td><td className="px-5 py-4"><StatusPill label={row.status} tone={statusTone(row.status)} /></td><td className="px-5 py-4 text-sm text-[var(--steel)]">{dateTime(row.createdAt)}</td></tr>)}</tbody></table></div><Pagination page={page} total={totalPages} setPage={setPage} /></CardContent></Card>
          </>
        ) : null}

        {!loading && section === "assets" ? (
          <section className="grid gap-5 lg:grid-cols-2">
            {assets.map((asset) => <article key={asset.id} className="flex flex-col rounded-[1.75rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)]"><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.14em] text-[var(--signal)]">{asset.channel} · {asset.format}</p><h2 className="mt-2 text-xl font-black tracking-[-0.035em] text-[var(--ink)]">{asset.title}</h2></div><StatusPill label={asset.status} tone={statusTone(asset.status)} /></div><div className="mt-5 rounded-[1.25rem] border border-[var(--line)] bg-[var(--surface)] p-4 text-sm font-semibold leading-7 text-[var(--steel)]">{asset.copy}<p className="mt-3 font-black text-[var(--ink)]">{asset.callToAction}</p><p className="mt-2 break-all text-xs text-[var(--signal)]">{profile.referralUrl}</p></div><div className="mt-auto flex flex-wrap gap-2 pt-5"><Button type="button" onClick={() => void copyValue(`asset-${asset.id}`, `${asset.copy}\n\n${asset.callToAction}\n${profile.referralUrl}`)}>{copied === `asset-${asset.id}` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied === `asset-${asset.id}` ? "Copied" : "Copy campaign"}</Button><span className="inline-flex items-center text-xs font-bold text-[var(--muted)]">Updated {dateTime(asset.updatedAt)}</span></div></article>)}
          </section>
        ) : null}

        {!loading && section === "commissions" ? (
          <><section className="grid gap-4 sm:grid-cols-3"><MetricCard label="Total commission" value={money(totals.commissions)} detail="All backend or preview records" tone="confirm" icon={<BadgeDollarSign className="h-5 w-5" />} /><MetricCard label="Awaiting settlement" value={money(totals.pendingCommission)} detail="Pending and approved" tone="signal" icon={<BarChart3 className="h-5 w-5" />} /><MetricCard label="Commission records" value={String(commissions.length)} detail="Traceable business earnings" icon={<Database className="h-5 w-5" />} /></section><Card><CardHeader><CardTitle>Commission ledger</CardTitle></CardHeader><CardContent className="p-0"><div className="overflow-x-auto"><table className="min-w-[820px] w-full text-left"><thead className="bg-[var(--surface)] text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]"><tr><th className="px-5 py-4">Reference</th><th className="px-5 py-4">Business</th><th className="px-5 py-4">Rate</th><th className="px-5 py-4">Amount</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Earned</th></tr></thead><tbody>{paged(commissions).map((row) => <tr key={row.id} className="border-t border-[var(--line)] bg-white hover:bg-[var(--gold)]/10"><td className="code px-5 py-4 font-black">{row.reference}</td><td className="px-5 py-4 font-black">{row.businessName}</td><td className="px-5 py-4 font-black">{row.rate}%</td><td className="money px-5 py-4 text-lg font-black">{money(row.amount)}</td><td className="px-5 py-4"><StatusPill label={row.status} tone={statusTone(row.status)} /></td><td className="px-5 py-4 text-sm text-[var(--steel)]">{dateTime(row.earnedAt)}</td></tr>)}</tbody></table></div><Pagination page={page} total={totalPages} setPage={setPage} /></CardContent></Card></>
        ) : null}

        {!loading && section === "payouts" ? (
          <><section className="grid gap-4 sm:grid-cols-3"><MetricCard label="Paid to affiliate" value={money(totals.paidOut)} detail="Confirmed completed payouts" tone="confirm" icon={<WalletCards className="h-5 w-5" />} /><MetricCard label="Processing" value={money(payouts.filter((row) => row.status.toUpperCase() !== "PAID").reduce((sum, row) => sum + row.amount, 0))} detail="Requested but not settled" tone="signal" icon={<RefreshCw className="h-5 w-5" />} /><MetricCard label="Payment provider" value={payouts[0]?.provider ?? "Not set"} detail="Configure provider in affiliate profile" icon={<Database className="h-5 w-5" />} /></section><Card><CardHeader><CardTitle>Payout settlement history</CardTitle></CardHeader><CardContent className="p-0"><div className="overflow-x-auto"><table className="min-w-[860px] w-full text-left"><thead className="bg-[var(--surface)] text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]"><tr><th className="px-5 py-4">Reference</th><th className="px-5 py-4">Provider</th><th className="px-5 py-4">Amount</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Requested</th><th className="px-5 py-4">Paid</th></tr></thead><tbody>{paged(payouts).map((row) => <tr key={row.id} className="border-t border-[var(--line)] bg-white hover:bg-[var(--gold)]/10"><td className="code px-5 py-4 font-black">{row.reference}</td><td className="px-5 py-4 font-black">{row.provider}</td><td className="money px-5 py-4 text-lg font-black">{money(row.amount)}</td><td className="px-5 py-4"><StatusPill label={row.status} tone={statusTone(row.status)} /></td><td className="px-5 py-4 text-sm text-[var(--steel)]">{dateTime(row.requestedAt)}</td><td className="px-5 py-4 text-sm text-[var(--steel)]">{dateTime(row.paidAt)}</td></tr>)}</tbody></table></div><Pagination page={page} total={totalPages} setPage={setPage} /></CardContent></Card></>
        ) : null}
      </main>
    </>
  );
}
