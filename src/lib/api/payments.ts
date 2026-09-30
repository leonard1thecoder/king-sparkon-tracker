import { apiClient } from "@/lib/api/client";
import type { CreateEmbeddedCartPaymentPayload } from "@/lib/types/backend";

export type PayPalOrder = {
  orderId: string;
  approveUrl: string;
  amountUsd: number;
  currency: string;
  merchantReference: string;
  status: string;
};

export type PayPalOrderStatus = {
  orderId: string;
  status: string;
  fulfilled: boolean;
  amountUsd: number;
  currency: string;
  merchantReference: string;
};

function checkoutIdempotencyKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function createPayPalOrder(payload: CreateEmbeddedCartPaymentPayload) {
  const { data } = await apiClient.post<PayPalOrder>("/payments/paypal/orders", {
    ...payload,
    idempotencyKey: payload.idempotencyKey || checkoutIdempotencyKey(),
  });
  return data;
}

export async function capturePayPalOrder(orderId: string) {
  const { data } = await apiClient.post<PayPalOrderStatus>(`/payments/paypal/orders/${encodeURIComponent(orderId)}/capture`);
  return data;
}

export async function getPayPalOrderStatus(orderId: string) {
  const { data } = await apiClient.get<PayPalOrderStatus>(`/payments/paypal/orders/${encodeURIComponent(orderId)}`);
  return data;
}
