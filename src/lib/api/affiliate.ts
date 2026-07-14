import { apiGet, apiPatch, apiPost } from "./client";

export type AffiliateWithdrawalEligibility = {
  affiliateId: number;
  availableAmount: number;
  eligibleCommissionCount: number;
  paypalLinkReady: boolean;
  canWithdraw: boolean;
  paypalLink?: string | null;
};

export function getAffiliateProfile() {
  return apiGet("/affiliates/me");
}

export function completeAffiliateOnboarding(payload: Record<string, unknown>) {
  return apiPatch("/affiliates/me/onboarding", payload);
}

export function getAffiliateReferrals() {
  return apiGet("/affiliate/referrals");
}

export function getAffiliateAssets() {
  return apiGet("/affiliate/assets");
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
