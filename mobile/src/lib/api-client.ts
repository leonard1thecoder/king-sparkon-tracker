import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import Constants from "expo-constants";
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from "./auth-storage";

export function backendBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_BACKEND_URL?.trim();
  const fromConfig =
    typeof Constants.expoConfig?.extra?.backendUrl === "string"
      ? (Constants.expoConfig.extra.backendUrl as string)
      : undefined;
  return (fromEnv ?? fromConfig ?? "http://localhost:8080").replace(/\/$/, "");
}

// Direct-to-backend client. Web uses cookie proxy `/api/backend`;
// mobile attaches Bearer tokens from SecureStore instead.
export const backendClient = axios.create({
  baseURL: `${backendBaseUrl()}/api`,
  headers: { Accept: "application/json" },
  timeout: 20000,
});

type RetriableConfig = InternalAxiosRequestConfig & { _refreshAttempted?: boolean };

backendClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

backendClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    const status = error.response?.status;

    if (status === 401 && config && !config._refreshAttempted) {
      config._refreshAttempted = true;
      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) throw new Error("No refresh token");
        const response = await axios.post(`${backendBaseUrl()}/api/auth/refresh`, { refreshToken });
        const data = (response.data ?? {}) as { accessToken?: string; refreshToken?: string };
        await saveTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
        if (data.accessToken) {
          config.headers.set("Authorization", `Bearer ${data.accessToken}`);
        }
        return backendClient(config);
      } catch {
        await clearTokens();
      }
    }

    return Promise.reject(normalizeError(error));
  },
);

export type BackendError = Error & {
  status?: number;
  code?: string;
  retryAfterSeconds?: number;
};

export function normalizeError(error: unknown): BackendError {
  if (!axios.isAxiosError(error)) {
    return Object.assign(error instanceof Error ? error : new Error("Unexpected mobile error"), {});
  }
  const data = (error.response?.data ?? {}) as {
    message?: string;
    error?: string;
    detail?: string;
    title?: string;
    code?: string;
  };
  const message =
    data.message ?? data.error ?? data.detail ?? data.title ?? error.message ?? "The backend rejected this request.";
  const normalized = new Error(message) as BackendError;
  normalized.status = error.response?.status;
  if (typeof data.code === "string") normalized.code = data.code;
  const retryAfter = error.response?.headers?.["retry-after"];
  if (typeof retryAfter === "string") {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds)) normalized.retryAfterSeconds = seconds;
  }
  return normalized;
}

export function idempotencyKey(scope: string): string {
  const normalized = scope.trim().replace(/[^a-zA-Z0-9_-]+/g, "-") || "operation";
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${normalized}:${random}`;
}

export async function apiGet<T>(path: string, params?: Record<string, string | number | undefined | null>) {
  const response = await backendClient.get<T>(path, { params });
  return response.data;
}

export async function apiPost<TResponse, TPayload = unknown>(path: string, payload?: TPayload) {
  const response = await backendClient.post<TResponse>(path, payload);
  return response.data;
}

export async function apiPostIdempotent<TResponse, TPayload = unknown>(
  path: string,
  payload: TPayload,
  key = idempotencyKey("mobile"),
) {
  const response = await backendClient.post<TResponse>(path, payload, {
    headers: { "Idempotency-Key": key },
  });
  return response.data;
}

export async function apiPatch<TResponse, TPayload = unknown>(path: string, payload?: TPayload) {
  const response = await backendClient.patch<TResponse>(path, payload);
  return response.data;
}

export async function apiDelete<TResponse>(path: string) {
  const response = await backendClient.delete<TResponse>(path);
  return response.data;
}
