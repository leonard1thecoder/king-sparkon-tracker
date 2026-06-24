import { NextResponse, type NextRequest } from "next/server";

const AUTH_COOKIE_NAME = "king_sparkon_tracker_access_token";
const AUTH_ROUTES = new Set(["/login", "/register", "/forgot-password", "/reset-password", "/resend-verification"]);

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value);

  if (pathname.startsWith("/dashboard") && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && AUTH_ROUTES.has(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/forgot-password", "/reset-password", "/resend-verification", "/dashboard/:path*"],
};
