import { apiGet, apiPatch, apiPostIdempotent } from "./client";
import { apiContract, createIdempotencyKey } from "@/lib/api/contracts";
import type { Tip, TipPayload } from "@/lib/types/backend";

export type TipStatus = "CREATED" | "PENDING" | "PAID" | "FAILED" | string;

type ListTipsParams = {
  status?: TipStatus;
  page?: number;
  size?: number;
};

export function listTips({ status = "PAID", page, size }: ListTipsParams = {}) {
  const query = new URLSearchParams({ status });
  if (page !== undefined) query.set("page", String(page));
  if (size !== undefined) query.set("size", String(size));
  return apiGet<Tip[]>(`${apiContract.tips.root}?${query.toString()}`);
}

export function listOwnerTips() {
  return apiGet<Tip[]>(apiContract.tips.owner);
}

export function createTip(payload: TipPayload, idempotencyKey = createIdempotencyKey("tip")) {
  return apiPostIdempotent<Tip, TipPayload>(apiContract.tips.root, payload, idempotencyKey);
}

export function markTipPaid(tipId: number) {
  return apiPatch<Tip, { status: "PAID" }>(apiContract.tips.status(tipId), { status: "PAID" });
}

export function requestTipWithdrawal(idempotencyKey = createIdempotencyKey("tip-withdrawal")) {
  return apiPostIdempotent(apiContract.tips.withdrawals, {}, idempotencyKey);
}

export function listTipWithdrawals() {
  return apiGet(apiContract.tips.withdrawals);
}
