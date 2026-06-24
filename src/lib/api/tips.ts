import { apiGet, apiPatch, apiPost } from "./client";
import type { PageResponse, Tip, TipPayload } from "@/lib/types/backend";

export function listTips() {
  return apiGet<PageResponse<Tip> | Tip[]>("/tips");
}

export function createTip(payload: TipPayload) {
  return apiPost<Tip, TipPayload>("/tips", payload);
}

export function markTipPaid(tipId: number) {
  return apiPatch<Tip>(`/tips/${tipId}/paid`, {});
}

export function requestTipWithdrawal() {
  return apiPost("/tips/withdrawals", {});
}

export function listTipWithdrawals() {
  return apiGet("/tips/withdrawals");
}
