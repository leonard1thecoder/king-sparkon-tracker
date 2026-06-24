import { apiGet, apiPatch, apiPost } from "./client";
import type { PageResponse, Product } from "@/lib/types/backend";

export function listProducts() {
  return apiGet<PageResponse<Product> | Product[]>("/products");
}

export function getProduct(productId: number) {
  return apiGet<Product>(`/products/${productId}`);
}

export function lookupBarcode(barcode: string) {
  return apiGet(`/products/barcode/${encodeURIComponent(barcode)}`);
}

export function createProduct(payload: Record<string, unknown>) {
  return apiPost<Product>("/products", payload);
}

export function updateStockQuantity(productId: number, quantity: number) {
  return apiPatch<Product>(`/products/${productId}/quantity`, { quantity });
}

export function assignBarcodes(productId: number, payload: { barcodes: string[]; referenceEmail?: string }) {
  return apiPost<Product>(`/products/${productId}/barcodes`, payload);
}

export function submitProductApproval(productId: number) {
  return apiPost<Product>(`/products/${productId}/submit-approval`);
}
