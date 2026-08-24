import { apiGet, apiPost } from "@/lib/api/client";

export type UifBenefitRow = {
  idNumber?: string;
  benefitType?: string;
  benefit_type?: string;
  applicationNumber?: string;
  application_number?: string;
  applicationDate?: string;
  application_date?: string;
  claimStatus?: string;
  claim_status?: string;
  claim_status_display?: string;
  [key: string]: unknown;
};

export type UifBenefitsResponse = {
  benefits?: UifBenefitRow[];
  rows?: UifBenefitRow[];
  data?: UifBenefitRow[];
  history?: UifBenefitRow[];
  applicationHistory?: UifBenefitRow[];
  content?: UifBenefitRow[];
} | UifBenefitRow[];

export function normalizeUifRows(response: UifBenefitsResponse | null | undefined): UifBenefitRow[] {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.benefits)) return response.benefits;
  if (Array.isArray(response.rows)) return response.rows;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.history)) return response.history;
  if (Array.isArray(response.applicationHistory)) return response.applicationHistory;
  if (Array.isArray(response.content)) return response.content;
  // If response is object with single row fields directly
  if (typeof response === "object" && ("benefitType" in response || "benefit_type" in response)) {
    return [response as UifBenefitRow];
  }
  return [];
}

export function getUifBenefitRows(row: UifBenefitRow) {
  const idNumber = (row.idNumber ?? row.id_number ?? "") as string;
  const benefitType = (row.benefitType ?? row.benefit_type ?? row.type ?? "") as string;
  const applicationNumber = (row.applicationNumber ?? row.application_number ?? row.applicationNo ?? row.application_no ?? "") as string;
  const applicationDate = (row.applicationDate ?? row.application_date ?? row.date ?? "") as string;
  const claimStatus = (row.claimStatus ?? row.claim_status ?? row.claim_status_display ?? row.status ?? "") as string;
  return { idNumber, benefitType, applicationNumber, applicationDate, claimStatus };
}

export type UifBenefitsRequest = { idNumber: string };

export async function fetchUifBenefits(idNumber: string) {
  const payload: UifBenefitsRequest = { idNumber: idNumber.trim() };
  try {
    // Primary: POST with body {idNumber} to avoid sensitive ID in URL/logs per backend UifBenefitsController
    // Note: api client base is /api/backend, so path must be /uif/benefits (proxy adds /api prefix) — not /api/uif/benefits which would become /api/api/uif/benefits
    return await apiPost<UifBenefitsResponse, UifBenefitsRequest>(`/uif/benefits`, payload);
  } catch (err) {
    const status = (err as { status?: number })?.status;
    // Fallback to GET for backward compatibility if backend still on old GET endpoint
    if (status === 404) {
      try {
        const encoded = encodeURIComponent(payload.idNumber);
        return await apiGet<UifBenefitsResponse>(`/uif/benefits?idNumber=${encoded}`);
      } catch {
        throw err;
      }
    }
    throw err;
  }
}
