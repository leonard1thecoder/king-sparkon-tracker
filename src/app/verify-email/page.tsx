import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, XCircle } from "lucide-react";
import { backendBaseUrl } from "@/lib/backend-auth";

export const metadata: Metadata = {
  title: "Email Verification Result",
  description: "Verify your King Sparkon Tracker account for secure platform access.",
};

type VerifyResult = { ok: boolean; message: string };

async function verifyEmail(token: string): Promise<VerifyResult> {
  try {
    const response = await fetch(`${backendBaseUrl()}/api/auth/verify-email?token=${encodeURIComponent(token)}`, { cache: "no-store" });
    const body = (await response.json().catch(() => ({}))) as { message?: string; error?: string };
    return { ok: response.ok, message: body.message ?? body.error ?? (response.ok ? "Email verified successfully." : "Email verification failed.") };
  } catch {
    return { ok: false, message: `Backend API is unavailable at ${backendBaseUrl()}. Start the Spring Boot backend or set BACKEND_URL.` };
  }
}

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const result = token ? await verifyEmail(token) : { ok: false, message: "Verification token is missing from the link." };
  const Icon = result.ok ? CheckCircle2 : XCircle;

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-5 py-10 text-[var(--ink)]">
      <section className="w-full max-w-md rounded-xl border border-[var(--line-strong)] bg-white p-7 text-center shadow-[var(--shadow-soft)]">
        <Image src="/king-sparkon-logo.png" alt="King Sparkon Tracker logo" width={132} height={132} priority className="mx-auto h-auto w-[112px] rounded-lg border border-[var(--line)] bg-white p-2" />
        <div className={`mx-auto mt-8 flex h-14 w-14 items-center justify-center rounded-lg border ${result.ok ? "border-[var(--line-strong)] bg-[var(--signal-soft)] text-[var(--signal-strong)]" : "border-red-200 bg-red-50 text-red-700"}`}>
          <Icon className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-black tracking-[-0.03em]">{result.ok ? "Email verified" : "Verification needs attention"}</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--steel)]">{result.message}</p>
        <Link data-orange-hover="true" href={result.ok ? "/login" : "/resend-verification"} className="mt-7 inline-flex h-11 items-center justify-center rounded-lg border border-[var(--signal)] bg-[var(--signal)] px-4 text-sm font-extrabold text-white hover:border-[var(--accent-hover)] hover:bg-[var(--accent-hover)]">
          {result.ok ? "Go to sign in" : "Resend verification"}
        </Link>
      </section>
    </main>
  );
}
