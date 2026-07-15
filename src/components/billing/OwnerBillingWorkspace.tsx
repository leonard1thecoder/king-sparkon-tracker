"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgePercent, CalendarDays, CheckCircle2, CreditCard, ExternalLink, Loader2, RefreshCw, ShieldCheck, UsersRound } from "lucide-react";
import { apiGet, apiPost, normalizeApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";

type BillingInterval = "MONTHLY" | "YEARLY";
type BillingPlan = {
  plan: string; displayName: string; monthlyPrice: number; currency: string; maxWorkers: number; unlimitedWorkers: boolean;
  unlimitedProducts: boolean; unlimitedBarcodeScanning: boolean; workerTipsPlatform: boolean; businessAnalysisAi: boolean;
  workerClocker: boolean; affiliateProgram: boolean; features: string[]; originalMonthlyPrice?: number | null;
  discountPercent?: number | null; discountLabel?: string | null; discountActive?: boolean;
};
type BillingDashboard = {
  businessId: number; businessName: string; currentPlan: string; businessStatus: string; paymentStatus?: string | null;
  currentBillingInterval?: BillingInterval | null; currentTermYears?: number | null; trial: boolean; trialDaysLeft: number;
  trialEndDate?: string | null; currentBillingPeriodEndDate?: string | null; deactivated: boolean; showUpgradeButtons: boolean;
  canUseProducts: boolean; canUseBarcodeScanning: boolean; canUseWorkerTipsPlatform: boolean; canUseBusinessAnalysisAi: boolean;
  canUseWorkerClocker: boolean; availablePlans: BillingPlan[];
};
type StripeCheckout = { subscriptionId: number; checkoutSessionId: string; checkoutUrl: string; paymentStatus: string };

function money(value?: number | null) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(Number(value ?? 0));
}
function date(value?: string | null) { return value ? new Date(value).toLocaleDateString("en-ZA", { dateStyle: "long" }) : "Not scheduled"; }
function intervalPrice(plan: BillingPlan, interval: BillingInterval) { return Number(plan.monthlyPrice ?? 0) * (interval === "YEARLY" ? 12 : 1); }
function originalIntervalPrice(plan: BillingPlan, interval: BillingInterval) { return Number(plan.originalMonthlyPrice ?? plan.monthlyPrice ?? 0) * (interval === "YEARLY" ? 12 : 1); }

export function OwnerBillingWorkspace() {
  const [dashboard, setDashboard] = useState<BillingDashboard | null>(null);
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("MONTHLY");
  const [loading, setLoading] = useState(true);
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true); setError(null);
    try { setDashboard(await apiGet<BillingDashboard>("/billing/dashboard")); }
    catch (exception) { setError(normalizeApiError(exception).message); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  async function upgrade(plan: BillingPlan) {
    const requestKey = `${plan.plan}:${billingInterval}`;
    setUpgradingPlan(requestKey); setError(null);
    try {
      const checkout = await apiPost<StripeCheckout, { plan: string; billingInterval: BillingInterval; termYears: number | null; affiliateCode: null }>("/billing/stripe/checkout-sessions", {
        plan: plan.plan, billingInterval, termYears: billingInterval === "YEARLY" ? 1 : null, affiliateCode: null,
      });
      window.location.assign(checkout.checkoutUrl);
    } catch (exception) { setError(normalizeApiError(exception).message); setUpgradingPlan(null); }
  }

  const plans = useMemo(() => (dashboard?.availablePlans ?? []).filter((plan) => plan.plan === "PLUS" || plan.plan === "PRO"), [dashboard?.availablePlans]);
  const renewalDate = dashboard?.trial ? dashboard.trialEndDate : dashboard?.currentBillingPeriodEndDate;
  const cycle = dashboard?.trial ? "14-day trial" : dashboard?.currentBillingInterval === "YEARLY" ? "Yearly" : dashboard?.currentBillingInterval === "MONTHLY" ? "Monthly" : "Not selected";

  return (
    <section className="grid gap-6">
      {error ? <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p> : null}

      <Card className="border-[var(--line-strong)]">
        <CardContent className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2"><StatusPill label={dashboard?.trial ? "TRIAL" : dashboard?.paymentStatus ?? "BILLING"} tone="signal" /><span className="text-sm font-semibold text-[var(--steel)]">{dashboard?.businessName ?? "Business subscription"}</span></div>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em]">{loading ? "Loading billing…" : `${dashboard?.currentPlan ?? "No plan"} plan`}</h2>
            <div className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
              <div className="border-l-2 border-[var(--line-strong)] pl-4"><p className="font-extrabold text-[var(--ink)]">Billing cycle</p><p className="mt-1 text-[var(--steel)]">{cycle}</p></div>
              <div className="border-l-2 border-[var(--line-strong)] pl-4"><p className="font-extrabold text-[var(--ink)]">Renewal or trial end</p><p className="mt-1 text-[var(--steel)]">{date(renewalDate)}</p></div>
              <div className="border-l-2 border-[var(--line-strong)] pl-4"><p className="font-extrabold text-[var(--ink)]">Business status</p><p className="mt-1 text-[var(--steel)]">{dashboard?.businessStatus ?? "Unavailable"}</p></div>
            </div>
          </div>
          <Button type="button" variant="quiet" onClick={() => void load()} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />Refresh billing</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Included with your current plan</CardTitle><p className="mt-2 text-sm leading-6 text-[var(--steel)]">Permissions are calculated live from your subscription and business status.</p></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Products", dashboard?.canUseProducts], ["Barcode scanning", dashboard?.canUseBarcodeScanning], ["Worker tips", dashboard?.canUseWorkerTipsPlatform],
            ["Business analysis", dashboard?.canUseBusinessAnalysisAi], ["Worker clocker", dashboard?.canUseWorkerClocker],
          ].map(([label, enabled]) => <div key={String(label)} className="flex items-center justify-between gap-3 border-b border-[var(--line)] py-3 lg:border-b-0 lg:border-l lg:pl-4"><div><p className="font-extrabold text-[var(--ink)]">{label}</p><p className="mt-1 text-xs font-semibold text-[var(--steel)]">{enabled ? "Included" : "Upgrade required"}</p></div>{enabled ? <CheckCircle2 className="h-5 w-5 text-[var(--signal)]" /> : <ShieldCheck className="h-5 w-5 text-[var(--muted)]" />}</div>)}
        </CardContent>
      </Card>

      <section className="grid gap-6">
        <div className="flex flex-col gap-4 border-b border-[var(--line)] pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div><p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--signal-strong)]">Upgrade options</p><h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">Choose the control your operation needs.</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--steel)]">Plus is the recommended plan for growing teams. Pro is for unlimited workers and advanced operations.</p></div>
          <div className="inline-grid grid-cols-2 rounded-lg border border-[var(--line)] bg-white p-1" aria-label="Billing interval">
            {(["MONTHLY", "YEARLY"] as BillingInterval[]).map((interval) => <button key={interval} type="button" onClick={() => setBillingInterval(interval)} aria-pressed={billingInterval === interval} className={`min-h-10 rounded-md border px-4 text-xs font-extrabold ${billingInterval === interval ? "border-[var(--signal)] bg-[var(--signal-soft)] text-[var(--signal-strong)]" : "border-transparent bg-white text-[var(--steel)] hover:border-[var(--accent-hover)] hover:text-[var(--accent-hover)]"}`}>{interval === "MONTHLY" ? "Monthly" : "Yearly"}</button>)}
          </div>
        </div>

        {loading ? <div className="flex min-h-56 items-center justify-center gap-3 rounded-xl border border-[var(--line)] bg-white text-sm font-extrabold text-[var(--steel)]"><Loader2 className="h-5 w-5 animate-spin" />Loading plans</div> : (
          <div className="grid gap-5 lg:grid-cols-2">
            {plans.map((plan) => {
              const recommended = plan.plan === "PLUS";
              const current = plan.plan === dashboard?.currentPlan && dashboard?.currentBillingInterval === billingInterval;
              const requestKey = `${plan.plan}:${billingInterval}`;
              const upgrading = upgradingPlan === requestKey;
              const price = intervalPrice(plan, billingInterval);
              const originalPrice = originalIntervalPrice(plan, billingInterval);
              const discounted = Boolean(plan.discountActive && price < originalPrice);
              return (
                <article key={plan.plan} className={`relative flex flex-col rounded-xl border bg-white p-6 ${recommended ? "border-[var(--signal)] shadow-[0_16px_38px_rgba(14,165,233,0.12)]" : "border-[var(--line)] shadow-[var(--shadow-soft)]"}`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">{recommended ? <span className="rounded-md border border-[var(--line-strong)] bg-[var(--signal-soft)] px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.08em] text-[var(--signal-strong)]">Recommended</span> : <span className="text-xs font-extrabold uppercase tracking-[0.08em] text-[var(--steel)]">Advanced operations</span>}{current ? <StatusPill label="Current plan" tone="confirm" /> : null}</div>
                  <h3 className="mt-5 text-3xl font-black tracking-[-0.04em]">{plan.displayName}</h3>
                  <div className="mt-4 flex items-end gap-2">{discounted ? <span className="money pb-1 text-sm font-bold text-[var(--muted)] line-through">{money(originalPrice)}</span> : null}<p className="money text-4xl font-black">{money(price)}</p><span className="pb-1 text-sm font-semibold text-[var(--muted)]">{billingInterval === "MONTHLY" ? "/ month" : "/ year"}</span></div>
                  {discounted ? <p className="mt-2 flex items-center gap-2 text-xs font-extrabold text-[var(--signal-strong)]"><BadgePercent className="h-4 w-4" />{plan.discountPercent}% off · {plan.discountLabel || "Live discount"}</p> : null}
                  <p className="mt-4 flex items-center gap-2 text-sm font-extrabold text-[var(--steel)]"><UsersRound className="h-4 w-4 text-[var(--signal)]" />{plan.unlimitedWorkers ? "Unlimited workers" : `Up to ${plan.maxWorkers} workers`}</p>
                  <ul className="mt-6 grid flex-1 gap-3">{plan.features.map((feature) => <li key={feature} className="flex items-start gap-3 text-sm font-semibold text-[var(--steel)]"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--signal)]" />{feature}</li>)}</ul>
                  <Button type="button" className="mt-7 w-full" disabled={current || upgrading || Boolean(upgradingPlan)} onClick={() => void upgrade(plan)}>{upgrading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}{current ? "Current billing option" : upgrading ? "Opening checkout…" : `Choose ${plan.displayName}`}</Button>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <div className="grid gap-3 border-t border-[var(--line)] pt-5 text-sm font-semibold text-[var(--steel)] sm:grid-cols-3"><p className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-[var(--signal)]" />Secure Stripe checkout</p><p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[var(--signal)]" />Monthly or annual billing</p><p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[var(--signal)]" />Plan permissions update automatically</p></div>
    </section>
  );
}
