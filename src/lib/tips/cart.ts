import type { Tip } from "@/lib/types/backend";

// Tip cart (tray) — localStorage primary, mirroring `src/lib/tuck-shop/cart.ts`.
// Unified flow on web and mobile: scan worker QR → set amount → submit
// stores a tip *intent* here → the cart pays all intents through the same
// shared PayFast cart payout as products, tickets and UIF carts
// (POST /payments/payfast). Tips are created server-side at fulfilment,
// so nothing is charged until the verified backend ITN confirms payment.

export type TipTrayLine = {
  workerId: number;
  workerLabel: string;
  tipAmount: number;
  createdAt: string;
  /** Legacy field from pre-cart tip trays (per-tip simple payments). Ignored by cart payout. */
  tipId?: number;
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
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((line) => Number.isFinite(Number(line?.workerId)) && Number(line?.tipAmount) > 0);
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

export function addTipIntent(workerId: number, tipAmount: number, workerLabel?: string): TipTrayLine[] {
  const normalizedLabel = workerLabel?.trim() || `Worker #${workerId}`;
  const lines = [
    { workerId, workerLabel: normalizedLabel, tipAmount: Number(tipAmount), createdAt: new Date().toISOString() },
    ...readTipTray().filter((line) => !(line.workerId === workerId && Number(line.tipAmount) === Number(tipAmount))),
  ];
  writeTipTray(lines);
  return lines;
}

/** Back-compat: older trays stored created tips; keep their worker/amount as intents. */
export function addTipToTray(tip: Tip, workerLabel?: string): TipTrayLine[] {
  return addTipIntent(tip.workerId, Number(tip.tipAmount ?? 0), workerLabel);
}

export function removeTipFromTray(workerId: number, tipAmount?: number): TipTrayLine[] {
  const lines = readTipTray().filter((line) =>
    tipAmount === undefined ? line.workerId !== workerId : !(line.workerId === workerId && Number(line.tipAmount) === Number(tipAmount)),
  );
  writeTipTray(lines);
  return lines;
}

export function clearTipTray(): TipTrayLine[] {
  writeTipTray([]);
  return [];
}
