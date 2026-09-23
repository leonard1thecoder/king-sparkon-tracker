"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BriefcaseBusiness, CheckCircle2, Cpu, Loader2, ShoppingCart, Wrench } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";
import { normalizeApiError } from "@/lib/api/client";
import {
  listBasicCarePlans,
  listBusinessCarePlans,
  listPerformanceCarePlans,
  type BasicCarePlanItem,
  type BusinessCarePlanItem,
  type CarePlanPage,
  type PerformanceCarePlanItem,
} from "@/lib/api/computer-care";
import { addServiceToCart, type ServiceLineKind } from "@/lib/tuck-shop/cart";

type PlanTab = "basic" | "performance" | "business";

type PlanCard = {
  id: number;
  headline: string;
  detail: string;
  totalQuote: number;
  status: number;
  statusDisplayName?: string | null;
  createdDate?: string | null;
};

const TABS: Array<{ id: PlanTab; label: string; icon: typeof Wrench; blurb: string }> = [
  { id: "basic", label: "Basic Care", icon: Wrench, blurb: "OS installs, driver refreshes and software add-ons." },
  { id: "performance", label: "Performance Care", icon: Cpu, blurb: "CPU, RAM and GPU upgrades with session pricing." },
  { id: "business", label: "Business Care", icon: BriefcaseBusiness, blurb: "Bulk device servicing per business tier." },
];

const STATUS_OPTIONS = [
  { code: "", label: "All statuses" },
  { code: "0", label: "Created" },
  { code: "1", label: "Missing payment" },
  { code: "2", label: "Quote rejected" },
  { code: "3", label: "Paid" },
  { code: "4", label: "Waiting appointment" },
  { code: "5", label: "Completed" },
] as const;

function money(value: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(Number(value || 0));
}

function formatDate(value?: string | null): string {
  if (!value) return "Date not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-ZA", { dateStyle: "medium" }).format(date);
}

function statusTone(status: number): "confirm" | "signal" | "neutral" {
  if (status === 3 || status === 5) return "confirm";
  if (status === 0 || status === 1 || status === 4) return "signal";
  return "neutral";
}

function toBasicCards(page: CarePlanPage<BasicCarePlanItem> | null): PlanCard[] {
  return (page?.content ?? []).map((plan) => ({
    id: plan.id,
    headline: plan.operationSystemDisplayName || "Basic Care plan",
    detail: [plan.upgradeDriversDisplayName, plan.additionalPerformanceSoftwareDisplayName]
      .filter(Boolean)
      .join(" · "),
    totalQuote: plan.totalQuote,
    status: plan.status,
    statusDisplayName: plan.statusDisplayName,
    createdDate: plan.createdDate,
  }));
}

function toPerformanceCards(page: CarePlanPage<PerformanceCarePlanItem> | null): PlanCard[] {
  return (page?.content ?? []).map((plan) => ({
    id: plan.id,
    headline: plan.deviceTypeDisplayName ? `${plan.deviceTypeDisplayName} performance upgrade` : "Performance Care plan",
    detail: plan.appliedUpgradePrice != null ? `Applied upgrade ${money(plan.appliedUpgradePrice)}` : "",
    totalQuote: plan.totalQuote,
    status: plan.status,
    statusDisplayName: plan.statusDisplayName,
    createdDate: plan.createdDate,
  }));
}

function toBusinessCards(page: CarePlanPage<BusinessCarePlanItem> | null): PlanCard[] {
  return (page?.content ?? []).map((plan) => ({
    id: plan.id,
    headline: plan.bulkTypeDisplayName || "Business Care plan",
    detail: [
      plan.quantity != null ? `${plan.quantity} device${plan.quantity === 1 ? "" : "s"}` : "",
      plan.unitPrice != null ? `${money(plan.unitPrice)} each` : "",
    ]
      .filter(Boolean)
      .join(" · "),
    totalQuote: plan.totalQuote,
    status: plan.status,
    statusDisplayName: plan.statusDisplayName,
    createdDate: plan.createdDate,
  }));
}

export function ComputerCareTabs() {
  const [tab, setTab] = useState<PlanTab>("basic");
  const [status, setStatus] = useState<string>("");
  const [cards, setCards] = useState<PlanCard[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<number | null>(null);

  const activeTab = useMemo(() => TABS.find((entry) => entry.id === tab) ?? TABS[0], [tab]);

  const serviceKind: ServiceLineKind =
    tab === "basic" ? "BASIC_CARE" : tab === "performance" ? "PERFORMANCE_CARE" : "BUSINESS_CARE";

  function addQuoteToCart(card: PlanCard) {
    addServiceToCart({
      serviceKind,
      referenceId: String(card.id),
      label: `${activeTab.label} #${card.id} — ${card.headline}`,
      unitPrice: card.totalQuote,
    });
    setAddedId(card.id);
    window.setTimeout(() => setAddedId((current) => (current === card.id ? null : current)), 2000);
  }

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const statusCode = status === "" ? undefined : Number(status);
      let next: PlanCard[] = [];
      let total = 0;
      if (tab === "basic") {
        const page = await listBasicCarePlans(0, 20, statusCode);
        next = toBasicCards(page);
        total = page.totalItems;
      } else if (tab === "performance") {
        const page = await listPerformanceCarePlans(0, 20, statusCode);
        next = toPerformanceCards(page);
        total = page.totalItems;
      } else {
        const page = await listBusinessCarePlans(0, 20, statusCode);
        next = toBusinessCards(page);
        total = page.totalItems;
      }
      setCards(next);
      setTotalItems(total);
    } catch (exception) {
      setCards([]);
      setTotalItems(0);
      setError(normalizeApiError(exception).message);
    } finally {
      setLoading(false);
    }
  }, [tab, status]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="grid gap-6">
      <div className="grid gap-2 sm:grid-cols-3">
        {TABS.map(({ id, label, icon: Icon, blurb }) => {
          const active = id === tab;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              aria-pressed={active}
              className={`grid gap-2 rounded-[1.5rem] border p-4 text-left transition ${
                active
                  ? "border-[var(--signal)] bg-[var(--signal-soft)] shadow-[var(--shadow-soft)]"
                  : "border-[var(--line)] bg-white hover:border-[var(--signal)]"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className={`grid h-9 w-9 place-items-center rounded-[0.8rem] ${active ? "bg-[var(--signal)] text-white" : "bg-[var(--ink)] text-[var(--gold)]"}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="font-black tracking-[-0.02em] text-[var(--ink)]">{label}</span>
              </span>
              <span className="text-xs leading-5 text-[var(--steel)]">{blurb}</span>
            </button>
          );
        })}
      </div>

      <Card className="p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.16em] text-[var(--signal)]">
              {activeTab.label}
            </p>
            <h3 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[var(--ink)]">
              {totalItems} plan{totalItems === 1 ? "" : "s"}
            </h3>
          </div>
          <label className="grid gap-1.5 text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">
            Status
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="min-h-11 rounded-full border border-[var(--line)] bg-white px-5 text-sm font-bold normal-case tracking-normal text-[var(--ink)] outline-none focus:border-[var(--signal)]"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.code || "all"} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error ? (
          <p className="mt-4 rounded-[var(--radius-lg)] border border-[var(--danger)]/30 bg-[var(--danger)]/10 p-4 text-sm font-bold text-[var(--danger)]">
            {error}
          </p>
        ) : null}

        <div className="mt-4">
          {loading ? (
            <div className="flex min-h-40 items-center justify-center gap-3 text-sm font-black text-[var(--steel)]">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading {activeTab.label.toLowerCase()} plans
            </div>
          ) : cards.length === 0 ? (
            <div className="rounded-[1.25rem] border border-[var(--line)] bg-[var(--surface)] p-10 text-center">
              <Wrench className="mx-auto h-10 w-10 text-[var(--signal)]" />
              <p className="mt-3 text-lg font-black text-[var(--ink)]">No plans found</p>
              <p className="mt-2 text-sm text-[var(--steel)]">Try a different status filter.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {cards.map((card) => (
                <div key={card.id} className="grid gap-3 rounded-[1.5rem] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-soft)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-black text-[var(--ink)]">{card.headline}</p>
                      {card.detail ? <p className="mt-1 truncate text-xs font-semibold text-[var(--steel)]">{card.detail}</p> : null}
                    </div>
                    <StatusPill label={card.statusDisplayName || `Status ${card.status}`} tone={statusTone(card.status)} />
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-[var(--line)] pt-3">
                    <p className="money text-lg font-black text-[var(--ink)]">{money(card.totalQuote)}</p>
                    <p className="text-xs font-semibold text-[var(--steel)]">{formatDate(card.createdDate)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => addQuoteToCart(card)}
                      className={`inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-full border px-4 text-xs font-black transition ${
                        addedId === card.id
                          ? "border-[var(--confirm)] bg-[var(--confirm)] text-white"
                          : "border-[var(--signal)] bg-[var(--signal)] text-white hover:bg-[var(--ink)]"
                      }`}
                    >
                      {addedId === card.id ? (
                        <><CheckCircle2 className="h-4 w-4" /> Added to cart</>
                      ) : (
                        <><ShoppingCart className="h-4 w-4" /> Add quote to cart</>
                      )}
                    </button>
                    <Link
                      href="/dashboard/user/shop/cart"
                      aria-label="Open shared cart"
                      title="Open shared cart"
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--line)] bg-white text-[var(--ink)] hover:border-[var(--signal)]"
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </section>
  );
}
