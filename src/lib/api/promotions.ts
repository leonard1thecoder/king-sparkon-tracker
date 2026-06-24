import { apiGet, apiPost } from "./client";
import type { PageResponse, Promotion, PromotionPayload, PromotionQuote } from "@/lib/types/backend";

export function getPromotionQuote() {
  return apiGet<PromotionQuote>("/promotions/quote");
}

export function listPromotions() {
  return apiGet<PageResponse<Promotion> | Promotion[]>("/promotions");
}

export function createPromotion(payload: PromotionPayload) {
  return apiPost<Promotion, PromotionPayload>("/promotions", payload);
}

export function createPlatformPromotion(payload: PromotionPayload) {
  return apiPost<Promotion, PromotionPayload>("/admin/promotions/registered-subscribers", payload);
}
