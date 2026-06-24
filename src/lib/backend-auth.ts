import { NextResponse } from "next/server";
import { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME } from "@/lib/auth/session";

const DEFAULT_BACKEND_URL = "http://localhost:8080";

export const AUTH_COOKIE_NAME = ACCESS_COOKIE_NAME;

type BackendPayload = Record<string, unknown>;
type AuthEndpoint =
  | "/api/auth/login"
  | "/api/auth/register"
  | "/api/auth/register-admin"
  | "/api/auth/register-affiliate"
  | "/api/auth/refresh"
  | "/api/auth/logout"
  | "/api/auth/forgot-password"
  | "/api/auth/reset-password"
  | "/api/auth/resend-verification";

export function backendBaseUrl() {
  return (process.env.BACKEND_URL ?? process.env.KING_SPARKON_API_BASE_URL ?? DEFAULT_BACKEND_URL).replace(/\/$/, "");
}

async function readJsonBody(request: Request) {
  try {
    const body = await request.json();
    if (body && typeof body === "object" && !Array.isArray(body)) {
      return body as BackendPayload;
    }
  } catch {
    return {};
  }

  return {};
}

export function responseBodyFromText(text: string) {
  if (!text) return {};
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { message: text };
  }
}

function cookieExpiresAt(value: unknown) {
  if (typeof value !== "string") return undefined;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp) : undefined;
}

function withoutTokens(body: Record<string, unknown>) {
  const safeBody = { ...body };
  delete safeBody.accessToken;
  delete safeBody.refreshToken;
  return safeBody;
}

function setTokenCookies(response: NextResponse, body: Record<string, unknown>) {
  if (typeof body.accessToken === "string") {
    response.cookies.set({
      name: ACCESS_COOKIE_NAME,
      value: body.accessToken,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: cookieExpiresAt(body.accessTokenExpiresAt ?? body.expiresAt),
    });
  }

  if (typeof body.refreshToken === "string") {
    response.cookies.set({
      name: REFRESH_COOKIE_NAME,
      value: body.refreshToken,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: cookieExpiresAt(body.refreshTokenExpiresAt),
    });
  }
}

export function clearAuthCookie(response: NextResponse) {
  for (const name of [ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME]) {
    response.cookies.set({ name, value: "", path: "/", httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 0 });
  }
}

export async function postToBackendAuth(request: Request, endpoint: AuthEndpoint, options: { createSession?: boolean; payload?: BackendPayload } = {}) {
  const payload = options.payload ?? (await readJsonBody(request));
  const baseUrl = backendBaseUrl();

  try {
    const backendResponse = await fetch(`${baseUrl}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    const body = responseBodyFromText(await backendResponse.text());
    const response = NextResponse.json(options.createSession ? withoutTokens(body) : body, { status: backendResponse.status });

    if (backendResponse.ok && options.createSession) {
      setTokenCookies(response, body);
    }

    return response;
  } catch {
    return Response.json({ message: `Backend API is unavailable at ${baseUrl}. Start the Spring Boot backend or set BACKEND_URL.` }, { status: 502 });
  }
}

export async function getFromBackendAuth(request: Request, endpoint: "/api/auth/verify-email") {
  const baseUrl = backendBaseUrl();
  const incomingUrl = new URL(request.url);
  const backendUrl = new URL(endpoint, baseUrl);
  backendUrl.search = incomingUrl.search;

  try {
    const backendResponse = await fetch(backendUrl, { method: "GET", cache: "no-store" });
    return Response.json(responseBodyFromText(await backendResponse.text()), { status: backendResponse.status });
  } catch {
    return Response.json({ message: `Backend API is unavailable at ${baseUrl}. Start the Spring Boot backend or set BACKEND_URL.` }, { status: 502 });
  }
}
