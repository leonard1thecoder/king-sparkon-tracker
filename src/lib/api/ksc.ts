import { apiDelete, apiGet, apiPost, apiPostIdempotent } from "@/lib/api/client";
import { createIdempotencyKey } from "@/lib/api/contracts";
import type {
  AuthorizeKscPaymentPayload,
  CreateKscMandatePayload,
  CreateKscTopUpPayload,
  KscAdminOverview,
  KscMandate,
  KscPayment,
  KscTopUp,
  KscTransaction,
  KscWallet,
} from "@/lib/types/backend";

export function getKscWallet() {
  return apiGet<KscWallet>("/ksc/wallet");
}

export function listKscTransactions() {
  return apiGet<KscTransaction[]>("/ksc/wallet/transactions");
}

export function createKscTopUp(
  payload: CreateKscTopUpPayload,
  idempotencyKey = createIdempotencyKey("ksc-topup"),
) {
  return apiPostIdempotent<KscTopUp, CreateKscTopUpPayload>(
    "/ksc/topups",
    { ...payload, idempotencyKey: payload.idempotencyKey ?? idempotencyKey },
    idempotencyKey,
  );
}

export function getKscTopUp(topUpId: number) {
  return apiGet<KscTopUp>(`/ksc/topups/${topUpId}`);
}

export function authorizeKscPayment(
  payload: AuthorizeKscPaymentPayload,
  idempotencyKey = createIdempotencyKey("ksc-payment"),
) {
  return apiPostIdempotent<KscPayment, AuthorizeKscPaymentPayload>(
    "/ksc/payments/authorize",
    { ...payload, idempotencyKey: payload.idempotencyKey ?? idempotencyKey },
    idempotencyKey,
  );
}

export function captureKscPayment(
  paymentId: string,
  idempotencyKey = createIdempotencyKey("ksc-capture"),
) {
  return apiPostIdempotent<KscPayment, Record<string, never>>(
    `/ksc/payments/${encodeURIComponent(paymentId)}/capture`,
    {},
    idempotencyKey,
  );
}

export function cancelKscPayment(
  paymentId: string,
  idempotencyKey = createIdempotencyKey("ksc-cancel"),
) {
  return apiPostIdempotent<KscPayment, Record<string, never>>(
    `/ksc/payments/${encodeURIComponent(paymentId)}/cancel`,
    {},
    idempotencyKey,
  );
}

export function refundKscPayment(
  paymentId: string,
  idempotencyKey = createIdempotencyKey("ksc-refund"),
) {
  return apiPostIdempotent<KscPayment, Record<string, never>>(
    `/ksc/payments/${encodeURIComponent(paymentId)}/refund`,
    {},
    idempotencyKey,
  );
}

export function getKscPayment(paymentId: string) {
  return apiGet<KscPayment>(`/ksc/payments/${encodeURIComponent(paymentId)}`);
}

export function createKscMandate(payload: CreateKscMandatePayload) {
  return apiPost<KscMandate, CreateKscMandatePayload>("/ksc/mandates", payload);
}

export function listKscMandates() {
  return apiGet<KscMandate[]>("/ksc/mandates");
}

export function revokeKscMandate(mandateId: number) {
  return apiDelete<KscMandate>(`/ksc/mandates/${mandateId}`);
}

export function getKscAdminOverview() {
  return apiGet<KscAdminOverview>("/ksc/admin/overview");
}
