import { apiClient, normalizeApiError } from "@/lib/api/client";
import type { FaceVerificationDecision, TicketVerificationResult } from "@/types/tickets";

const DEFAULT_WORKER_ID = "worker-demo-001";

type VerifyTicketPayload = {
  value: string;
  workerId: string;
  faceDecision: FaceVerificationDecision;
};

function normalizeVerificationResult(data: TicketVerificationResult | null | undefined, fallbackMessage: string): TicketVerificationResult {
  if (!data || typeof data.valid !== "boolean") {
    return { valid: false, message: fallbackMessage };
  }

  return {
    valid: data.valid,
    message: data.message || fallbackMessage,
    ticket: data.ticket,
    event: data.event,
    requiresFaceConfirmation: Boolean(data.requiresFaceConfirmation),
    verificationPhotoUrl: data.verificationPhotoUrl ?? data.ticket?.verificationPhotoUrl,
  };
}

async function postVerification(
  path: string,
  value: string,
  faceDecision: FaceVerificationDecision,
  workerId = DEFAULT_WORKER_ID,
) {
  const payload: VerifyTicketPayload = { value: value.trim(), workerId, faceDecision };
  const { data } = await apiClient.post<TicketVerificationResult>(path, payload);
  return normalizeVerificationResult(data, "Ticket verification returned an unreadable response.");
}

async function verify(
  path: string,
  value: string,
  emptyMessage: string,
  faceDecision: FaceVerificationDecision,
  workerId: string,
): Promise<TicketVerificationResult> {
  const normalizedValue = value.trim();
  if (!normalizedValue) return { valid: false, message: emptyMessage };

  try {
    return await postVerification(path, normalizedValue, faceDecision, workerId);
  } catch (exception) {
    const error = normalizeApiError(exception);
    return {
      valid: false,
      message: error.message || "The secure ticket verification service is unavailable. Do not admit the guest.",
    };
  }
}

export async function verifyWorkerTicketByQr(
  qrValue: string,
  faceDecision: FaceVerificationDecision = "PENDING",
  workerId = DEFAULT_WORKER_ID,
): Promise<TicketVerificationResult> {
  return verify("/v1/tickets/verify/qr", qrValue, "Scan a ticket QR code first.", faceDecision, workerId);
}

export async function verifyWorkerTicketByReference(
  reference: string,
  faceDecision: FaceVerificationDecision = "PENDING",
  workerId = DEFAULT_WORKER_ID,
): Promise<TicketVerificationResult> {
  return verify("/v1/tickets/verify/reference", reference, "Enter a ticket reference first.", faceDecision, workerId);
}
