import { postToBackendAuth } from "@/lib/backend-auth";
import { REFRESH_COOKIE_NAME } from "@/lib/auth/session";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;

  if (!refreshToken) {
    return Response.json({ message: "No refresh session available." }, { status: 401 });
  }

  return postToBackendAuth(request, "/api/auth/refresh", { createSession: true, payload: { refreshToken } });
}
