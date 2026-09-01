import { apiGet, apiPost } from "@/lib/api/client";
import type { Product } from "@/lib/types/backend";

export type ProductPromotion = {
  id: number;
  productId: number;
  businessId: number;
  businessName: string;
  promotionPrice: number;
  discountPercent?: number | null;
  originalPrice?: number | null;
  businessAccountEntryId?: number | null;
  startsAt: string;
  endsAt: string;
  active: boolean;
  createdAt: string;
  product: Product;
};

export function listActiveProductPromotions(limit = 12) {
  return apiGet<ProductPromotion[]>(`/product-promotions/active?limit=${Math.min(Math.max(limit, 1), 24)}`);
}

export function listOwnerProductPromotions() {
  return apiGet<ProductPromotion[]>("/product-promotions/owner");
}

export function promoteOwnerProduct(productId: number) {
  return apiPost<ProductPromotion, Record<string, never>>(`/product-promotions/${productId}`, {});
}

export function createDiscountSale(productId: number, payload: { discountPercent: number; startsAt: string; endsAt: string }) {
  return apiPost<ProductPromotion, typeof payload>(`/product-promotions/${productId}/discount-sale`, payload);
}
