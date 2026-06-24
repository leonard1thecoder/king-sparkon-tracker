import { apiGet, apiPost } from "./client";
import type { PageResponse, Transaction, TransactionPayload } from "@/lib/types/backend";

export function listTransactions() {
  return apiGet<PageResponse<Transaction> | Transaction[]>("/transactions");
}

export function createTransaction(payload: TransactionPayload) {
  const normalized: TransactionPayload = {
    ...payload,
    items: payload.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      ...(payload.type === "SELL" ? { barcodes: item.barcodes ?? [] } : {}),
    })),
  };

  return apiPost<Transaction, TransactionPayload>("/transactions", normalized);
}

export function requestTransactionWithdrawal(payload?: Record<string, unknown>) {
  return apiPost("/transactions/withdrawals", payload ?? {});
}
