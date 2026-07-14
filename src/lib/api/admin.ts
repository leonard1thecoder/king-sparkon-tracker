import { apiGet } from "./client";

export function listUsers() {
  return apiGet("/admin/users");
}

export function listBusinesses() {
  return apiGet("/admin/businesses");
}

export function listPlatformScanLogs() {
  return apiGet("/admin/scan-logs");
}
