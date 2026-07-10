import { apiGet, apiPost } from "./client";

export function getAffiliateProfile() {
  return apiGet("/users/me");
}

export function completeAffiliateOnboarding(payload: Record<string, unknown>) {
  return apiPost("/affiliate/onboarding", payload);
}

export function getAffiliateReferrals() {
  return apiGet("/affiliate/referrals");
}

export function getAffiliateAssets() {
  return apiGet("/affiliate/assets");
}

export function getAffiliateCommissions() {
  return apiGet("/affiliate/commissions");
}

export function getAffiliatePayouts() {
  return apiGet("/affiliate/payouts");
}

export function requestAffiliatePayout() {
  return apiPost("/affiliate/payouts", {});
}
