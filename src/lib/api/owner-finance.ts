import { apiGet, apiPost } from "@/lib/api/client";

export type WalletLedgerEntry = {
  id: number;
  businessId: number;
  entryType: string;
  status: string;
  amount: number;
  balanceAfter: number;
  provider?: string | null;
  providerReference?: string | null;
  checkoutUrl?: string | null;
  description?: string | null;
  createdBy?: string | null;
  createdDate: string;
  modifiedDate?: string | null;
};

export type OwnerWalletSummary = {
  businessId: number;
  businessName: string;
  availableBalance: number;
  minimumWithdrawalAmount: number;
  onlineProductRevenue: number;
  ticketRevenue: number;
  tipRevenue: number;
  topUps: number;
  promotionSpend: number;
  withdrawn: number;
  pendingWithdrawalCount: number;
  recentEntries: WalletLedgerEntry[];
};

export type OwnerWithdrawal = {
  id: string;
  source: "UNIFIED" | "PRODUCT" | "TIP" | "TICKET" | string;
  businessId: number;
  grossAmount: number;
  feeAmount: number;
  netAmount: number;
  currency: string;
  status: string;
  payoutMethod?: string | null;
  payoutDestination?: string | null;
  notes?: string | null;
  requestedAt?: string | null;
  processedAt?: string | null;
};

export type OwnerWithdrawalPayload = {
  amount: number;
  payoutMethod: string;
  payoutDestination?: string | null;
  notes?: string | null;
};

export function getOwnerWallet() {
  return apiGet<OwnerWalletSummary>("/business-account/wallet");
}

export function listOwnerWithdrawals() {
  return apiGet<OwnerWithdrawal[]>("/business-account/withdrawals");
}

export function requestOwnerWithdrawal(payload: OwnerWithdrawalPayload) {
  return apiPost<OwnerWithdrawal, OwnerWithdrawalPayload>("/business-account/withdrawals", payload);
}

export function listOwnerWalletLedger() {
  return apiGet<WalletLedgerEntry[]>("/business-account/ledger");
}
