"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgePercent, CalendarDays, CheckCircle2, CreditCard, ExternalLink, Loader2, RefreshCw, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { apiGet, apiPost, normalizeApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusPill } from "@/components/ui/StatusPill";

type BillingInterval = "MONTHLY" | "YEARLY";

type BillingPlan = {
  plan: string;
  displayName: string;
  monthlyPrice: number;
  currency: string;
  maxWorkers: number;
  unlimitedWorkers: boolean;
  unlimitedProducts: boolean;
  unlimitedBarcodeScanning: boolean;
  workerTipsPlatform: boolean;
  businessAnalysisAi: boolean;
  workerClocker: boolean;
  affiliateProgram: boolean;
  features: string[];
  originalMonthlyPrice?: number | null;
  discountPercent?: number | null;
  discountLabel?: string | null;
  discountActive?: boolean;
};

type BillingDashboard = {
  businessId: number;
  businessName: string;
  currentPlan: string;
  businessStatus: string;
  paymentStatus?: string | null;
  currentBillingInterval?: BillingInterval | null;
  currentTermYears?: number | null;
  trial: boolean;
  trialDaysLeft: number;
  trialEndDate?: string | null;
  currentBillingPeriodEndDate?: string | null;
  deactivated: boolean;
  showUpgradeButtons: boolean;
  canUseProducts: boolean;
  canUseBarcodeScanning: boolean;
  canUseWorkerTipsPlatform: boolean;
  canUseBusinessAnalysisAi: boolean;
  canUseWorkerClocker: boolean;
  availablePlans: BillingPlan[];
};

type StripeCheckout = {
  subscriptionId: number;
  checkoutSessionId: string;
  checkoutUrl: string;
  paymentStatus: string;
};

function money(value?: number | null) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(Number(value ?? 0));
}

function date(value?: string | null) {
  return value ? new Date(value).toLocaleDateString("en-ZA", { dateStyle: "long" }) : "Not scheduled";
}

function intervalPrice(plan: BillingPlan, interval: BillingInterval) {
  return Number(plan.monthlyPrice ?? 0) * (interval === "YEARLY" ? 12 : 1);
}

function originalIntervalPrice(plan: BillingPlan, interval: BillingInterval) {
  return Number(plan.originalMonthlyPrice ?? plan.monthlyPrice ?? 0) * (interval === "YEARLY" ? 12 : 1);
}

export function OwnerBillingWorkspace() {
  const [dashboard, setDashboard] = useState<BillingDashboard | null>(null);
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("MONTHLY");
  const [loading, setLoading] = useState(true);
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setDashboard(await apiGet<BillingDashboard>("/billing/dashboard"));
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function upgrade(plan: BillingPlan) {
    const requestKey = `${plan.plan}:${billingInterval}`;
    setUpgradingPlan(requestKey);
    setError(null);
    try {
      const checkout = await apiPost<StripeCheckout, { plan: string; billingInterval: BillingInterval; termYears: number | null; affiliateCode: null }>("/billing/stripe/checkout-sessions", {
        plan: plan.plan,
        billingInterval,
        termYears: billingInterval === "YEARLY" ? 1 : null,
        affiliateCode: null,
      });
      window.location.assign(checkout.checkoutUrl);
    } catch (exception) {
      setError(normalizeApiError(exception).message);
      setUpgradingPlan(null);
    }
  }

  const plans = useMemo(
    () => (dashboard?.availablePlans ?? []).filter((plan) => plan.plan === "PLUS" || plan.plan === "PRO"),
    [dashboard?.availablePlans],
  );
  const liveDiscounts = plans.filter((plan) => plan.discountActive).length;
  const currentBillingLabel = dashboard?.trial
    ? "Trial"
    : dashboard?.currentBillingInterval === "YEARLY"
      ? `Yearly${dashboard.currentTermYears && dashboard.currentTermYears > 1 ? ` · ${dashboard.currentTermYears} years` : ""}`
      : dashboard?.currentBillingInterval === "MONTHLY"
        ? "Monthly"
        : "Subscription";

  return (
    <section className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Current plan" value={loading ? "..." : dashboard?.currentPlan ?? "Unavailable"} detail={dashboard?.businessName ?? "Business subscription"} tone="confirm" icon={<Sparkles className="h-5 w-5" />} />
        <MetricCard label="Billing cycle" value={loading ? "..." : currentBillingLabel} detail="Monthly or yearly renewal" tone="signal" icon={<CalendarDays className="h-5 w-5" />} />
        <MetricCard label="Payment status" value={loading ? "..." : dashboard?.paymentStatus ?? (dashboard?.trial ? "TRIAL" : "NO PAYMENT")} detail="Latest subscription payment" icon={<CreditCard className="h-5 w-5" />} />
        <MetricCard label="Billing renewal" value={loading ? "..." : date(dashboard?.currentBillingPeriodEndDate)} detail={dashboard?.trial ? `Trial ends ${date(dashboard.trialEndDate)}` : "Current period end"} icon={<RefreshCw className="h-5 w-5" />} />
        <MetricCard label="Live discounts" value={loading ? "..." : String(liveDiscounts)} detail="Admin Plus and Pro offers" icon={<BadgePercent className="h-5 w-5" />} />
      </div>

      {error ? <p className="rounded-[1.1rem] border border-[var(--danger)]/30 bg-[var(--danger)]/10 p-4 text-sm font-black text-[var(--danger)]">{error}</p> : null}

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><CardTitle>Feature access</CardTitle><p className="mt-2 text-sm leading-6 text-[var(--steel)]">Live feature permissions calculated from the current business plan.</p></div><Button type="button" variant="quiet" onClick={() => void load()} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh billing</Button></CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {[
              ["Products", dashboard?.canUseProducts],
              ["Barcode scanning", dashboard?.canUseBarcodeScanning],
              ["Worker tips", dashboard?.canUseWorkerTipsPlatform],
              ["Business analysis AI", dashboard?.canUseBusinessAnalysisAi],
              ["Worker clocker", dashboard?.canUseWorkerClocker],
            ].map(([label, enabled]) => <div key={String(label)} className="rounded-[1.2rem] border border-[var(--line)] bg-[var(--surface)] p-4"><div className="flex items-center justify-between gap-3"><p className="font-black text-[var(--ink)]">{label}</p>{enabled ? <CheckCircle2 className="h-5 w-5 text-[var(--confirm)]" /> : <ShieldCheck className="h-5 w-5 text-[var(--muted)]" />}</div><p className="mt-2 text-xs font-bold text-[var(--steel)]">{enabled ? "Available on your plan" : "Upgrade required"}</p></div>)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <CardTitle>Plus and Pro billing</CardTitle>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--steel)]">Choose monthly billing or one yearly payment. Both options create recurring Stripe subscriptions and use the same live administrator discount.</p>
          </div>
          <div className="inline-flex rounded-full border border-[var(--line)] bg-[var(--surface)] p-1" aria-label="Billing interval">
            {(["MONTHLY", "YEARLY"] as BillingInterval[]).map((interval) => (
              <button
                key={interval}
                type="button"
                onClick={() => setBillingInterval(interval)}
                className={`min-h-10 rounded-full px-4 text-xs font-black uppercase tracking-[0.1em] transition ${billingInterval === interval ? "bg-[var(--ink)] text-[var(--gold)] shadow-[var(--shadow-soft)]" : "text-[var(--steel)] hover:bg-white"}`}
                aria-pressed={billingInterval === interval}
              >
                {interval === "MONTHLY" ? "Monthly" : "Yearly"}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <div className="flex min-h-56 items-center justify-center gap-3 text-sm font-black text-[var(--steel)]"><Loader2 className="h-5 w-5 animate-spin" /> Loading plans</div> : (
            <div className="grid gap-5 lg:grid-cols-2">
              {plans.map((plan) => {
                const current = plan.plan === dashboard?.currentPlan && dashboard?.currentBillingInterval === billingInterval;
                const requestKey = `${plan.plan}:${billingInterval}`;
                const upgrading = upgradingPlan === requestKey;
                const price = intervalPrice(plan, billingInterval);
                const originalPrice = originalIntervalPrice(plan, billingInterval);
                const discounted = Boolean(plan.discountActive && price < originalPrice);
                const periodLabel = billingInterval === "MONTHLY" ? "/ month" : "/ year";
                return (
                  <article key={plan.plan} className={`relative grid gap-5 overflow-hidden rounded-[1.6rem] border p-5 shadow-[var(--shadow-soft)] ${current ? "border-[var(--gold)] bg-[var(--gold)]/8" : "border-[var(--line)] bg-white"}`}>
                    {discounted ? <div className="absolute right-0 top-0 rounded-bl-[1.2rem] bg-[var(--signal)] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white">{plan.discountPercent}% off</div> : null}
                    <div>
                      <div className="flex items-center justify-between gap-3"><StatusPill label={current ? "CURRENT BILLING" : `${plan.plan} · ${billingInterval}`} tone={current ? "confirm" : "signal"} /><UsersRound className="h-5 w-5 text-[var(--signal)]" /></div>
                      <h2 className="mt-4 text-3xl font-black tracking-[-0.05em] text-[var(--ink)]">{plan.displayName}</h2>
                      {discounted ? <p className="money mt-2 text-lg font-black text-[var(--muted)] line-through">{money(originalPrice)}</p> : null}
                      <p className="money mt-1 text-3xl font-black text-[var(--signal)]">{money(price)} <span className="text-sm text-[var(--muted)]">{periodLabel}</span></p>
                      {billingInterval === "YEARLY" ? <p className="mt-2 text-xs font-bold text-[var(--steel)]">Equivalent to {money(Number(plan.monthlyPrice))} per month, billed once every 12 months.</p> : null}
                      {discounted ? <p className="mt-2 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.08em] text-[var(--confirm)]"><BadgePercent className="h-4 w-4" /> {plan.discountLabel || "Service discount"}</p> : null}
                      <p className="mt-3 text-sm font-bold text-[var(--steel)]">{plan.unlimitedWorkers ? "Unlimited workers" : `${plan.maxWorkers} workers`}</p>
                    </div>
                    <ul className="grid gap-2 text-sm font-semibold text-[var(--steel)]">{plan.features.map((feature) => <li key={feature} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--confirm)]" /> {feature}</li>)}</ul>
                    <Button type="button" disabled={current || upgrading || Boolean(upgradingPlan)} onClick={() => void upgrade(plan)}>{upgrading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />} {current ? "Current billing option" : upgrading ? "Opening checkout..." : `Choose ${plan.displayName} ${billingInterval.toLowerCase()}`}</Button>
                  </article>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
