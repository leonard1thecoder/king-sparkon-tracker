import { apiGet, apiPut } from "@/lib/api/client";

export type BillingDiscount = {
  id: number;
  businessPlan: "PLUS" | "PRO";
  discountPercent: number;
  label: string;
  active: boolean;
  effective: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
};

export type BillingDiscountPayload = {
  discountPercent: number;
  label: string;
  active: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
};

export function listBillingDiscounts() {
  return apiGet<BillingDiscount[]>("/admin/billing-discounts");
}

export function saveBillingDiscount(plan: "PLUS" | "PRO", payload: BillingDiscountPayload) {
  return apiPut<BillingDiscount, BillingDiscountPayload>(`/admin/billing-discounts/${plan}`, payload);
}
