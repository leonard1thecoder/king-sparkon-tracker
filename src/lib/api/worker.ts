import { apiGet, apiPost } from "./client";

export function getWorkerProfile() {
  return apiGet("/users/me");
}

export function claimReference(reference: string, payload: Record<string, unknown>) {
  return apiPost(`/barcodes/reference/${encodeURIComponent(reference)}/claim`, payload);
}

export function claimBarcode(barcodeId: number) {
  return apiPost(`/barcodes/${barcodeId}/claim`, {});
}

export function lookupReference(reference: string) {
  return apiGet(`/barcodes/reference/${encodeURIComponent(reference)}`);
}
