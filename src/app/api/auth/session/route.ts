import { cookies } from "next/headers";
import { ACCESS_COOKIE_NAME, decodeJwtPayload } from "@/lib/auth/session";

type ExtendedClaims = ReturnType<typeof decodeJwtPayload> & {
  name?: string;
  username?: string;
  email?: string;
};

function displayNameFromClaims(claims: ExtendedClaims) {
  const explicitName = claims?.name || claims?.username || claims?.sub;
  if (explicitName && !explicitName.includes("@")) return explicitName;

  const email = claims?.emailAddress || claims?.email || claims?.sub || "";
  const localPart = email.includes("@") ? email.split("@")[0] : email;
  return localPart.replace(/[._-]+/g, " ").trim() || "Registered user";
}

export async function GET() {
  const cookieStore = await cookies();
  const claims = decodeJwtPayload(cookieStore.get(ACCESS_COOKIE_NAME)?.value) as ExtendedClaims;

  if (!claims) {
    return Response.json({ authenticated: false }, { status: 401 });
  }

  const emailAddress = claims.emailAddress || claims.email || (claims.sub?.includes("@") ? claims.sub : undefined);

  return Response.json({
    authenticated: true,
    userId: claims.userId,
    name: displayNameFromClaims(claims),
    emailAddress: emailAddress ?? "registered-user@king-sparkon.local",
    roles: claims.roles,
    role: claims.role,
    privilege: claims.privilege,
    businessId: claims.businessId,
    businessName: claims.businessName,
  });
}
