import { backendBaseUrl, clearAuthCookie } from "@/lib/backend-auth";
import { REFRESH_COOKIE_NAME } from "@/lib/auth/session";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;

  if (refreshToken) {
    await fetch(`${backendBaseUrl()}/api/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    }).catch(() => undefined);
  }

  const response = NextResponse.json({ message: "Signed out." });
  clearAuthCookie(response);
  return response;
}
