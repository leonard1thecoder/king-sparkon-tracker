"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Loader2, ShoppingCart, WalletCards } from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { apiGet, normalizeApiError } from "@/lib/api/client";

type TipRow = Record<string, unknown>;
type TipPayload = TipRow[] | { content?: TipRow[]; data?: TipRow[]; items?: TipRow[]; withdrawableAmount?: number; accountTotal?: number; totalWithdrawable?: number; availableToWithdraw?: number };

function money(value: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(value);
}

function numeric(value: unknown) {
  const next = Number(value ?? 0);
  return Number.isFinite(next) ? next : 0;
}

function rowsFromPayload(payload: TipPayload): TipRow[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.content)) return payload.content;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.items)) return payload.items;
  return [];
}

function explicitTotal(payload: TipPayload) {
  if (Array.isArray(payload)) return undefined;
  const total = payload.withdrawableAmount ?? payload.availableToWithdraw ?? payload.totalWithdrawable ?? payload.accountTotal;
  return typeof total === "number" && Number.isFinite(total) ? total : undefined;
}

function isWithdrawable(row: TipRow) {
  const status = String(row.status ?? row.paymentStatus ?? row.state ?? "").toLowerCase();
  const paidFlag = row.paid === true || row.paidToWorker === true || row.withdrawn === true;
  if (paidFlag) return false;
  if (status.includes("paid") || status.includes("withdrawn") || status.includes("failed") || status.includes("cancel")) return false;
  return true;
}

function rowAmount(row: TipRow) {
  return numeric(row.netAmount ?? row.amountToWithdraw ?? row.tipAmount ?? row.grossAmount ?? row.amount);
}

function calculateWithdrawable(payload: TipPayload) {
  const total = explicitTotal(payload);
  if (total !== undefined) return total;
  return rowsFromPayload(payload).filter(isWithdrawable).reduce((sum, row) => sum + rowAmount(row), 0);
}

function ownerRole(role: string) {
  return role.toLowerCase().includes("owner");
}

function userRole(role: string) {
  return role.toLowerCase().includes("user");
}

function OwnerWithdrawAction() {
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadWithdrawableTotal() {
      try {
        const payload = await apiGet<TipPayload>("/tips");
        if (active) setTotal(calculateWithdrawable(payload));
      } catch (error) {
        normalizeApiError(error);
        if (active) setTotal(0);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadWithdrawableTotal();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex items-center justify-between gap-3 rounded-[1.2rem] border border-[var(--gold)]/40 bg-[var(--ink)] px-4 py-3 text-white shadow-[var(--shadow-soft)]">
      <div className="min-w-0">
        <p className="font-mono text-[0.62rem] font-black uppercase tracking-[0.14em] text-[var(--gold)]">Account total to withdraw</p>
        <p className="money mt-1 text-xl font-black tracking-[-0.03em]">{loading ? "Loading..." : money(total)}</p>
      </div>
      <Link href="/dashboard/owner/tips#withdraw" className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--gold)] px-4 text-xs font-black uppercase tracking-[0.1em] text-[var(--ink)] hover:bg-white">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <WalletCards className="h-4 w-4" />}
        Withdraw
      </Link>
    </div>
  );
}

export function DashboardHeaderActions({ role }: { role: string }) {
  const showCheckout = useMemo(() => userRole(role), [role]);
  const showWithdraw = useMemo(() => ownerRole(role), [role]);

  return (
    <div className="flex w-full flex-col gap-3 md:w-auto md:min-w-[23rem] xl:min-w-[28rem]">
      {showWithdraw ? <OwnerWithdrawAction /> : null}
      <div className="flex flex-wrap justify-end gap-2 rounded-[1.2rem] border border-[var(--line)] bg-white/80 p-2 shadow-[var(--shadow-soft)] backdrop-blur">
        {showCheckout ? (
          <Link href="/dashboard/user/shop#checkout" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-4 text-xs font-black uppercase tracking-[0.1em] text-white hover:bg-[var(--ink)]">
            <ShoppingCart className="h-4 w-4" /> Cart checkout
          </Link>
        ) : null}
        <LogoutButton className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--danger)] bg-white px-4 text-xs font-black uppercase tracking-[0.1em] text-[var(--danger)] hover:bg-[var(--danger)] hover:text-white disabled:opacity-60" />
      </div>
    </div>
  );
}
