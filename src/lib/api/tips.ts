import { apiGet, apiPatch, apiPost } from "./client";
import type { PageResponse, Tip, TipPayload } from "@/lib/types/backend";

type ListTipsParams = {
  page?: number;
  size?: number;
};

export function listTips({ page = 0, size = 10 }: ListTipsParams = {}) {
  const query = new URLSearchParams({ page: String(page), size: String(size) });
  return apiGet<PageResponse<Tip> | Tip[]>(`/tips?${query.toString()}`);
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
