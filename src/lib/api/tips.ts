import { apiGet, apiPatch, apiPost } from "./client";
import type { Tip, TipPayload } from "@/lib/types/backend";

export type TipStatus = "CREATED" | "PENDING" | "PAID" | "FAILED" | string;

type ListTipsParams = {
  status?: TipStatus;
};

export function listTips({ status = "PAID" }: ListTipsParams = {}) {
  const query = new URLSearchParams({ status });
  return apiGet<Tip[]>(`/tips?${query.toString()}`);
}

export function listOwnerTips() {
  return apiGet<Tip[]>("/tips/owner");
}

export function createTip(payload: TipPayload) {
  return apiPost<Tip, TipPayload>("/tips", payload);
}

export function markTipPaid(tipId: number) {
  return apiPatch<Tip, { status: "PAID" }>(`/tips/${tipId}/status`, { status: "PAID" });
}

export function requestTipWithdrawal() {
  return apiPost("/tips/withdrawals", {});
}

export function listTipWithdrawals() {
  return apiGet("/tips/withdrawals");
}
