import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AuthFrame } from "@/components/auth/AuthFrame";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { SignedInRegisterNotice } from "@/components/auth/SignedInRegisterNotice";
import { ACCESS_COOKIE_NAME, dashboardPathForSession, decodeJwtPayload } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a King Sparkon account.",
  alternates: { canonical: "/register" },
  robots: { index: false, follow: true },
};

// Plan and privilege query parameters only choose the initially selected role.
function initialRoleFrom(plan?: string, privilege?: string) {
  const normalizedPrivilege = privilege?.toUpperCase();
  if (normalizedPrivilege === "USER" || normalizedPrivilege === "AFFILIATE" || normalizedPrivilege === "ARTIST" || normalizedPrivilege === "BUSINESS_OWNER") {
    return normalizedPrivilege;
  }
  const normalizedPlan = plan?.toUpperCase();
  if (normalizedPlan === "FREE_AFFILIATE") return "AFFILIATE";
  if (normalizedPlan === "FREE_TRIAL_BUSINESS" || normalizedPlan === "FREE_TRIAL" || normalizedPlan === "PLUS" || normalizedPlan === "PRO") {
    return "BUSINESS_OWNER";
  }
  return "USER";
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; service?: string; privilege?: string }>;
}) {
  const token = (await cookies()).get(ACCESS_COOKIE_NAME)?.value;
  const claims = decodeJwtPayload(token);
  const dashboardPath = dashboardPathForSession(claims);

  if (claims && dashboardPath !== "/dashboard") {
    return <SignedInRegisterNotice dashboardPath={dashboardPath} />;
  }

  const { plan, privilege } = await searchParams;

  return (
    <AuthFrame width="wide">
      <RegisterForm initialRole={initialRoleFrom(plan, privilege)} />
    </AuthFrame>
  );
}
