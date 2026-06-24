export class BackendApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details: unknown) {
    super(message);
    this.name = "BackendApiError";
    this.status = status;
    this.details = details;
  }
}

type ErrorBody = {
  message?: string;
  error?: string;
  detail?: string;
  title?: string;
};

export async function backendRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);

  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`/api/backend/${path}`, {
    ...init,
    headers,
    credentials: "same-origin",
  });
  const contentType = response.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json")
    ? await response.json().catch(() => ({}))
    : await response.text().catch(() => "");

  if (!response.ok) {
    const errorBody = body as ErrorBody;
    throw new BackendApiError(
      errorBody.message ?? errorBody.error ?? errorBody.detail ?? errorBody.title ?? "The backend rejected this request.",
      response.status,
      body,
    );
  }

  return body as T;
}
