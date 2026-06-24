import { backendBaseUrl, responseBodyFromText } from "@/lib/backend-auth";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const baseUrl = backendBaseUrl();

  try {
    const backendResponse = await fetch(`${baseUrl}/api/subscribers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: await request.text(),
      cache: "no-store",
    });

    return Response.json(responseBodyFromText(await backendResponse.text()), { status: backendResponse.status });
  } catch {
    return Response.json({ message: `Backend API is unavailable at ${baseUrl}.` }, { status: 502 });
  }
}

export async function DELETE(request: NextRequest) {
  const baseUrl = backendBaseUrl();
  const url = new URL(request.url);
  const contact = url.searchParams.get("contact") ?? "";

  try {
    const backendResponse = await fetch(`${baseUrl}/api/subscribers?contact=${encodeURIComponent(contact)}`, {
      method: "DELETE",
      cache: "no-store",
    });

    return Response.json(responseBodyFromText(await backendResponse.text()), { status: backendResponse.status });
  } catch {
    return Response.json({ message: `Backend API is unavailable at ${baseUrl}.` }, { status: 502 });
  }
}
