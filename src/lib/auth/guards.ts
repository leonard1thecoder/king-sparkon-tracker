import type { UserRole } from "@/lib/types/backend";
import { rolesFromClaims } from "./roles";
import type { SessionClaims } from "./session";

export function hasRole(claims: SessionClaims | null, role: UserRole) {
  return rolesFromClaims(claims).includes(role);
}

export function canUseFeature(plan: string | null | undefined, feature: "WORKER_TIPS_PLATFORM" | "BUSINESS_ANALYSIS_AI" | "WORKER_CLOCKER") {
  if (plan === "PRO") {
    return true;
  }

  return feature !== "WORKER_TIPS_PLATFORM" && feature !== "BUSINESS_ANALYSIS_AI" && feature !== "WORKER_CLOCKER";
}

export function workerLimitForPlan(plan: string | null | undefined) {
  if (plan === "PRO") return Infinity;
  if (plan === "PLUS") return 5;
  return 2;
}
