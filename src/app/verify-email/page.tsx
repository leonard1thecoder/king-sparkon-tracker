import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, XCircle } from "lucide-react";
import { backendBaseUrl } from "@/lib/backend-auth";

export const metadata: Metadata = {
  title: "Email Verification Result",
  description:
    "Verify your King Sparkon Tracker account for secure barcode inventory tracking, worker scanning, claims, reports, transactions, and billing.",
};

type VerifyResult = {
  ok: boolean;
  message: string;
};

async function verifyEmail(token: string): Promise<VerifyResult> {
  try {
    const response = await fetch(
      `${backendBaseUrl()}/api/auth/verify-email?token=${encodeURIComponent(token)}`,
      { cache: "no-store" },
    );
    const body = (await response.json().catch(() => ({}))) as { message?: string; error?: string };

    return {
      ok: response.ok,
      message: body.message ?? body.error ?? (response.ok ? "Email verified successfully." : "Email verification failed."),
    };
  } catch {
    return {
      ok: false,
      message: `Backend API is unavailable at ${backendBaseUrl()}. Start the Spring Boot backend or set BACKEND_URL.`,
    };
  }
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = token
    ? await verifyEmail(token)
    : { ok: false, message: "Verification token is missing from the link." };
  const Icon = result.ok ? CheckCircle2 : XCircle;

  return (
    <main className="crypto-screen relative flex min-h-screen items-center justify-center overflow-hidden bg-[#000510] px-5 py-10 text-white">
      <div className="crypto-grid absolute inset-0 opacity-[0.08]" />
      <div className="absolute -right-48 -top-36 h-[34rem] w-[34rem] rounded-full bg-gradient-to-br from-[#477e70] to-[#666c78] opacity-45 blur-[220px]" />
      <section className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#1e2229]/72 p-7 text-center shadow-[0_28px_90px_rgba(0,0,0,0.42)] backdrop-blur-xl">
        <Image
          src="/king-sparkon-logo.png"
          alt="King Sparkon Tracker logo"
          width={220}
          height={220}
          priority
          className="mx-auto h-auto w-[132px]"
        />
        <div
          className={`mx-auto mt-8 flex h-14 w-14 items-center justify-center rounded-2xl ${
            result.ok ? "bg-[#99e39e]/14 text-[#99e39e]" : "bg-[#ff5630]/12 text-[#ffac82]"
          }`}
        >
          <Icon className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold text-white">
          {result.ok ? "Email verified" : "Verification needs attention"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#d8dbdb]/62">{result.message}</p>
        <Link
          href={result.ok ? "/login" : "/resend-verification"}
          className="mt-7 inline-flex h-11 items-center justify-center rounded-lg bg-[#99e39e] px-4 text-sm font-semibold text-[#000510] shadow-[0_18px_42px_rgba(153,227,158,0.22)] transition hover:bg-transparent hover:text-[#99e39e] hover:ring-1 hover:ring-[#99e39e]"
        >
          {result.ok ? "Go to sign in" : "Resend verification"}
        </Link>
      </section>
    </main>
  );
}
