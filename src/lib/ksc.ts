import type { KscTransaction, KscWallet } from "@/lib/types/backend";

export function formatKsc(amount: number | null | undefined): string {
  const value = Number.isFinite(Number(amount)) ? Number(amount) : 0;
  // KSC is a platform coin, not ZAR: period decimals keep it visually
  // distinct from Rand formatting (en-ZA uses comma decimals).
  return `${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)} KSC`;
}

export function formatKscZar(amount: number | null | undefined): string {
  const value = Number.isFinite(Number(amount)) ? Number(amount) : 0;
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(value);
}

export function kscTotals(wallet: KscWallet | null | undefined): {
  available: number;
  reserved: number;
  total: number;
} {
  const available = Number(wallet?.availableBalance ?? 0);
  const reserved = Number(wallet?.reservedBalance ?? 0);
  return { available, reserved, total: available + reserved };
}

export function canSpendKsc(wallet: KscWallet | null | undefined, amount: number): boolean {
  if (!wallet || !Number.isFinite(amount) || amount <= 0) return false;
  return Number(wallet.availableBalance ?? 0) >= amount;
}

export function validateTopUpAmount(amountZar: number, min = 10, max = 50000): string | null {
  if (!Number.isFinite(amountZar) || amountZar < min) return `Top-up must be at least R${min}.`;
  if (amountZar > max) return `Top-up must not exceed R${max}.`;
  return null;
}

const ENTRY_LABELS: Record<string, string> = {
  TOP_UP_CREDIT: "Wallet top-up",
  PAYMENT_HOLD: "Payment authorized",
  PAYMENT_CAPTURE: "Payment captured",
  PAYMENT_RELEASE: "Authorization released",
  PAYMENT_REFUND: "Payment refunded",
  CONVERSION_IN: "ZAR conversion",
  ADJUSTMENT: "Adjustment",
};

export function kscEntryLabel(entryType: string | null | undefined): string {
  if (!entryType) return "Transaction";
  return ENTRY_LABELS[entryType] ?? entryType.replace(/_/g, " ").toLowerCase();
}

export function kscEntrySign(transaction: KscTransaction): 1 | -1 {
  return Number(transaction.amount ?? 0) < 0 ? -1 : 1;
}
