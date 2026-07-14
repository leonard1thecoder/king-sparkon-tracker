import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, CreditCard, QrCode, ShieldCheck, WalletCards } from "lucide-react";
import { RouteSectionPage } from "@/components/layout/RouteSectionPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";

export const metadata: Metadata = {
  title: "Tips PayPal Onboarding",
  description:
    "Owner PayPal onboarding callback page for worker tips, QR tip links, payout readiness, and tip withdrawal visibility.",
};

const onboardingSignals = [
  ["PayPal account", "Connect the owner PayPal merchant account before worker tip links are promoted."],
  ["Tip QR routing", "Worker QR cards should resolve to /tips/workers/{workerId} and keep the worker context visible."],
  ["Fee visibility", "Show gross tip value, platform fee, net amount, and payout state before owner payout."],
] as const;

const readinessChecks = [
  ["Merchant consent", "Permissions granted and account linked"],
  ["Email confirmation", "PayPal email confirmed before payouts"],
  ["Tip checkout", "Worker tip URL template ready"],
  ["Owner review", "Paid state controlled from owner dashboard"],
] as const;

export default function TipsPayPalOnboardingPage() {
  return (
    <RouteSectionPage
      role="OWNER"
      title="Tips PayPal onboarding"
      description="Connect PayPal for worker tips so every QR tip link has a clean owner payout path, transparent fee display, and review-ready status tracking."
    >
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-[var(--ink)] p-6 text-white shadow-[var(--shadow-depth)] enterprise-grid md:p-8">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--gold)]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-12 h-72 w-72 rounded-full bg-[var(--ember)]/18 blur-3xl" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-3">
              <StatusPill label="PAYPAL CALLBACK" tone="confirm" />
              <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-white/72">
                Tips module
              </span>
            </div>
            <h2 className="mt-6 max-w-3xl text-3xl font-black tracking-[-0.05em] md:text-5xl">
              Worker tip payouts need a serious onboarding checkpoint.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68 md:text-base">
              This page is the frontend landing point for TIPS_PAYPAL_ONBOARDING_URL. It keeps the owner informed after PayPal redirects back to King Sparkon Tracker.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {onboardingSignals.map(([title, description]) => (
                <article key={title} className="rounded-[1.45rem] border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
                  <CheckCircle2 className="h-5 w-5 text-[var(--gold)]" />
                  <h3 className="mt-4 text-sm font-black tracking-[-0.01em] text-white">{title}</h3>
                  <p className="mt-2 text-xs leading-5 text-white/62">{description}</p>
                </article>
              ))}
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard/owner/tips"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--gold)] bg-[var(--gold)] px-5 text-sm font-black text-[var(--ink)] shadow-[var(--shadow-soft)] hover:bg-white"
              >
                Back to tips <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Onboarding readiness</CardTitle>
              <p className="mt-2 text-sm leading-6 text-[var(--steel)]">
                Keep the owner clear on what PayPal must confirm before live tip withdrawals.
              </p>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-[1.2rem] bg-[var(--ink)] text-[var(--gold)]">
              <WalletCards className="h-6 w-6" />
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            {readinessChecks.map(([label, detail]) => (
              <div key={label} className="flex items-start justify-between gap-4 rounded-[1.35rem] border border-[var(--line)] bg-[var(--surface)] p-4">
                <div>
                  <p className="font-mono text-[0.66rem] font-black uppercase tracking-[0.16em] text-[var(--signal)]">{label}</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[var(--steel)]">{detail}</p>
                </div>
                <StatusPill label="CHECK" tone="neutral" />
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 hover:-translate-y-1 hover:border-[var(--gold)]">
          <div className="grid h-12 w-12 place-items-center rounded-[1.2rem] bg-[var(--ink)] text-[var(--gold)]">
            <CreditCard className="h-6 w-6" />
          </div>
          <h3 className="mt-5 text-xl font-black tracking-[-0.03em]">Owner PayPal setup</h3>
          <p className="mt-3 text-sm leading-6 text-[var(--steel)]">
            Use this route after the PayPal redirect to explain whether the owner can receive tip payouts.
          </p>
        </Card>
        <Card className="p-5 hover:-translate-y-1 hover:border-[var(--gold)]">
          <div className="grid h-12 w-12 place-items-center rounded-[1.2rem] bg-[var(--ink)] text-[var(--gold)]">
            <QrCode className="h-6 w-6" />
          </div>
          <h3 className="mt-5 text-xl font-black tracking-[-0.03em]">Worker tip QR flow</h3>
          <p className="mt-3 text-sm leading-6 text-[var(--steel)]">
            Worker tip cards point customers to the public worker tip route while preserving worker identity.
          </p>
        </Card>
        <Card className="p-5 hover:-translate-y-1 hover:border-[var(--gold)]">
          <div className="grid h-12 w-12 place-items-center rounded-[1.2rem] bg-[var(--ink)] text-[var(--gold)]">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="mt-5 text-xl font-black tracking-[-0.03em]">Audit-safe payouts</h3>
          <p className="mt-3 text-sm leading-6 text-[var(--steel)]">
            Keep gross tips, platform fee, net amount, paid status, and owner actions visible for review.
          </p>
        </Card>
      </section>
    </RouteSectionPage>
  );
}
