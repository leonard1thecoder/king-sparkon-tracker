import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE_NAME, backendBaseUrl } from "@/lib/backend-auth";
import { normalizeUserRole } from "@/lib/roles";

export const metadata: Metadata = {
  title: "Dashboard Session Check",
  description:
    "King Sparkon Tracker validates secure dashboard access for barcode inventory tracking, product operations, reports, audit logs, and billing.",
};

type CurrentUserResponse = {
  privilege?: string;
};

function dashboardPathForPrivilege(privilege?: CurrentUserResponse["privilege"]) {
  const role = normalizeUserRole(privilege);

  if (role === "Worker") {
    return "/dashboard/worker";
  }

  if (role === "Owner") {
    return "/dashboard/owner";
  }

  return "/login";
}

async function currentUser(token: string) {
  const response = await fetch(`${backendBaseUrl()}/api/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json().catch(() => null)) as CurrentUserResponse | null;
}

export default async function DashboardRedirectPage() {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    redirect("/login");
  }

  const user = await currentUser(token);

  if (user?.privilege) {
    redirect(dashboardPathForPrivilege(user.privilege));
  }

  return (
    <main className="crypto-screen relative flex min-h-screen items-center justify-center overflow-hidden bg-[#000510] px-5 text-white">
      <div className="crypto-grid absolute inset-0 opacity-[0.08]" />
      <div className="absolute -left-48 -bottom-40 h-[34rem] w-[34rem] rounded-full bg-gradient-to-br from-[#99e39e] to-[#1dc8cd] opacity-20 blur-[220px]" />
      <section className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#1e2229]/72 p-7 text-center shadow-[0_24px_80px_rgba(0,0,0,0.4)] backdrop-blur-xl">
        <Image
          src="/king-sparkon-logo.png"
          alt="King Sparkon Tracker logo"
          width={220}
          height={220}
          priority
          className="mx-auto h-auto w-[132px]"
        />
        <h1 className="mt-8 text-2xl font-semibold text-white">Dashboard session needs refresh</h1>
        <p className="mt-3 text-sm leading-6 text-[#d8dbdb]/62">
          Your secure cookie exists, but the backend did not return a role for it.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-lg border border-[#99e39e] px-4 text-sm font-semibold text-[#99e39e] transition hover:bg-[#99e39e] hover:text-[#000510]"
        >
          Back to login
        </Link>
      </section>
    </main>
  );
}
