import { apiClient } from "@/lib/api/client";
import type { TicketVerificationResult } from "@/types/tickets";
import { verifyTicketByQr as verifyMockTicketByQr, verifyTicketByReference as verifyMockTicketByReference } from "@/services/ticketService";

const DEFAULT_WORKER_ID = "worker-demo-001";

type VerifyTicketPayload = {
  value: string;
  workerId: string;
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
  };
}

async function postVerification(path: string, value: string, workerId = DEFAULT_WORKER_ID) {
  const payload: VerifyTicketPayload = { value: value.trim(), workerId };
  const { data } = await apiClient.post<TicketVerificationResult>(path, payload);
  return normalizeVerificationResult(data, "Ticket verification returned an unreadable response.");
}

export async function verifyWorkerTicketByQr(qrValue: string, workerId = DEFAULT_WORKER_ID): Promise<TicketVerificationResult> {
  const value = qrValue.trim();
  if (!value) return { valid: false, message: "Scan a ticket QR code first." };

  try {
    return await postVerification("/v1/tickets/verify/qr", value, workerId);
  } catch {
    return verifyMockTicketByQr(value);
  }
}

export async function verifyWorkerTicketByReference(reference: string, workerId = DEFAULT_WORKER_ID): Promise<TicketVerificationResult> {
  const value = reference.trim();
  if (!value) return { valid: false, message: "Enter a ticket reference first." };

  try {
    return await postVerification("/v1/tickets/verify/reference", value, workerId);
  } catch {
    return verifyMockTicketByReference(value);
  }
}
