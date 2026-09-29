import { apiGet, apiPost } from "@/lib/api/client";
import type { RefundRequest } from "@/lib/types/backend";

export function requestProductRefund(payload: { transactionId: number; transactionItemId: number }) {
  return apiPost<RefundRequest, typeof payload>("/v1/refunds/products", payload);
}

export function requestTicketRefund(payload: { userTicketId: string }) {
  return apiPost<RefundRequest, typeof payload>("/v1/refunds/tickets", payload);
}

export function listMyRefunds() {
  return apiGet<RefundRequest[]>("/v1/refunds/me");
}

export function listPendingRefunds() {
  return apiGet<RefundRequest[]>("/v1/refunds/pending");
}

export function approveRefund(refundId: number) {
  return apiPost<RefundRequest>(`/v1/refunds/${refundId}/approve`);
}

export function rejectRefund(refundId: number, reason: string) {
  return apiPost<RefundRequest, { reason: string }>(`/v1/refunds/${refundId}/reject`, { reason });
}
