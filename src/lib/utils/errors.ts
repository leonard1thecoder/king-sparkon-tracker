export type NormalizedBackendError = Error & {
  status?: number;
  code?: string;
  retryAfterSeconds?: number;
  policy?: string;
  details?: unknown;
};

const REJECTED_MESSAGE = "The backend rejected this request.";

// Turns a backend response body into readable text. HTML error pages (for example a 503 page from a proxy)
// are reduced to their visible text, so markup never reaches the screen.
export function plainTextMessage(value: string, fallback = REJECTED_MESSAGE) {
  const text = value
    .replace(/<head[\s\S]*?<\/head>/gi, " ")
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<\/?[a-z][^>]*>/gi, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();

  return text || fallback;
}

export function messageFromBackendPayload(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return REJECTED_MESSAGE;
  }

  const body = payload as Record<string, unknown>;
  const candidates = [body.message, body.error, body.detail, body.title];
  const message = candidates.find((value) => typeof value === "string" && value.trim().length > 0);

  return typeof message === "string" ? plainTextMessage(message) : REJECTED_MESSAGE;
}

export function backendError(payload: unknown, status?: number): NormalizedBackendError {
  const body = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const error = new Error(messageFromBackendPayload(payload)) as NormalizedBackendError;
  error.status = status;
  error.code = typeof body.code === "string" ? body.code : typeof body.error === "string" ? body.error : undefined;
  error.retryAfterSeconds = typeof body.retryAfterSeconds === "number" ? body.retryAfterSeconds : undefined;
  error.policy = typeof body.policy === "string" ? body.policy : undefined;
  error.details = payload;
  return error;
}
