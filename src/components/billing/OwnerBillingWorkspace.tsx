"use client";

import { useEffect, useState } from "react";
import { BadgePercent, CheckCircle2, CreditCard, ExternalLink, Loader2, RefreshCw, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { apiGet, apiPost, normalizeApiError } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusPill } from "@/components/ui/StatusPill";

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

export function OwnerBillingWorkspace() {
  const [dashboard, setDashboard] = useState<BillingDashboard | null>(null);
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
    setUpgradingPlan(plan.plan);
    setError(null);
    try {
      const checkout = await apiPost<StripeCheckout, { plan: string; billingInterval: string; termYears: null; affiliateCode: null }>("/billing/stripe/checkout-sessions", {
        plan: plan.plan,
        billingInterval: "MONTHLY",
        termYears: null,
        affiliateCode: null,
      });
      window.location.assign(checkout.checkoutUrl);
    } catch (exception) {
      setError(normalizeApiError(exception).message);
      setUpgradingPlan(null);
    }
  }

  const plans = dashboard?.availablePlans ?? [];
  const liveDiscounts = plans.filter((plan) => plan.discountActive).length;

  return (
    <section className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Current plan" value={loading ? "..." : dashboard?.currentPlan ?? "Unavailable"} detail={dashboard?.businessName ?? "Business subscription"} tone="confirm" icon={<Sparkles className="h-5 w-5" />} />
        <MetricCard label="Business status" value={loading ? "..." : dashboard?.businessStatus ?? "Unavailable"} detail={dashboard?.trial ? `${dashboard.trialDaysLeft} trial days left` : "Subscription state"} tone={dashboard?.deactivated ? "neutral" : "signal"} icon={<ShieldCheck className="h-5 w-5" />} />
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
        <CardHeader><CardTitle>Available business plans</CardTitle><p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--steel)]">Compare worker capacity, platform features and active administrator discounts. Stripe checkout uses the displayed discounted monthly amount.</p></CardHeader>
        <CardContent>
          {loading ? <div className="flex min-h-56 items-center justify-center gap-3 text-sm font-black text-[var(--steel)]"><Loader2 className="h-5 w-5 animate-spin" /> Loading plans</div> : (
            <div className="grid gap-5 lg:grid-cols-3">
              {plans.map((plan) => {
                const current = plan.plan === dashboard?.currentPlan;
                const upgrading = upgradingPlan === plan.plan;
                const originalPrice = Number(plan.originalMonthlyPrice ?? plan.monthlyPrice);
                const discounted = Boolean(plan.discountActive && Number(plan.monthlyPrice) < originalPrice);
                return (
                  <article key={plan.plan} className={`relative grid gap-5 overflow-hidden rounded-[1.6rem] border p-5 shadow-[var(--shadow-soft)] ${current ? "border-[var(--gold)] bg-[var(--gold)]/8" : "border-[var(--line)] bg-white"}`}>
                    {discounted ? <div className="absolute right-0 top-0 rounded-bl-[1.2rem] bg-[var(--signal)] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white">{plan.discountPercent}% off</div> : null}
                    <div>
                      <div className="flex items-center justify-between gap-3"><StatusPill label={current ? "CURRENT PLAN" : plan.plan} tone={current ? "confirm" : "signal"} /><UsersRound className="h-5 w-5 text-[var(--signal)]" /></div>
                      <h2 className="mt-4 text-3xl font-black tracking-[-0.05em] text-[var(--ink)]">{plan.displayName}</h2>
                      {discounted ? <p className="money mt-2 text-lg font-black text-[var(--muted)] line-through">{money(originalPrice)}</p> : null}
                      <p className="money mt-1 text-3xl font-black text-[var(--signal)]">{money(plan.monthlyPrice)} <span className="text-sm text-[var(--muted)]">/ month</span></p>
                      {discounted ? <p className="mt-2 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.08em] text-[var(--confirm)]"><BadgePercent className="h-4 w-4" /> {plan.discountLabel || "Service discount"}</p> : null}
                      <p className="mt-3 text-sm font-bold text-[var(--steel)]">{plan.unlimitedWorkers ? "Unlimited workers" : `${plan.maxWorkers} workers`}</p>
                    </div>
                    <ul className="grid gap-2 text-sm font-semibold text-[var(--steel)]">{plan.features.map((feature) => <li key={feature} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--confirm)]" /> {feature}</li>)}</ul>
                    <Button type="button" disabled={current || upgrading} onClick={() => void upgrade(plan)}>{upgrading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />} {current ? "Current plan" : upgrading ? "Opening checkout..." : `Choose ${plan.displayName}`}</Button>
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
