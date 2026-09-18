import { apiDelete, apiGet, apiPatch, apiPost, apiPostIdempotent } from "./api-client";
import type {
  FaceVerificationDecision,
  FavoriteBusiness,
  PageResponse,
  Product,
  TicketEvent,
  TicketVerificationResult,
  Tip,
  TipPayload,
  TrackerUser,
  TransactionPayload,
  TuckShopPurchase,
  UifBenefitsResponse,
  UifResetCartResponse,
  UserTicket,
} from "./types";
import { normalizeUifRows } from "./types";

// Auth — direct backend endpoints (web proxies these via /api/auth/*).
export function loginRequest(values: { usernameOrEmail: string; password: string }) {
  return apiPost<{ accessToken?: string; refreshToken?: string; user?: TrackerUser }>(
    "/auth/login",
    values,
  );
}

export function registerOwnerRequest(values: Record<string, string>) {
  return apiPost("/auth/register", values);
}

export function registerUserRequest(values: {
  username: string;
  emailAddress: string;
  cellphoneNumber: string;
  gender: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
  password: string;
  localizationCountry: "SOUTH_AFRICA" | "REST_OF_WORLD";
}) {
  // Same backend contract as web USER registration
  // (serviceRegisteringFor=USER, no address fields).
  return apiPost("/auth/register", {
    ...values,
    serviceRegisteringFor: "USER",
    serviceRegistrationType: "FREE_USER_ACCESS",
  });
}

export function registerAffiliateRequest(values: Record<string, string>) {
  return apiPost("/auth/register-affiliate", values);
}

export function getMe() {
  return apiGet<TrackerUser>("/users/me");
}

export function forgotPasswordRequest(emailAddress: string) {
  return apiPost("/auth/forgot-password", { emailAddress });
}

export function resetPasswordRequest(values: { token: string; newPassword: string; confirmPassword: string }) {
  return apiPost("/auth/reset-password", values);
}

export function resendVerificationRequest(emailAddress: string) {
  return apiPost("/auth/resend-verification", { emailAddress });
}

export function verifyEmailRequest(token: string) {
  return apiGet(`/auth/verify-email?token=${encodeURIComponent(token)}`);
}

// User dashboard — tuck shop.
export function listTuckShopProducts(params: { page?: number; size?: number; search?: string } = {}) {
  return apiGet<PageResponse<Product> | Product[]>("/v1/tuck-shop/products", {
    page: params.page,
    size: params.size,
    search: params.search ?? undefined,
  });
}

export function createTuckShopPurchase(payload: {
  paymentEmail?: string;
  paymentContact?: string;
  items: { productId: number; quantity: number }[];
}) {
  return apiPostIdempotent<TuckShopPurchase, typeof payload>("/v1/tuck-shop/purchases", payload);
}

export function listMyPurchases() {
  return apiGet<TuckShopPurchase[]>("/v1/tuck-shop/my-purchases");
}

// User dashboard — tickets.
export function listTicketEvents() {
  return apiGet<TicketEvent[]>("/v1/tickets/events");
}

export function listMyTickets() {
  return apiGet<UserTicket[]>("/v1/tickets/my-tickets/current");
}

// User dashboard — tips (standalone creation kept for compat;
// the tip cart pays intents through the shared cart payout below).
export function createTip(payload: TipPayload) {
  return apiPostIdempotent<Tip, TipPayload>("/tips", payload);
}

// Shared PayFast cart payout (products + tickets + tips) — same as web
// shop cart, ticket checkout, UIF carts and the tip cart.
export type CartTipItem = { workerId: number; tipAmount: number };

export function createPayFastCartPayment(payload: {
  idempotencyKey: string;
  buyerName: string;
  buyerEmail: string;
  products: { productId: number; quantity: number }[];
  tickets: { eventId: string; ticketType: string; quantity: number }[];
  tips: CartTipItem[];
}) {
  return apiPostIdempotent<{
    paymentId: number;
    merchantPaymentId: string;
    processUrl: string;
    fields: Record<string, string>;
    amount: number;
    currency: string;
    status: string;
  }, typeof payload>("/payments/payfast", payload);
}

export function getPayFastCartPaymentStatus(merchantPaymentId: string) {
  return apiGet<{
    paymentId: number;
    merchantPaymentId: string;
    amount: number;
    currency: string;
    paymentStatus: string;
    fulfilled: boolean;
    message: string;
  }>(`/payments/status/${encodeURIComponent(merchantPaymentId)}`);
}

// Public web pay page for a cart payment — mobile opens this in the
// browser to complete the shared payout (same page web uses).
export function payPageUrl(merchantPaymentId: string): string {
  const base = (process.env.EXPO_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return `${base}/pay/${encodeURIComponent(merchantPaymentId)}`;
}

export function listSentTips(status?: string) {
  return apiGet<Tip[]>("/tips/sent", status ? { status } : undefined);
}

// User dashboard — jobs (mirrors web `src/lib/api/job-opportunities.ts`).
export type MobileJob = {
  id: number;
  title: string;
  businessName?: string | null;
  companyName?: string | null;
  location?: string | null;
  workplaceType?: string | null;
  employmentType?: string | null;
  jobDescription?: string | null;
  description?: string | null;
  requirements?: string | null;
  status?: string | null;
  createdDate?: string | null;
};

export type MobileJobApplication = {
  id: number;
  status?: string | null;
  resumeUrl?: string | null;
  createdDate?: string | null;
  applicantUsername?: string | null;
  jobPost?: MobileJob | null;
};

export function listJobs(params: { keyword?: string; location?: string; page?: number; size?: number } = {}) {
  return apiGet<PageResponse<MobileJob> | MobileJob[]>("/opportunities/jobs", {
    keyword: params.keyword || undefined,
    location: params.location || undefined,
    page: params.page,
    size: params.size,
  });
}

export function getJobById(id: number | string) {
  return apiGet<MobileJob>(`/opportunities/jobs/${id}`);
}

export function applyForJob(
  id: number | string,
  payload: { applicantName: string; applicantEmail: string; phoneNumber?: string; coverMessage?: string; cvUrl?: string },
) {
  return apiPost<MobileJobApplication, Record<string, unknown>>(`/opportunities/jobs/${id}/apply`, {
    applicantName: payload.applicantName,
    applicantEmail: payload.applicantEmail,
    phoneNumber: payload.phoneNumber || undefined,
    coverMessage: payload.coverMessage || undefined,
    resumeUrl: payload.cvUrl || undefined,
    certificateUrls: [],
  });
}

export function listMyJobApplications() {
  return apiGet<PageResponse<MobileJobApplication> | MobileJobApplication[]>("/opportunities/applications");
}

// Worker dashboard — counter checkout + orders + barcodes.
export function workerCheckout(payload: TransactionPayload) {
  return apiPost("/transactions", payload);
}

export function workerBarcodeCheckout(payload: {
  paymentType: "CASH" | "SWIPE_MACHINE";
  items: { productId: number; quantity: number }[];
}) {
  return apiPostIdempotent("/v1/tuck-shop/workers/automatic-purchases", payload);
}

export function listWorkerOnlinePurchases() {
  return apiGet<TuckShopPurchase[]>("/v1/tuck-shop/workers/online-purchases");
}

export function lookupProductByBarcode(barcode: string) {
  return apiGet<Product>(`/products/barcode/${encodeURIComponent(barcode.trim())}`);
}

export function lookupReference(reference: string) {
  return apiGet(`/barcodes/reference/${encodeURIComponent(reference.trim())}`);
}

export function claimBarcode(barcodeId: number) {
  return apiPost(`/barcodes/${barcodeId}/claim`, {});
}

export function assignOnlinePurchaseBarcode(transactionId: number, productId: number, barcode: string) {
  return apiPost(`/v1/tuck-shop/workers/online-purchases/${transactionId}/products/${productId}/barcodes`, {
    barcode: barcode.trim(),
  });
}

export function listTransactions() {
  return apiGet("/transactions");
}

export function markTipPaid(tipId: number) {
  return apiPatch(`/tips/${tipId}/status`, { status: "PAID" });
}

export function listWorkerTips() {
  // Worker-scoped endpoint — GET /tips?status= is owner/admin only.
  return apiGet<Tip[]>("/tips/me");
}

// User dashboard — favorites (mirrors web `src/lib/favorites.ts`).
// Backend: GET /api/v1/favorites, GET /api/v1/favorites/detailed,
// POST /api/v1/favorites/{businessKey}, DELETE /api/v1/favorites/{businessKey}.
export function listFavoriteKeys() {
  return apiGet<string[]>("/v1/favorites");
}

export function listFavoriteDetailed() {
  return apiGet<FavoriteBusiness[]>("/v1/favorites/detailed");
}

export function followFavorite(businessKey: string) {
  return apiPost(`/v1/favorites/${encodeURIComponent(businessKey)}`);
}

export function unfollowFavorite(businessKey: string) {
  return apiDelete(`/v1/favorites/${encodeURIComponent(businessKey)}`);
}

// User dashboard — UIF (mirrors web `src/lib/api/uif.ts`).
export async function fetchUifBenefits(idNumber: string) {
  const payload = { idNumber: idNumber.trim() };
  try {
    const response = await apiPost<UifBenefitsResponse, typeof payload>("/uif/benefits", payload);
    return normalizeUifRows(response);
  } catch (error) {
    const status = (error as { status?: number })?.status;
    if (status === 404) {
      const response = await apiGet<UifBenefitsResponse>(`/uif/benefits?idNumber=${encodeURIComponent(payload.idNumber)}`);
      return normalizeUifRows(response);
    }
    throw error;
  }
}

export function createUifResetCart(payload: { idNumber: string; password: string; confirmPassword: string }) {
  return apiPost<UifResetCartResponse, typeof payload>("/uif/reset-password", payload);
}

export function getUifResetCartStatus(merchantPaymentId: string) {
  return apiGet<UifResetCartResponse>(`/uif/reset-password/status/${encodeURIComponent(merchantPaymentId)}`);
}

// Worker dashboard — product sales + ticket gate.
export function listCompletedWorkerPurchases() {
  return apiGet<TuckShopPurchase[]>("/v1/tuck-shop/workers/completed-purchases");
}

export function listOwnerProducts(params: { page?: number; size?: number } = {}) {
  return apiGet<PageResponse<Product> | Product[]>("/products", {
    page: params.page,
    size: params.size,
  });
}

async function verifyTicket(path: "/v1/tickets/verify/qr" | "/v1/tickets/verify/reference", value: string, workerId: string, faceDecision: FaceVerificationDecision) {
  const data = await apiPost<TicketVerificationResult, { value: string; workerId: string; faceDecision: FaceVerificationDecision }>(
    path,
    { value: value.trim(), workerId, faceDecision },
  );
  if (!data || typeof data.valid !== "boolean") {
    return { valid: false, message: "Ticket verification returned an unreadable response." } satisfies TicketVerificationResult;
  }
  return data;
}

export function verifyTicketByQr(qrValue: string, workerId: string, faceDecision: FaceVerificationDecision = "PENDING") {
  return verifyTicket("/v1/tickets/verify/qr", qrValue, workerId, faceDecision);
}

export function verifyTicketByReference(reference: string, workerId: string, faceDecision: FaceVerificationDecision = "PENDING") {
  return verifyTicket("/v1/tickets/verify/reference", reference, workerId, faceDecision);
}
