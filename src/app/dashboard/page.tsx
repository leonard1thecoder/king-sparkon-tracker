import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ACCESS_COOKIE_NAME, dashboardPathForSession, decodeJwtPayload } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Dashboard Session Check",
  description: "King Sparkon Tracker validates secure dashboard access by role before opening a workspace.",
};

export default async function DashboardRedirectPage() {
  const token = (await cookies()).get(ACCESS_COOKIE_NAME)?.value;
  const claims = decodeJwtPayload(token);
  const dashboardPath = dashboardPathForSession(claims);

  if (claims && dashboardPath !== "/dashboard") {
    redirect(dashboardPath);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--paper)] p-5 text-[var(--ink)]">
      <section className="max-w-md overflow-hidden rounded-[var(--radius-xl)] border border-[var(--line)] bg-white/72 p-7 text-center shadow-[var(--shadow-ledger)] ring-1 ring-white/70">
        <div className="barcode-rule mx-auto mb-6 max-w-xs text-[var(--ink)]" />
        <h1 className="font-mono text-2xl font-black uppercase tracking-[-0.03em]">Session role unavailable</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--steel)]">Sign in again so the dashboard guard can read User, Owner, Worker, Affiliate, or Admin role claims from the secure session.</p>
        <Link href="/login" className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-4 py-2 text-sm font-black uppercase tracking-[0.06em] text-white shadow-[0_12px_28px_rgba(29,92,131,0.18)] transition duration-200 ease-out hover:-translate-y-0.5 hover:border-[var(--gold)] hover:bg-[var(--ink)]">
          Back to login
        </Link>
      </section>
    </main>
  );
}
