import type { Tip } from "@/lib/types/backend";

// Tip cart (tray) — localStorage primary, mirroring `src/lib/tuck-shop/cart.ts`.
// Flow on web and mobile is identical: scan worker QR → set amount →
// submit creates the tip (UNPAID) and adds it here → pay from the cart.
// Payment itself stays per-tip through the PayFast handoff already on the tip.

export type TipTrayLine = {
  tipId: number;
  workerId: number;
  workerLabel: string;
  tipAmount: number;
  paymentReference?: string | null;
  paymentUrl?: string | null;
  createdAt: string;
};

export const TIP_TRAY_STORAGE_KEY = "king-sparkon-tip-tray";
export const TIP_TRAY_EVENT = "king-sparkon:tip-tray";

function isBrowser() {
  return typeof window !== "undefined";
}

export function readTipTray(): TipTrayLine[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(TIP_TRAY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TipTrayLine[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeTipTray(lines: TipTrayLine[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(TIP_TRAY_STORAGE_KEY, JSON.stringify(lines));
  window.dispatchEvent(new CustomEvent(TIP_TRAY_EVENT, { detail: lines }));
  window.dispatchEvent(new Event("storage"));
}

export function tipTrayCount() {
  return readTipTray().length;
}

export function tipTrayTotal() {
  return readTipTray().reduce((sum, line) => sum + Number(line.tipAmount ?? 0), 0);
}

export function addTipToTray(tip: Tip, workerLabel?: string): TipTrayLine[] {
  const lines = readTipTray().filter((line) => line.tipId !== tip.id);
  lines.unshift({
    tipId: tip.id,
    workerId: tip.workerId,
    workerLabel: workerLabel?.trim() || `Worker #${tip.workerId}`,
    tipAmount: Number(tip.tipAmount ?? 0),
    paymentReference: tip.paymentReference ?? null,
    paymentUrl: tip.paymentUrl ?? null,
    createdAt: new Date().toISOString(),
  });
  writeTipTray(lines);
  return lines;
}

export function removeTipFromTray(tipId: number): TipTrayLine[] {
  const lines = readTipTray().filter((line) => line.tipId !== tipId);
  writeTipTray(lines);
  return lines;
}

export function clearTipTray(): TipTrayLine[] {
  writeTipTray([]);
  return [];
}

/** Drop tray lines whose backend tip record is now PAID (reconciled via /tips/sent). */
export function reconcileTipTray(paidTipIds: Set<number>): TipTrayLine[] {
  if (paidTipIds.size === 0) return readTipTray();
  const lines = readTipTray().filter((line) => !paidTipIds.has(line.tipId));
  writeTipTray(lines);
  return lines;
}
