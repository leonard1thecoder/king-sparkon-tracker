import { apiGet, apiPost } from "./client";
import type { BillingDashboard, BillingPlan } from "@/lib/types/billing";

export function listBillingPlans() {
  return apiGet<BillingPlan[]>("/billing/plans");
}

export function getBillingDashboard() {
  return apiGet<BillingDashboard>("/billing/dashboard");
}

export function getMyBilling() {
  return apiGet("/billing/me");
}

export function createStripeCheckoutSession(payload: Record<string, string>) {
  return apiPost<{ checkoutUrl: string; checkoutSessionId?: string }>("/billing/stripe/checkout-sessions", payload);
}

export function activateSubscription(subscriptionId: number) {
  return apiPost(`/billing/subscriptions/${subscriptionId}/activate`, {});
}
