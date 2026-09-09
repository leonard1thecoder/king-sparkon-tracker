import { NextResponse } from "next/server";
import { backendBaseUrl } from "@/lib/backend-auth";

/**
 * Public PayFast form fields for a payable payment. No authentication: only
 * exposes what PayFast itself requires in the browser form (never secrets).
 */
export async function GET(request: Request, { params }: { params: Promise<{ merchantPaymentId: string }> }) {
  const { merchantPaymentId } = await params;
  const baseUrl = backendBaseUrl();

  try {
    const backendResponse = await fetch(
      `${baseUrl}/api/payments/payfast/form/${encodeURIComponent(merchantPaymentId)}`,
      { method: "GET", cache: "no-store" },
    );
    const text = await backendResponse.text();
    let body: unknown = {};
    try {
      body = text ? JSON.parse(text) : {};
    } catch {
      body = { message: text };
    }
    return NextResponse.json(body, { status: backendResponse.status });
  } catch {
    return NextResponse.json(
      { message: `Backend API is unavailable at ${baseUrl}. Start the Spring Boot backend or set BACKEND_URL.` },
      { status: 502 },
    );
  }
}
