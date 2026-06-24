export type NormalizedBackendError = Error & {
  status?: number;
  code?: string;
  retryAfterSeconds?: number;
  policy?: string;
  details?: unknown;
};

export function messageFromBackendPayload(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return "The backend rejected this request.";
  }

  const body = payload as Record<string, unknown>;
  const candidates = [body.message, body.error, body.detail, body.title];
  const message = candidates.find((value) => typeof value === "string" && value.trim().length > 0);

  return typeof message === "string" ? message : "The backend rejected this request.";
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
