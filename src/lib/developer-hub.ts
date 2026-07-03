export type DeveloperHubScope = "owner" | "admin";

export type SoftwareDevelopmentStage =
  | "REQUESTED"
  | "DISCOVERY"
  | "QUOTE_SENT"
  | "APPROVED"
  | "DESIGN"
  | "DEVELOPMENT"
  | "CI_CD"
  | "QA_REGRESSION"
  | "CLOUD_MAINTENANCE"
  | "UAT"
  | "LIVE_SUPPORT";

export type SoftwareDevelopmentStatus = "REQUESTED" | "IN_PROGRESS" | "QUOTE_SENT" | "APPROVED" | "ON_HOLD" | "COMPLETED";

export type SoftwareDevelopmentRequestPayload = {
  softwareName: string;
  softwareDescription: string;
  requiresCloudMaintenance: boolean;
  requiresQualityAssuranceRegression: boolean;
};

export type SoftwareDevelopmentRequest = SoftwareDevelopmentRequestPayload & {
  id: string | number;
  businessId?: number | null;
  businessName?: string | null;
  ownerId?: number | null;
  ownerName?: string | null;
  ownerEmail?: string | null;
  stage: SoftwareDevelopmentStage;
  status: SoftwareDevelopmentStatus;
  adminNote?: string | null;
  requestedAt?: string;
  updatedAt?: string;
  startedAt?: string | null;
  quoteSentAt?: string | null;
};

export type SoftwareDevelopmentStageUpdatePayload = {
  stage: SoftwareDevelopmentStage;
  status?: SoftwareDevelopmentStatus;
  adminNote?: string;
};

export const SOFTWARE_DEVELOPMENT_STAGE_FLOW: SoftwareDevelopmentStage[] = [
  "REQUESTED",
  "DISCOVERY",
  "QUOTE_SENT",
  "APPROVED",
  "DESIGN",
  "DEVELOPMENT",
  "CI_CD",
  "QA_REGRESSION",
  "CLOUD_MAINTENANCE",
  "UAT",
  "LIVE_SUPPORT",
];

export const SOFTWARE_DEVELOPMENT_STAGE_LABELS: Record<SoftwareDevelopmentStage, string> = {
  REQUESTED: "Requested",
  DISCOVERY: "Discovery",
  QUOTE_SENT: "Quote sent",
  APPROVED: "Approved",
  DESIGN: "Design",
  DEVELOPMENT: "Development",
  CI_CD: "CI/CD",
  QA_REGRESSION: "QA regression",
  CLOUD_MAINTENANCE: "Cloud maintenance",
  UAT: "UAT",
  LIVE_SUPPORT: "Lifetime support",
};

export const SOFTWARE_DEVELOPMENT_STATUS_LABELS: Record<SoftwareDevelopmentStatus, string> = {
  REQUESTED: "Requested",
  IN_PROGRESS: "In progress",
  QUOTE_SENT: "Quote sent",
  APPROVED: "Approved",
  ON_HOLD: "On hold",
  COMPLETED: "Completed",
};

export const DEVELOPER_HUB_BACKEND_ENDPOINTS = {
  ownerList: "/api/v1/developer-hub/software-requests",
  ownerCreate: "/api/v1/developer-hub/software-requests",
  adminList: "/api/v1/admin/developer-hub/software-requests",
  adminStage: (requestId: string | number) => `/api/v1/admin/developer-hub/software-requests/${requestId}/stage`,
} as const;

export const DEVELOPER_HUB_BACKEND_CONTRACT = [
  "OWNER: POST /api/v1/developer-hub/software-requests with softwareName, softwareDescription, requiresCloudMaintenance, requiresQualityAssuranceRegression.",
  "OWNER: GET /api/v1/developer-hub/software-requests returns the authenticated business owner's software development requests.",
  "ADMIN: GET /api/v1/admin/developer-hub/software-requests returns all requested software development work across businesses.",
  "ADMIN: PATCH /api/v1/admin/developer-hub/software-requests/{requestId}/stage with stage, status, adminNote to start or advance delivery.",
  "BACKEND: derive ownerId and businessId from the JWT/session, not from the request body.",
  "BACKEND: only ADMIN can view all requests and change stages; BUSINESS_OWNER can only create and read their own requests.",
] as const;

export const developerHubPreviewRequests: SoftwareDevelopmentRequest[] = [
  {
    id: "KSDH-1001",
    businessName: "King Sparkon Demo Owner",
    ownerName: "Business Owner",
    ownerEmail: "owner@sparkonstore.co.za",
    softwareName: "Event ticket capacity dashboard",
    softwareDescription: "A dashboard that sells QR tickets, shows sold capacity, scans entry, and reports revenue by event class.",
    requiresCloudMaintenance: true,
    requiresQualityAssuranceRegression: true,
    stage: "DISCOVERY",
    status: "IN_PROGRESS",
    requestedAt: "2026-07-03T07:00:00Z",
    updatedAt: "2026-07-03T07:30:00Z",
    startedAt: "2026-07-03T07:30:00Z",
    adminNote: "Discovery started. Need event rules, roles, and payout flow.",
  },
  {
    id: "KSDH-1002",
    businessName: "Barcode Retail Trial",
    ownerName: "Retail Owner",
    ownerEmail: "retail@sparkonstore.co.za",
    softwareName: "Barcode inventory and worker checkout",
    softwareDescription: "Workers scan product barcodes, customers checkout from cart, and owners see stock movement by branch.",
    requiresCloudMaintenance: true,
    requiresQualityAssuranceRegression: false,
    stage: "REQUESTED",
    status: "REQUESTED",
    requestedAt: "2026-07-02T16:30:00Z",
    updatedAt: "2026-07-02T16:30:00Z",
  },
];

export function nextSoftwareDevelopmentStage(stage: SoftwareDevelopmentStage) {
  const index = SOFTWARE_DEVELOPMENT_STAGE_FLOW.indexOf(stage);
  return SOFTWARE_DEVELOPMENT_STAGE_FLOW[Math.min(index + 1, SOFTWARE_DEVELOPMENT_STAGE_FLOW.length - 1)];
}

export function statusForStage(stage: SoftwareDevelopmentStage): SoftwareDevelopmentStatus {
  if (stage === "REQUESTED") return "REQUESTED";
  if (stage === "QUOTE_SENT") return "QUOTE_SENT";
  if (stage === "APPROVED") return "APPROVED";
  if (stage === "LIVE_SUPPORT") return "COMPLETED";
  return "IN_PROGRESS";
}
