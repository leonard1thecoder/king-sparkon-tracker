"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, History, ShoppingBag, ShoppingCart, Store } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusPill } from "@/components/ui/StatusPill";
import {
  money,
  readTuckShopPurchaseHistory,
  type TuckShopPurchaseHistoryItem,
} from "@/lib/tuck-shop/cart";

const PURCHASES_PER_PAGE = 5;

function statusTone(status?: string | null) {
  const value = String(status ?? "PENDING").toUpperCase();
  if (["PAID", "SUCCESS", "COMPLETED"].includes(value)) return "confirm" as const;
  if (["PENDING", "PROCESSING", "CREATED"].includes(value)) return "signal" as const;
  return "neutral" as const;
}

export function UserCartPurchaseHistory() {
  const [purchaseHistory, setPurchaseHistory] = useState<TuckShopPurchaseHistoryItem[]>([]);
  const [page, setPage] = useState(0);

  useEffect(() => {
    function refreshPurchaseHistory() {
      setPurchaseHistory(readTuckShopPurchaseHistory());
    }

    refreshPurchaseHistory();
    window.addEventListener("storage", refreshPurchaseHistory);
    window.addEventListener("king-sparkon:tuck-shop-purchase-history", refreshPurchaseHistory);

    return () => {
      window.removeEventListener("storage", refreshPurchaseHistory);
      window.removeEventListener("king-sparkon:tuck-shop-purchase-history", refreshPurchaseHistory);
    };
  }, []);

  const totalSpent = useMemo(
    () => purchaseHistory.reduce((total, purchase) => total + Number(purchase.productTotal ?? 0), 0),
    [purchaseHistory],
  );
  const businessCount = useMemo(
    () => new Set(purchaseHistory.map((purchase) => purchase.businessName ?? purchase.businessId ?? "Unknown business")).size,
    [purchaseHistory],
  );
  const totalPages = Math.max(1, Math.ceil(purchaseHistory.length / PURCHASES_PER_PAGE));
  const visiblePurchases = useMemo(
    () => purchaseHistory.slice(page * PURCHASES_PER_PAGE, page * PURCHASES_PER_PAGE + PURCHASES_PER_PAGE),
    [page, purchaseHistory],
  );

  useEffect(() => {
    setPage((current) => Math.min(current, Math.max(totalPages - 1, 0)));
  }, [totalPages]);

  return (
    <section className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Purchased carts" value={String(purchaseHistory.length)} detail="Saved checkout records" tone="signal" icon={<ShoppingCart className="h-5 w-5" />} />
        <MetricCard label="Businesses" value={String(businessCount)} detail="Businesses purchased from" icon={<Store className="h-5 w-5" />} />
        <MetricCard label="Total spent" value={money(totalSpent)} detail="Saved product purchase value" tone="confirm" icon={<History className="h-5 w-5" />} />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>My carts and purchases</CardTitle>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--steel)]">
              Review completed product carts, the business that supplied each order, payment state, products, quantities, and totals.
            </p>
          </div>
          <Link href="/dashboard/user/shop/cart" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white hover:bg-[var(--ink)]">
            Open active cart <ShoppingCart className="h-4 w-4" />
          </Link>
        </CardHeader>

        <CardContent className="grid gap-4">
          {purchaseHistory.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-white p-8 text-center">
              <ShoppingBag className="mx-auto h-10 w-10 text-[var(--signal)]" />
              <p className="mt-3 text-xl font-black text-[var(--ink)]">No purchased carts yet</p>
              <p className="mt-2 text-sm leading-6 text-[var(--steel)]">
                Completed product checkouts will appear here with business, product, payment, and total information.
              </p>
              <Link href="/dashboard/user/shop" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white hover:bg-[var(--ink)]">
                Buy products
              </Link>
            </div>
          ) : (
            <>
              {visiblePurchases.map((purchase) => (
                <article key={purchase.id} className="overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-white shadow-[var(--shadow-soft)]">
                  <div className="flex flex-col gap-3 border-b border-[var(--line)] bg-[var(--surface)] p-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.16em] text-[var(--signal)]">
                        {purchase.businessName ?? `Business #${purchase.businessId ?? "-"}`}
                      </p>
                      <h3 className="mt-1 text-xl font-black text-[var(--ink)]">Cart #{purchase.transactionId ?? purchase.id}</h3>
                      <p className="mt-1 text-xs font-bold text-[var(--steel)]">{new Date(purchase.createdAt).toLocaleString("en-ZA")}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusPill label={purchase.paymentStatus ?? "PENDING"} tone={statusTone(purchase.paymentStatus)} />
                      <p className="money text-2xl font-black text-[var(--ink)]">{money(purchase.productTotal)}</p>
                    </div>
                  </div>

                  <div className="grid gap-2 p-4">
                    {purchase.items.map((item) => (
                      <div key={`${purchase.id}-${item.productId}`} className="flex flex-col gap-2 rounded-[1rem] border border-[var(--line)] bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-black text-[var(--ink)]">{item.productName}</p>
                          <p className="text-xs font-bold text-[var(--steel)]">Qty {item.quantity} · {money(item.unitPrice)} each</p>
                        </div>
                        <p className="money font-black text-[var(--ink)]">{money(item.lineTotal)}</p>
                      </div>
                    ))}
                    {purchase.paymentReference ? <p className="code mt-2 break-all text-xs font-bold text-[var(--muted)]">Reference: {purchase.paymentReference}</p> : null}
                  </div>
                </article>
              ))}

              <div className="flex flex-col items-center justify-between gap-4 border-t border-[var(--line)] pt-4 sm:flex-row">
                <button type="button" onClick={() => setPage((current) => Math.max(0, current - 1))} disabled={page === 0} className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 text-sm font-black text-[var(--ink)] hover:border-[var(--gold)] disabled:opacity-35 sm:w-auto">
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>
                <p className="text-sm font-black text-[var(--ink)]">Page {page + 1} of {totalPages} · Up to {PURCHASES_PER_PAGE} carts</p>
                <button type="button" onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))} disabled={page >= totalPages - 1} className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-[var(--ink)] bg-[var(--ink)] px-4 text-sm font-black text-white hover:bg-[var(--signal)] disabled:opacity-35 sm:w-auto">
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
