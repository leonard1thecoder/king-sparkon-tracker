import type { UserRole } from "@/lib/types/backend";

const roleMap: Record<string, UserRole> = {
  user: "User",
  customer: "User",
  buyer: "User",
  owner: "Owner",
  business_owner: "Owner",
  businessowner: "Owner",
  company_owner: "Owner",
  worker: "Worker",
  employee: "Worker",
  staff: "Worker",
  affiliate: "Affiliate",
  promoter: "Affiliate",
  admin: "Admin",
  administrator: "Admin",
  user: "User",
  customer: "User",
  buyer: "User",
};

function roleKey(value: string) {
  return value
    .trim()
    .replace(/^ROLE[_\s-]*/i, "")
    .replace(/[\s-]+/g, "_")
    .toLowerCase();
}

export function normalizeRole(value: unknown): UserRole | null {
  if (typeof value !== "string") {
    return null;
  }

  const key = roleKey(value);
  return roleMap[key] ?? roleMap[key.replace(/_/g, "")] ?? null;
}

export function rolesFromClaims(claims: Record<string, unknown> | null | undefined): UserRole[] {
  if (!claims) {
    return [];
  }

  const claimValues = [claims.roles, claims.authorities, claims.role, claims.privilege, claims.userType, claims.accountType];
  const rawRoles = claimValues.flatMap((value) => {
    if (Array.isArray(value)) return value;
    return value ? [value] : [];
  });

  return Array.from(new Set(rawRoles.map(normalizeRole).filter((role): role is UserRole => Boolean(role))));
}

export function primaryDashboardForRoles(roles: UserRole[]) {
  if (roles.includes("Admin")) return "/dashboard/admin";
  if (roles.includes("Owner")) return "/dashboard/owner";
  if (roles.includes("Worker")) return "/dashboard/worker";
  if (roles.includes("Affiliate")) return "/dashboard/affiliate";
  if (roles.includes("User")) return "/dashboard/user";
  return "/dashboard";
}

export function roleSegment(role: UserRole) {
  return role.toLowerCase();
}
