import { NextResponse } from "next/server";

const DEFAULT_BACKEND_URL = "http://localhost:8080";

export const AUTH_COOKIE_NAME = "king_sparkon_tracker_access_token";

type BackendPayload = Record<string, unknown>;
type AuthEndpoint =
  | "/api/auth/login"
  | "/api/auth/register"
  | "/api/auth/forgot-password"
  | "/api/auth/reset-password"
  | "/api/auth/resend-verification";

export function backendBaseUrl() {
  return (
    process.env.BACKEND_URL ??
    process.env.KING_SPARKON_API_BASE_URL ??
    process.env.NEXT_PUBLIC_KING_SPARKON_API_BASE_URL ??
    DEFAULT_BACKEND_URL
  ).replace(/\/$/, "");
}

async function readJsonBody(request: Request) {
  try {
    const body = await request.json();
    if (body && typeof body === "object" && !Array.isArray(body)) {
      return body as BackendPayload;
    }
  } catch {
    return null;
  }

  return null;
}

function responseBodyFromText(text: string) {
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function cookieExpiresAt(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const timestamp = Date.parse(value);

  return Number.isFinite(timestamp) ? new Date(timestamp) : undefined;
}

function withoutAccessToken(body: Record<string, unknown>) {
  const safeBody = { ...body };
  delete safeBody.accessToken;
  return safeBody;
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  });
}

export async function postToBackendAuth(
  request: Request,
  endpoint: AuthEndpoint,
  options: { createSession?: boolean } = {},
) {
  const payload = await readJsonBody(request);

  if (!payload) {
    return Response.json({ message: "Invalid JSON payload" }, { status: 400 });
  }

  const baseUrl = backendBaseUrl();

  try {
    const backendResponse = await fetch(`${baseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    const text = await backendResponse.text();
    const body = responseBodyFromText(text);

    const response = NextResponse.json(
      options.createSession && typeof body.accessToken === "string" ? withoutAccessToken(body) : body,
      {
        status: backendResponse.status,
      },
    );

    if (backendResponse.ok && options.createSession && typeof body.accessToken === "string") {
      response.cookies.set({
        name: AUTH_COOKIE_NAME,
        value: body.accessToken,
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        expires: cookieExpiresAt(body.expiresAt),
      });
    }

    return response;
  } catch {
    return Response.json(
      {
        message: `Backend API is unavailable at ${baseUrl}. Start the Spring Boot backend or set BACKEND_URL.`,
      },
      { status: 502 },
    );
  }
}

export async function getFromBackendAuth(request: Request, endpoint: "/api/auth/verify-email") {
  const baseUrl = backendBaseUrl();
  const incomingUrl = new URL(request.url);
  const backendUrl = new URL(endpoint, baseUrl);
  backendUrl.search = incomingUrl.search;

  try {
    const backendResponse = await fetch(backendUrl, {
      method: "GET",
      cache: "no-store",
    });
    const text = await backendResponse.text();

    return Response.json(responseBodyFromText(text), {
      status: backendResponse.status,
    });
  } catch {
    return Response.json(
      {
        message: `Backend API is unavailable at ${baseUrl}. Start the Spring Boot backend or set BACKEND_URL.`,
      },
      { status: 502 },
    );
  }
}
