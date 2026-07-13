"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { BadgePercent, CheckCircle2, Clock3, Loader2, RefreshCw, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { normalizeApiError } from "@/lib/api/client";
import {
  listBillingDiscounts,
  saveBillingDiscount,
  type BillingDiscount,
  type BillingDiscountPayload,
} from "@/lib/api/billing-discounts";

const plans = [
  { plan: "PLUS" as const, name: "Plus", originalPrice: 880, description: "Growing business service with five workers and core commerce tools." },
  { plan: "PRO" as const, name: "Pro", originalPrice: 2300, description: "Full business service with unlimited workers, tips, AI and clocking." },
];

type PlanCode = (typeof plans)[number]["plan"];
type DiscountForm = {
  discountPercent: string;
  label: string;
  active: boolean;
  startsAt: string;
  endsAt: string;
};

const emptyForm: DiscountForm = {
  discountPercent: "0",
  label: "Limited service discount",
  active: false,
  startsAt: "",
  endsAt: "",
};

function money(value: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(value);
}

function localInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function isoOrNull(value: string) {
  return value ? new Date(value).toISOString() : null;
}

function fieldClass() {
  return "min-h-11 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 text-sm font-semibold text-[var(--ink)] outline-none focus:border-[var(--signal)] focus:shadow-[var(--focus-ring)]";
}

export function AdminBillingDiscounts() {
  const [discounts, setDiscounts] = useState<BillingDiscount[]>([]);
  const [forms, setForms] = useState<Record<PlanCode, DiscountForm>>({ PLUS: { ...emptyForm }, PRO: { ...emptyForm } });
  const [loading, setLoading] = useState(true);
  const [savingPlan, setSavingPlan] = useState<PlanCode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const response = await listBillingDiscounts();
      const rows = Array.isArray(response) ? response : [];
      setDiscounts(rows);
      setForms((current) => {
        const next = { ...current };
        plans.forEach(({ plan }) => {
          const discount = rows.find((item) => item.businessPlan === plan);
          if (discount) {
            next[plan] = {
              discountPercent: String(discount.discountPercent ?? 0),
              label: discount.label || "Limited service discount",
              active: Boolean(discount.active),
              startsAt: localInput(discount.startsAt),
              endsAt: localInput(discount.endsAt),
            };
          }
        });
        return next;
      });
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const effectiveCount = useMemo(() => discounts.filter((discount) => discount.effective).length, [discounts]);
  const maximumDiscount = useMemo(() => discounts.reduce((max, discount) => Math.max(max, Number(discount.discountPercent ?? 0)), 0), [discounts]);

  function updateForm(plan: PlanCode, patch: Partial<DiscountForm>) {
    setForms((current) => ({ ...current, [plan]: { ...current[plan], ...patch } }));
  }

  async function submit(event: FormEvent<HTMLFormElement>, plan: PlanCode) {
    event.preventDefault();
    const form = forms[plan];
    const percentage = Number(form.discountPercent);
    if (!Number.isFinite(percentage) || percentage < 0 || percentage > 90) {
      setError("Discount percentage must be between 0% and 90%.");
      return;
    }
    if (form.startsAt && form.endsAt && new Date(form.endsAt).getTime() <= new Date(form.startsAt).getTime()) {
      setError("Discount end date must be after its start date.");
      return;
    }

    setSavingPlan(plan);
    setError(null);
    setNotice(null);
    try {
      const payload: BillingDiscountPayload = {
        discountPercent: percentage,
        label: form.label.trim() || "Limited service discount",
        active: form.active,
        startsAt: isoOrNull(form.startsAt),
        endsAt: isoOrNull(form.endsAt),
      };
      const saved = await saveBillingDiscount(plan, payload);
      setNotice(`${plan === "PLUS" ? "Plus" : "Pro"} discount saved. Effective Stripe checkout pricing is now ${saved.effective ? "active" : "scheduled or disabled"}.`);
      await load();
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setSavingPlan(null);
    }
  }

  return (
    <section className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Discountable services" value="2" detail="Plus and Pro only" tone="confirm" icon={<BadgePercent className="h-5 w-5" />} />
        <MetricCard label="Effective now" value={loading ? "..." : String(effectiveCount)} detail="Currently applied at Stripe checkout" tone="signal" icon={<CheckCircle2 className="h-5 w-5" />} />
        <MetricCard label="Largest discount" value={loading ? "..." : `${maximumDiscount}%`} detail="Across paid services" icon={<Sparkles className="h-5 w-5" />} />
        <MetricCard label="Pricing source" value="Admin" detail="One policy for cards and checkout" icon={<Clock3 className="h-5 w-5" />} />
      </div>

      {error ? <p className="rounded-[1.1rem] border border-[var(--danger)]/30 bg-[var(--danger)]/10 p-4 text-sm font-black text-[var(--danger)]">{error}</p> : null}
      {notice ? <p className="rounded-[1.1rem] border border-[var(--confirm)]/30 bg-[var(--confirm)]/10 p-4 text-sm font-black text-[var(--confirm)]">{notice}</p> : null}

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Plus and Pro service discounts</CardTitle>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--steel)]">Create a discount percentage, campaign label and optional start/end window. Active discounts change both the rendered service price and the Stripe subscription amount.</p>
          </div>
          <Button type="button" variant="quiet" disabled={loading} onClick={() => void load()}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh</Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex min-h-56 items-center justify-center gap-3 text-sm font-black text-[var(--steel)]"><Loader2 className="h-5 w-5 animate-spin" /> Loading service discounts</div>
          ) : (
            <div className="grid gap-5 xl:grid-cols-2">
              {plans.map((plan) => {
                const form = forms[plan.plan];
                const current = discounts.find((discount) => discount.businessPlan === plan.plan);
                const percentage = Math.min(Math.max(Number(form.discountPercent || 0), 0), 90);
                const effectivePrice = plan.originalPrice * (1 - percentage / 100);
                const saving = savingPlan === plan.plan;
                return (
                  <form key={plan.plan} onSubmit={(event) => void submit(event, plan.plan)} className="grid gap-5 rounded-[1.7rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)]">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap gap-2"><StatusPill label={plan.plan} tone="signal" />{current?.effective ? <StatusPill label="LIVE DISCOUNT" tone="confirm" /> : <StatusPill label={form.active ? "SCHEDULED" : "DISABLED"} tone="neutral" />}</div>
                        <h2 className="mt-4 text-3xl font-black tracking-[-0.05em] text-[var(--ink)]">{plan.name}</h2>
                        <p className="mt-2 text-sm font-semibold leading-6 text-[var(--steel)]">{plan.description}</p>
                      </div>
                      <BadgePercent className="h-8 w-8 text-[var(--signal)]" />
                    </div>

                    <div className="grid grid-cols-2 gap-3 rounded-[1.2rem] border border-[var(--gold)]/50 bg-[var(--gold)]/10 p-4">
                      <div><p className="text-[0.65rem] font-black uppercase tracking-[0.1em] text-[var(--muted)]">Original</p><p className="money mt-1 text-xl font-black text-[var(--muted)] line-through">{money(plan.originalPrice)}</p></div>
                      <div className="text-right"><p className="text-[0.65rem] font-black uppercase tracking-[0.1em] text-[var(--muted)]">Discount price</p><p className="money mt-1 text-2xl font-black text-[var(--signal)]">{money(effectivePrice)}</p></div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-1.5 text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">Discount %<input value={form.discountPercent} onChange={(event) => updateForm(plan.plan, { discountPercent: event.target.value })} required type="number" min="0" max="90" step="0.01" className={fieldClass()} /></label>
                      <label className="grid gap-1.5 text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">Campaign label<input value={form.label} onChange={(event) => updateForm(plan.plan, { label: event.target.value })} required maxLength={120} placeholder="Winter business discount" className={fieldClass()} /></label>
                      <label className="grid gap-1.5 text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">Starts<input value={form.startsAt} onChange={(event) => updateForm(plan.plan, { startsAt: event.target.value })} type="datetime-local" className={fieldClass()} /></label>
                      <label className="grid gap-1.5 text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">Ends<input value={form.endsAt} onChange={(event) => updateForm(plan.plan, { endsAt: event.target.value })} type="datetime-local" className={fieldClass()} /></label>
                    </div>

                    <label className="flex min-h-12 items-center justify-between gap-4 rounded-[1.1rem] border border-[var(--line)] bg-[var(--surface)] px-4 font-black text-[var(--ink)]">
                      <span><span className="block">Enable discount</span><span className="mt-0.5 block text-xs font-semibold text-[var(--muted)]">Only effective inside the configured date window.</span></span>
                      <input type="checkbox" checked={form.active} onChange={(event) => updateForm(plan.plan, { active: event.target.checked })} className="h-5 w-5 accent-[var(--signal)]" />
                    </label>

                    <Button type="submit" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {saving ? "Saving discount..." : `Save ${plan.name} discount`}</Button>
                  </form>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
