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

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string; action: string }> }) {
  const { id, action } = await context.params;
  if (action !== "accept" && action !== "reject") {
    return NextResponse.json({ message: "Unsupported Dev Hub action" }, { status: 404 });
  }

  const body = await request.text();
  const upstream = await fetch(`${backendBaseUrl}/api/dev-hub/requests/${encodeURIComponent(id)}/${action}`, {
    method: "PATCH",
    headers: {
      ...forwardHeaders(request),
      "Content-Type": request.headers.get("content-type") ?? "application/json",
    },
    body,
    cache: "no-store",
  });

  const contentType = upstream.headers.get("content-type") ?? "application/json";
  const responseBody = await upstream.text();
  return new NextResponse(responseBody, {
    status: upstream.status,
    headers: { "content-type": contentType },
  });
}
