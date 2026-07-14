import { NextResponse, type NextRequest } from "next/server";
import { hasRole } from "@/lib/auth/guards";
import { ACCESS_COOKIE_NAME, dashboardPathForSession, decodeJwtPayload, isExpired } from "@/lib/auth/session";

const authRoutes = new Set(["/login", "/register", "/forgot-password", "/reset-password", "/verify-email", "/resend-verification"]);
const roleRoutes = [
  ["/dashboard/admin", "Admin"],
  ["/dashboard/owner", "Owner"],
  ["/dashboard/worker", "Worker"],
  ["/dashboard/affiliate", "Affiliate"],
  ["/dashboard/user", "User"],
] as const;

function matchesRoute(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  const claims = decodeJwtPayload(token);
  const authenticated = Boolean(claims && !isExpired(claims));

  if (pathname.startsWith("/dashboard") && !authenticated) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (authenticated && authRoutes.has(pathname)) {
    return NextResponse.redirect(new URL(dashboardPathForSession(claims), request.url));
  }

  if (authenticated && pathname === "/dashboard") {
    return NextResponse.redirect(new URL(dashboardPathForSession(claims), request.url));
  }

  const matchedRoleRoute = roleRoutes.find(([prefix]) => matchesRoute(pathname, prefix));
  if (matchedRoleRoute && authenticated && !hasRole(claims, matchedRoleRoute[1])) {
    return NextResponse.redirect(new URL(dashboardPathForSession(claims), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/forgot-password", "/reset-password", "/verify-email", "/resend-verification"],
};
