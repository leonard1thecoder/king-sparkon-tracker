import { AUTH_COOKIE_NAME, backendBaseUrl } from "@/lib/backend-auth";
import type { NextRequest } from "next/server";

const ALLOWED_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

function backendHeaders(request: NextRequest) {
  const headers = new Headers();
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }

  const accept = request.headers.get("accept");

  if (accept) {
    headers.set("accept", accept);
  }

  if (!["GET", "HEAD"].includes(request.method)) {
    headers.set("content-type", request.headers.get("content-type") ?? "application/json");
  }

  return headers;
}

async function proxy(request: NextRequest, path: string[]) {
  if (!ALLOWED_METHODS.includes(request.method as (typeof ALLOWED_METHODS)[number])) {
    return Response.json({ message: "Method not allowed" }, { status: 405 });
  }

  if (!request.cookies.get(AUTH_COOKIE_NAME)?.value) {
    return Response.json({ message: "Sign in before calling protected backend resources." }, { status: 401 });
  }

  const incomingUrl = new URL(request.url);
  const backendPath = path.map((segment) => encodeURIComponent(segment)).join("/");
  const backendUrl = new URL(`/api/${backendPath}${incomingUrl.search}`, backendBaseUrl());
  const hasBody = !["GET", "HEAD"].includes(request.method);

  try {
    const backendResponse = await fetch(backendUrl, {
      method: request.method,
      headers: backendHeaders(request),
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: "no-store",
    });
    const text = await backendResponse.text();

    return new Response(text, {
      status: backendResponse.status,
      headers: {
        "content-type": backendResponse.headers.get("content-type") ?? "application/json",
        ...(backendResponse.headers.get("retry-after")
          ? { "retry-after": backendResponse.headers.get("retry-after") as string }
          : {}),
      },
    });
  } catch {
    return Response.json(
      {
        message: `Backend API is unavailable at ${backendBaseUrl()}. Start the Spring Boot backend or set BACKEND_URL.`,
      },
      { status: 502 },
    );
  }
}

type BackendRouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(request: NextRequest, context: BackendRouteContext) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function POST(request: NextRequest, context: BackendRouteContext) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function PUT(request: NextRequest, context: BackendRouteContext) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function PATCH(request: NextRequest, context: BackendRouteContext) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function DELETE(request: NextRequest, context: BackendRouteContext) {
  const { path } = await context.params;
  return proxy(request, path);
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      allow: ALLOWED_METHODS.join(", "),
    },
  });
}
