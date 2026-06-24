export type NormalizedUserRole = "Owner" | "Worker";

export function normalizeUserRole(value: unknown): NormalizedUserRole | null {
  const role = String(value ?? "").toLowerCase();

  if (role.includes("worker")) {
    return "Worker";
  }

  if (role.includes("owner")) {
    return "Owner";
  }

  return null;
}

export function userRoleLabel(value: unknown) {
  return normalizeUserRole(value) ?? "Unknown";
}
