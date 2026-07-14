import { apiGet, apiPostIdempotent } from "@/lib/api/client";
import { apiContract, createIdempotencyKey } from "@/lib/api/contracts";

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
  withdrawalFeePercent: number;
  onlineProductRevenue: number;
  ticketRevenue: number;
  tipRevenue: number;
  topUps: number;
  promotionSpend: number;
  withdrawn: number;
  pendingWithdrawalCount: number;
  recentEntries: WalletLedgerEntry[];
  payoutProvider: "PAYPAL" | string;
  payoutCurrency: string;
  zarPerPayoutUnit: number;
  payoutConfigured: boolean;
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
  provider?: string | null;
  providerBatchId?: string | null;
  providerStatus?: string | null;
  payoutAmount?: number | null;
  payoutCurrency?: string | null;
};

export type OwnerWithdrawalPayload = {
  amount: number;
  payoutMethod: "PAYPAL";
  payoutDestination: string;
  notes?: string | null;
};

export function getOwnerWallet() {
  return apiGet<OwnerWalletSummary>(apiContract.ownerFinance.wallet);
}

export function listOwnerWithdrawals() {
  return apiGet<OwnerWithdrawal[]>(apiContract.ownerFinance.withdrawals);
}

export function requestOwnerWithdrawal(
  payload: OwnerWithdrawalPayload,
  idempotencyKey = createIdempotencyKey("owner-withdrawal"),
) {
  return apiPostIdempotent<OwnerWithdrawal, OwnerWithdrawalPayload>(
    apiContract.ownerFinance.withdrawals,
    payload,
    idempotencyKey,
  );
}

export function listOwnerWalletLedger() {
  return apiGet<WalletLedgerEntry[]>(apiContract.ownerFinance.ledger);
}
