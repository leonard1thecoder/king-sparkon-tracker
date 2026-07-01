import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE_NAME, dashboardPathForSession, decodeJwtPayload } from "@/lib/auth/session";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Dashboard Session Check",
  description: "King Sparkon Tracker validates secure dashboard access by role before opening a workspace.",
};

export default async function DashboardRedirectPage() {
  const token = (await cookies()).get(ACCESS_COOKIE_NAME)?.value;
  const claims = decodeJwtPayload(token);

  if (claims) {
    redirect(dashboardPathForSession(claims));
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--paper)] p-5 text-[var(--ink)]">
      <section className="max-w-md border border-[var(--line)] bg-white/55 p-7 text-center shadow-[var(--shadow-ledger)]">
        <div className="barcode-rule mx-auto mb-6 max-w-xs text-[var(--ink)]" />
        <h1 className="font-mono text-2xl font-black uppercase tracking-[-0.03em]">Session role unavailable</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--steel)]">Sign in again so the dashboard guard can read User, Owner, Worker, Affiliate, or Admin role claims from the secure session.</p>
        <a href="/login" className="mt-6 inline-flex">
          <Button>Back to login</Button>
        </a>
      </section>
    </main>
  );
}
