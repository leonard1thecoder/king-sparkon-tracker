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
