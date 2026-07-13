import { apiGet, apiPost } from "@/lib/api/client";
import type { Product } from "@/lib/types/backend";

export type ProductPromotion = {
  id: number;
  productId: number;
  businessId: number;
  businessName: string;
  promotionPrice: number;
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
