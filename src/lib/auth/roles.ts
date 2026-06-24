import type { UserRole } from "@/lib/types/backend";

const roleMap: Record<string, UserRole> = {
  owner: "Owner",
  worker: "Worker",
  affiliate: "Affiliate",
  admin: "Admin",
  administrator: "Admin",
};

export function normalizeRole(value: unknown): UserRole | null {
  if (typeof value !== "string") {
    return null;
  }

  return roleMap[value.trim().toLowerCase()] ?? null;
}

export function rolesFromClaims(claims: Record<string, unknown> | null | undefined): UserRole[] {
  if (!claims) {
    return [];
  }

  const rawRoles = Array.isArray(claims.roles) ? claims.roles : [claims.role, claims.privilege].filter(Boolean);
  return rawRoles.map(normalizeRole).filter((role): role is UserRole => Boolean(role));
}

export function primaryDashboardForRoles(roles: UserRole[]) {
  if (roles.includes("Admin")) return "/dashboard/admin";
  if (roles.includes("Owner")) return "/dashboard/owner";
  if (roles.includes("Worker")) return "/dashboard/worker";
  if (roles.includes("Affiliate")) return "/dashboard/affiliate";
  return "/dashboard";
}

export function roleSegment(role: UserRole) {
  return role.toLowerCase();
}
