import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
  type RawAxiosRequestHeaders,
} from "axios";
import { backendError, type NormalizedBackendError } from "@/lib/utils/errors";
import { retryAfterSecondsFromHeader } from "@/lib/utils/rate-limit";

type RetriableConfig = InternalAxiosRequestConfig & { _refreshAttempted?: boolean };

export const apiClient = axios.create({
  baseURL: "/api/backend",
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

function isNormalizedBackendError(error: unknown): error is NormalizedBackendError {
  return error instanceof Error && ("status" in error || "code" in error || "retryAfterSeconds" in error || "policy" in error);
}

export function normalizeApiError(error: unknown): NormalizedBackendError {
  if (isNormalizedBackendError(error)) {
    return error;
  }

  if (!axios.isAxiosError(error)) {
    return backendError({ message: error instanceof Error ? error.message : "Unexpected frontend error" });
  }

  const axiosError = error as AxiosError;
  const response = axiosError.response;
  const normalized = backendError(response?.data, response?.status);
  const retryAfter = retryAfterSecondsFromHeader(response?.headers?.["retry-after"] as string | undefined);

  if (!normalized.retryAfterSeconds && retryAfter) {
    normalized.retryAfterSeconds = retryAfter;
  }

  return normalized;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const normalized = normalizeApiError(error);
    const config = error.config as RetriableConfig | undefined;

    if (normalized.status === 401 && typeof window !== "undefined" && config && !config._refreshAttempted) {
      config._refreshAttempted = true;

      try {
        await axios.post("/api/auth/refresh", {}, { withCredentials: true });
        return apiClient(config);
      } catch {
        await axios.post("/api/auth/logout", {}, { withCredentials: true }).catch(() => undefined);
        window.location.assign(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      }
    }

    return Promise.reject(normalized);
  },
);

function withIdempotencyKey(config: AxiosRequestConfig | undefined, idempotencyKey: string): AxiosRequestConfig {
  const normalizedKey = idempotencyKey.trim();
  if (normalizedKey.length < 8 || normalizedKey.length > 255) {
    throw new Error("Idempotency key must contain between 8 and 255 characters");
  }

  const headers: RawAxiosRequestHeaders = {
    ...(config?.headers as RawAxiosRequestHeaders | undefined),
    "Idempotency-Key": normalizedKey,
  };
  return { ...config, headers };
}

export async function apiGet<T>(path: string, config?: AxiosRequestConfig) {
  const response = await apiClient.get<T>(path, config);
  return response.data;
}

export async function apiPost<TResponse, TPayload = unknown>(
  path: string,
  payload?: TPayload,
  config?: AxiosRequestConfig,
) {
  const response = await apiClient.post<TResponse>(path, payload, config);
  return response.data;
}

export function apiPostIdempotent<TResponse, TPayload = unknown>(
  path: string,
  payload: TPayload,
  idempotencyKey: string,
  config?: AxiosRequestConfig,
) {
  return apiPost<TResponse, TPayload>(path, payload, withIdempotencyKey(config, idempotencyKey));
}

export async function apiPut<TResponse, TPayload = unknown>(
  path: string,
  payload?: TPayload,
  config?: AxiosRequestConfig,
) {
  const response = await apiClient.put<TResponse>(path, payload, config);
  return response.data;
}

export async function apiPatch<TResponse, TPayload = unknown>(
  path: string,
  payload?: TPayload,
  config?: AxiosRequestConfig,
) {
  const response = await apiClient.patch<TResponse>(path, payload, config);
  return response.data;
}

export async function apiDelete<TResponse>(path: string, config?: AxiosRequestConfig) {
  const response = await apiClient.delete<TResponse>(path, config);
  return response.data;
}
