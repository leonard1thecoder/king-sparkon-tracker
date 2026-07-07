import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const backendBaseUrl = (
  process.env.KING_SPARKON_API_BASE_URL ??
  process.env.BACKEND_API_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8080"
).replace(/\/$/, "");

function forwardHeaders(request: NextRequest) {
  const headers: Record<string, string> = { Accept: "application/json" };
  const authorization = request.headers.get("authorization");
  if (authorization) headers.Authorization = authorization;
  return headers;
}

async function proxyJson(request: NextRequest, init?: RequestInit) {
  const upstream = await fetch(`${backendBaseUrl}/api/dev-hub/requests${request.nextUrl.search}`, {
    ...init,
    headers: {
      ...forwardHeaders(request),
      ...(init?.headers as Record<string, string> | undefined),
    },
    cache: "no-store",
  });

  const contentType = upstream.headers.get("content-type") ?? "application/json";
  const body = await upstream.text();
  return new NextResponse(body, {
    status: upstream.status,
    headers: { "content-type": contentType },
  });
}

export async function GET(request: NextRequest) {
  return proxyJson(request);
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  return proxyJson(request, {
    method: "POST",
    headers: { "Content-Type": request.headers.get("content-type") ?? "application/json" },
    body,
  });
}
