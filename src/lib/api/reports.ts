import { apiGet } from "./client";

export function getInventorySummary() {
  return apiGet("/reports/inventory-summary");
}

export function getAlcoholReport() {
  return apiGet("/reports/alcohol");
}

export function getProductMovementReport() {
  return apiGet("/reports/product-movement");
}
