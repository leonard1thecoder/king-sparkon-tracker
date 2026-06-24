import { apiGet } from "./client";

export function listAuditLogs() {
  return apiGet("/audit-logs");
}

export function listScanLogs() {
  return apiGet("/audit-logs?entityType=BARCODE");
}
