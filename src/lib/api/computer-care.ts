import { apiGet } from "./client";

// NM Computer Care plans (king-sparkon-tracker-backend):
// - GET /api/v1/basic-care-plans[?page&size] and /status/{status}
// - GET /api/v1/performance-care-plans[?page&size] and /status/{status}
// - GET /api/v1/business-care-plans[?page&size], /status/{status} and /tier/{bulkType}
// Called through the /api/backend proxy, so paths below are backend-relative.

export type CarePlanPage<T> = {
  content: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

export type BasicCarePlanItem = {
  id: number;
  operationSystemDisplayName?: string | null;
  upgradeDriversDisplayName?: string | null;
  additionalPerformanceSoftwareDisplayName?: string | null;
  totalQuote: number;
  status: number;
  statusDisplayName?: string | null;
  createdDate?: string | null;
};

export type PerformanceCarePlanItem = {
  id: number;
  deviceTypeDisplayName?: string | null;
  appliedUpgradePrice?: number | null;
  totalQuote: number;
  status: number;
  statusDisplayName?: string | null;
  createdDate?: string | null;
};

export type BusinessCarePlanItem = {
  id: number;
  bulkType?: string | null;
  bulkTypeDisplayName?: string | null;
  quantity?: number | null;
  unitPrice?: number | null;
  totalQuote: number;
  status: number;
  statusDisplayName?: string | null;
  createdDate?: string | null;
};

function pagedPath(base: string, page: number, size: number, status?: number): string {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  const root = status === undefined ? base : `${base}/status/${status}`;
  return `${root}?${params.toString()}`;
}

export function listBasicCarePlans(page = 0, size = 20, status?: number) {
  return apiGet<CarePlanPage<BasicCarePlanItem>>(pagedPath("/v1/basic-care-plans", page, size, status));
}

export function listPerformanceCarePlans(page = 0, size = 20, status?: number) {
  return apiGet<CarePlanPage<PerformanceCarePlanItem>>(pagedPath("/v1/performance-care-plans", page, size, status));
}

export function listBusinessCarePlans(page = 0, size = 20, status?: number) {
  return apiGet<CarePlanPage<BusinessCarePlanItem>>(pagedPath("/v1/business-care-plans", page, size, status));
}
