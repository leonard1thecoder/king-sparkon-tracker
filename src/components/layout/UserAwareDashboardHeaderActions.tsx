"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { DashboardHeaderActions } from "@/components/layout/DashboardHeaderActions";
import { WorkerOnlineBarcodeHeaderAction } from "@/components/layout/WorkerOnlineBarcodeHeaderAction";
import { cn } from "@/lib/utils/cn";
import { isProductLine, isTicketLine, readTuckShopCart } from "@/lib/tuck-shop/cart";

type CartCounts = {
  products: number;
  tickets: number;
};

const emptyCounts: CartCounts = { products: 0, tickets: 0 };

function cartCounts(): CartCounts {
  return readTuckShopCart().reduce<CartCounts>((counts, line) => {
    if (isProductLine(line)) {
      counts.products += line.quantity;
    } else if (isTicketLine(line)) {
      counts.tickets += line.quantity;
    }
    return counts;
  }, { ...emptyCounts });
}

function countLabel(count: number) {
  return count > 99 ? "99+" : String(count);
}

function UserCartHeaderAction() {
  const [counts, setCounts] = useState<CartCounts>(emptyCounts);

  useEffect(() => {
    function refreshCounts() {
      setCounts(cartCounts());
    }

    refreshCounts();
    window.addEventListener("storage", refreshCounts);
    window.addEventListener("king-sparkon:tuck-shop-cart", refreshCounts);

    return () => {
      window.removeEventListener("storage", refreshCounts);
      window.removeEventListener("king-sparkon:tuck-shop-cart", refreshCounts);
    };
  }, []);

  const total = counts.products + counts.tickets;
  const title = total === 0
    ? "Cart is empty"
    : `Cart · ${counts.products} product${counts.products === 1 ? "" : "s"} · ${counts.tickets} ticket${counts.tickets === 1 ? "" : "s"}`;

  return (
    <Link
      href="/dashboard/user/shop/cart"
      aria-label={title}
      title={title}
      className={cn(
        "relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border bg-white text-[var(--ink)] shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:bg-[var(--surface)]",
        counts.products > 0 && counts.tickets > 0
          ? "border-sky-400 ring-2 ring-sky-200"
          : counts.products > 0
            ? "border-sky-400 ring-2 ring-sky-200"
            : counts.tickets > 0
              ? "border-sky-400 ring-2 ring-sky-200"
              : "border-[var(--line)] hover:border-[var(--gold)]",
      )}
    >
      <ShoppingCart className="h-4.5 w-4.5" />

      {counts.products > 0 ? (
        <span
          className="absolute -right-2 -top-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-sky-500 px-1 text-[0.62rem] font-black leading-none text-white shadow-md"
          aria-label={`${counts.products} product${counts.products === 1 ? "" : "s"} in cart`}
        >
          {countLabel(counts.products)}
        </span>
      ) : null}

      {counts.tickets > 0 ? (
        <span
          className="absolute -bottom-2 -right-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-sky-500 px-1 text-[0.62rem] font-black leading-none text-white shadow-md"
          aria-label={`${counts.tickets} ticket${counts.tickets === 1 ? "" : "s"} in cart`}
        >
          {countLabel(counts.tickets)}
        </span>
      ) : null}

      <span className="sr-only" aria-live="polite">{title}</span>
    </Link>
  );
}

function isUserWorkspace(role: string) {
  return role.toLowerCase().includes("user");
}

function isWorkerWorkspace(role: string) {
  return role.toLowerCase().includes("worker");
}

export function UserAwareDashboardHeaderActions({ role }: { role: string }) {
  const showUserCart = useMemo(() => isUserWorkspace(role), [role]);
  const showWorkerOnlineBarcode = useMemo(() => isWorkerWorkspace(role), [role]);

  if (showWorkerOnlineBarcode) {
    return (
      <div className="flex items-center justify-end gap-2">
        <WorkerOnlineBarcodeHeaderAction />
        <DashboardHeaderActions role={role} />
      </div>
    );
  }

  if (!showUserCart) {
    return <DashboardHeaderActions role={role} />;
  }

  return (
    <>
      <style jsx global>{`
        .user-dashboard-header-actions a[aria-label="Buy products"],
        .user-dashboard-header-actions a[aria-label="Buy tickets"] {
          display: none !important;
        }

        [class*="sm:grid-cols-[5rem_1fr_auto_auto]"]:has(> img.h-20.w-20) {
          border-color: rgb(125 211 252 / 0.9) !important;
          background: #ffffff !important;
          box-shadow: 0 8px 24px rgb(14 165 233 / 0.08) !important;
        }

        [class*="sm:grid-cols-[5rem_1fr_auto_auto]"]:has(> img.h-20.w-20) > img {
          border: 2px solid rgb(125 211 252 / 0.9);
        }

        [class*="sm:grid-cols-[5rem_1fr_auto_auto]"]:has(> img.h-20.w-20) > div:nth-child(2) > p:first-child {
          color: rgb(2 132 199) !important;
        }

        [class*="sm:grid-cols-[5rem_1fr_auto_auto]"]:has(> img.h-20.w-20) > input[type="number"] {
          border-color: rgb(125 211 252 / 0.9) !important;
          background: #ffffff !important;
        }

        [class*="sm:grid-cols-[5rem_1fr_auto_auto]"]:has(> div:first-child svg) {
          border-color: rgb(125 211 252 / 0.9) !important;
          background: #ffffff !important;
          box-shadow: 0 8px 24px rgb(14 165 233 / 0.08) !important;
        }

        [class*="sm:grid-cols-[5rem_1fr_auto_auto]"]:has(> div:first-child svg) > div:first-child {
          background: rgb(14 165 233) !important;
          color: white !important;
          box-shadow: inset 0 0 0 2px rgb(147 197 253 / 0.55);
        }

        [class*="sm:grid-cols-[5rem_1fr_auto_auto]"]:has(> div:first-child svg) > div:nth-child(2) > p:first-child {
          color: rgb(2 132 199) !important;
        }

        [class*="sm:grid-cols-[5rem_1fr_auto_auto]"]:has(> div:first-child svg) > input[type="number"] {
          border-color: rgb(125 211 252 / 0.9) !important;
          background: #ffffff !important;
        }
      `}</style>

      <div className="user-dashboard-header-actions flex items-center justify-end gap-2">
        <UserCartHeaderAction />
        <DashboardHeaderActions role={role} />
      </div>
    </>
  );
}
