// Mobile backend contracts — mirrors web `src/lib/types/backend.ts`.
// Backend remains source of truth. Keep field names identical.

export type UserRole = "Owner" | "Worker" | "Affiliate" | "Admin" | "User" | "Artist";
export type PaymentType = "CASH" | "SWIPE_MACHINE" | "WEBSITE_PAYMENT";
export type TransactionType = "BUY" | "SELL";

export type PageResponse<T> = {
  content: T[];
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
  first?: boolean;
  last?: boolean;
};

export type TrackerUser = {
  id: number;
  username: string;
  emailAddress: string;
  privilege?: UserRole | string;
  roles?: UserRole[] | string[];
  businessId?: number | null;
  businessName?: string | null;
  emailVerified?: boolean;
};

export type Product = {
  id: number;
  businessId?: number | null;
  businessName?: string | null;
  name: string;
  productBarcode?: string | null;
  category: string;
  status?: string;
  price: number;
  salePrice?: number;
  stockQuantity: number;
  productImageUrl?: string | null;
};

export type TransactionItemPayload = {
  productId: number;
  quantity: number;
  barcodes?: string[];
};

export type TransactionPayload = {
  type: TransactionType;
  paymentType?: PaymentType;
  paymentEmail?: string;
  paymentContact?: string;
  items: TransactionItemPayload[];
};

export type TuckShopPurchaseItem = {
  productId: number;
  productName: string;
  productImageUrl?: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type TuckShopPurchase = {
  transactionId: number;
  businessName?: string | null;
  productTotal: number;
  paymentStatus?: string | null;
  paymentReference?: string | null;
  paymentUrl?: string | null;
  fulfilmentStatus?: string | null;
  collectionQrCodeValue?: string | null;
  items: TuckShopPurchaseItem[];
};

export type TipPayload = {
  workerId: number;
  tipAmount: number;
  callbackUrl: string;
  clientContact?: string;
};

export type Tip = TipPayload & {
  id: number;
  status?: string;
  paymentReference?: string | null;
  paymentUrl?: string | null;
};

export type TicketTypeEntry = {
  type: string;
  price: number;
  capacity: number;
  sold: number;
  available: number;
};

export type TicketEvent = {
  id: string;
  name: string;
  venue?: string | null;
  eventDate: string;
  eventTime: string;
  status: string;
  ticketTypes: TicketTypeEntry[];
};

export type UserTicket = {
  id: string;
  eventId: string;
  eventName?: string | null;
  ticketType: string;
  pricePaid: number;
  purchasedAt: string;
  usedAt?: string;
};

export type FavoriteBusiness = { key: string; businessName: string; businessId?: number | null };

// ─── UIF (mirrors web `src/lib/api/uif.ts`) ────────────────────────────────

export type UifBenefitRow = {
  idNumber?: string;
  id_number?: string;
  benefitType?: string;
  benefit_type?: string;
  type?: string;
  applicationNumber?: string;
  application_number?: string;
  applicationNo?: string;
  application_date?: string;
  applicationDate?: string;
  date?: string;
  claimStatus?: string;
  claim_status?: string;
  claim_status_display?: string;
  status?: string;
  [key: string]: unknown;
};

export type UifBenefitsResponse =
  | {
      benefits?: UifBenefitRow[];
      rows?: UifBenefitRow[];
      data?: UifBenefitRow[];
      history?: UifBenefitRow[];
      applicationHistory?: UifBenefitRow[];
      content?: UifBenefitRow[];
      records?: UifBenefitRow[];
    }
  | UifBenefitRow[];

export function normalizeUifRows(response: UifBenefitsResponse | null | undefined): UifBenefitRow[] {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  const anyResp = response as Record<string, unknown>;
  for (const key of ["records", "benefits", "rows", "data", "history", "applicationHistory", "content", "benefitHistory", "applicationForBenefitHistory"]) {
    if (Array.isArray(anyResp[key])) return anyResp[key] as UifBenefitRow[];
  }
  if (typeof response === "object" && ("benefitType" in response || "benefit_type" in response)) {
    return [response as UifBenefitRow];
  }
  return [];
}

export function uifRowSummary(row: UifBenefitRow) {
  const idNumber = String(row.idNumber ?? row.id_number ?? "");
  const benefitType = String(row.benefitType ?? row.benefit_type ?? row.type ?? "");
  const applicationNumber = String(row.applicationNumber ?? row.application_number ?? row.applicationNo ?? "");
  const applicationDate = String(row.applicationDate ?? row.application_date ?? row.date ?? "");
  const claimStatus = String(row.claimStatus ?? row.claim_status ?? row.claim_status_display ?? row.status ?? "");
  return { idNumber, benefitType, applicationNumber, applicationDate, claimStatus };
}

export type UifResetCartResponse = {
  orderId: number;
  merchantPaymentId: string;
  amount: number | string;
  currency: string;
  status: string;
  message?: string;
};

// ─── Worker ticket gate (mirrors `src/services/ticketVerificationService.ts`) ─

export type FaceVerificationDecision = "PENDING" | "MATCH" | "MISMATCH";

export type TicketVerificationResult = {
  valid: boolean;
  message: string;
  ticket?: unknown;
  event?: unknown;
  requiresFaceConfirmation?: boolean;
  verificationPhotoUrl?: string | null;
};
export function getUserRoles(user: TrackerUser | null): string[] {
  if (!user) return [];
  const roles = [...(user.roles ?? [])];
  if (user.privilege && !roles.includes(user.privilege)) roles.push(user.privilege);
  return roles;
}

export function isWorkerLike(user: TrackerUser | null): boolean {
  return getUserRoles(user).some((r) => ["Worker", "Owner", "Admin"].includes(r));
}

export function normalizeList<T>(value: PageResponse<T> | T[] | null | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : (value.content ?? []);
}
