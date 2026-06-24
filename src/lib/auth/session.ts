import { rolesFromClaims, primaryDashboardForRoles } from "./roles";

export const ACCESS_COOKIE_NAME = "king_sparkon_tracker_access_token";
export const REFRESH_COOKIE_NAME = "king_sparkon_tracker_refresh_token";

export type SessionClaims = {
  userId?: number;
  sub?: string;
  emailAddress?: string;
  businessId?: number;
  businessName?: string;
  roles?: string[];
  role?: string;
  privilege?: string;
  exp?: number;
};

function decodeBase64Url(input: string) {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return atob(padded);
}

export function decodeJwtPayload(token?: string | null): SessionClaims | null {
  if (!token) {
    return null;
  }

  const [, payload] = token.split(".");
  if (!payload) {
    return null;
  }

  try {
    return JSON.parse(decodeBase64Url(payload)) as SessionClaims;
  } catch {
    return null;
  }
}

export function isExpired(claims: SessionClaims | null) {
  if (!claims?.exp) {
    return false;
  }

  return claims.exp * 1000 <= Date.now();
}

export function dashboardPathForSession(claims: SessionClaims | null) {
  return primaryDashboardForRoles(rolesFromClaims(claims));
}
