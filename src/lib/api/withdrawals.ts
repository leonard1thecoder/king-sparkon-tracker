import { apiGet, apiPost } from "./client";
import type { PageResponse, Withdrawal } from "@/lib/types/backend";

export function listTransactionWithdrawals() {
  return apiGet<PageResponse<Withdrawal> | Withdrawal[]>("/transactions/withdrawals");
}

export function requestTransactionWithdrawal() {
  return apiPost<Withdrawal>("/transactions/withdrawals", {});
}

export function listTipWithdrawals() {
  return apiGet<PageResponse<Withdrawal> | Withdrawal[]>("/tips/withdrawals");
}

export function requestTipWithdrawal() {
  return apiPost<Withdrawal>("/tips/withdrawals", {});
}
