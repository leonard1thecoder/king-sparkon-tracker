import { apiGet, apiPatch, apiPost } from "./client";
import type { PageResponse } from "@/lib/types/backend";

export type AffiliateWithdrawalEligibility = {
  affiliateId: number;
  availableAmount: number;
  eligibleCommissionCount: number;
  paypalLinkReady: boolean;
  canWithdraw: boolean;
  paypalLink?: string | null;
};

export type AffiliateLead = {
  id: number;
  contactValue: string;
  contactType: "EMAIL" | "CELLPHONE" | string;
  subscriberType: "CLIENT" | "AFFILIATE" | "KINGSPARKON_SUBSCRIBER" | string;
  preferredChannel: "EMAIL" | "WHATSAPP" | "ANY" | string;
  source: string;
  niche: string;
  opportunity: string;
  affiliateRegistered: boolean;
  createdDate?: string | null;
};

export function getAffiliateProfile() {
  return apiGet("/affiliates/me");
}

export function completeAffiliateOnboarding(payload: Record<string, unknown>) {
  return apiPatch("/affiliates/me/onboarding", payload);
}

export function getAffiliateReferrals() {
  return apiGet("/affiliates/me/commissions");
}

export function getAffiliateAssets() {
  return apiGet("/affiliates/assets");
}

export function getAffiliateLeads(page = 0, size = 50) {
  return apiGet<PageResponse<AffiliateLead>>(`/affiliates/leads?page=${page}&size=${size}`);
}

export function getAffiliateCommissions() {
  return apiGet("/affiliates/me/commissions");
}

export function getAffiliatePayouts() {
  return apiGet("/affiliates/me/withdrawals");
}

export function getAffiliateWithdrawalEligibility() {
  return apiGet<AffiliateWithdrawalEligibility>("/affiliates/me/withdrawals/eligibility");
}

export function requestAffiliatePayout() {
  return apiPost("/affiliates/me/withdrawals", {});
}
