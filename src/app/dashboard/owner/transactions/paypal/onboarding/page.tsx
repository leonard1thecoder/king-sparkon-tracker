import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3, CheckCircle2, CreditCard, ShieldCheck, WalletCards } from "lucide-react";
import { RouteSectionPage } from "@/components/layout/RouteSectionPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";

export const metadata: Metadata = {
  title: "Transactions PayPal Onboarding",
  description:
    "Owner PayPal onboarding callback page for website transactions, payment links, settlement readiness, and transaction reporting.",
};

const onboardingSteps = [
  ["Connect account", "Owner starts PayPal onboarding from the transactions dashboard."],
  ["Return callback", "PayPal redirects to TRANSACTIONS_PAYPAL_ONBOARDING_URL after consent."],
  ["Verify readiness", "Backend verifies merchant status, permissions, and payout availability."],
  ["Enable checkout", "BUY and SELL transaction payment links can be issued with clear status."],
] as const;

const transactionControls = [
  ["Payment URL", "Generate and show a customer-safe PayPal payment link."],
  ["Payment contact", "Keep customer email or WhatsApp contact attached to the transaction."],
  ["Reference", "Expose the transaction reference in owner reports."],
  ["Status", "Track CREATED, PENDING, PAID, FAILED, and REVIEW states cleanly."],
] as const;

export default function TransactionsPayPalOnboardingPage() {
  return (
    <RouteSectionPage
      role="OWNER"
      title="Transactions PayPal onboarding"
      description="Connect PayPal for website transactions so BUY and SELL payment links have owner settlement readiness, clean status visibility, and audit-grade reporting."
      endpoint="GET /api/transactions/paypal/onboarding · POST /api/transactions/paypal/onboarding/start"
    >
      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Transaction onboarding path</CardTitle>
              <p className="mt-2 text-sm leading-6 text-[var(--steel)]">
                The owner should always know what happens after the PayPal redirect returns to the app.
              </p>
            </div>
            <StatusPill label="PAYPAL READY" tone="confirm" />
          </CardHeader>
          <CardContent className="grid gap-3">
            {onboardingSteps.map(([title, detail], index) => (
              <article key={title} className="rounded-[1.45rem] border border-[var(--line)] bg-[var(--surface)] p-4 hover:border-[var(--gold)]">
                <div className="flex items-start gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[1.1rem] bg-white font-mono text-sm font-black text-[var(--signal)] shadow-[var(--shadow-soft)]">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h3 className="font-black tracking-[-0.02em] text-[var(--ink)]">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--steel)]">{detail}</p>
                  </div>
                </div>
              </article>
            ))}
          </CardContent>
        </Card>

        <div className="relative overflow-hidden rounded-[2.5rem] bg-[var(--ink)] p-6 text-white shadow-[var(--shadow-depth)] enterprise-grid md:p-8">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[var(--gold)]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-10 h-72 w-72 rounded-full bg-[var(--ember)]/16 blur-3xl" />
          <div className="relative">
            <div className="grid h-14 w-14 place-items-center rounded-[1.4rem] border border-white/10 bg-white/[0.08] text-[var(--gold)]">
              <CreditCard className="h-7 w-7" />
            </div>
            <h2 className="mt-6 text-3xl font-black tracking-[-0.05em] md:text-5xl">
              Payment links should never look like an afterthought.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/68 md:text-base">
              This page is the owner-facing callback surface for TRANSACTIONS_PAYPAL_ONBOARDING_URL. It keeps PayPal readiness separate from worker tip onboarding while using the same premium dashboard styling.
            </p>
            <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-4">
              <p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.16em] text-[var(--gold)]">Callback route</p>
              <p className="code mt-2 break-all text-sm font-semibold text-white/78">/dashboard/owner/transactions/paypal/onboarding</p>
              <div className="barcode-rule mt-4 h-8 text-white" />
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard/owner/transactions"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--gold)] bg-[var(--gold)] px-5 text-sm font-black text-[var(--ink)] shadow-[var(--shadow-soft)] hover:bg-white"
              >
                Back to transactions <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard/owner"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-5 text-sm font-black text-white hover:bg-white/12"
              >
                Owner dashboard <BarChart3 className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        {transactionControls.map(([title, detail]) => (
          <Card key={title} className="p-5 hover:-translate-y-1 hover:border-[var(--gold)]">
            <CheckCircle2 className="h-5 w-5 text-[var(--signal)]" />
            <h3 className="mt-4 text-lg font-black tracking-[-0.03em]">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-[var(--steel)]">{detail}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="grid h-12 w-12 place-items-center rounded-[1.2rem] bg-[var(--ink)] text-[var(--gold)]">
            <WalletCards className="h-6 w-6" />
          </div>
          <h3 className="mt-5 text-xl font-black tracking-[-0.03em]">Separate transaction onboarding</h3>
          <p className="mt-3 text-sm leading-6 text-[var(--steel)]">
            Transactions get their own PayPal setup route so checkout payment links do not conflict with worker tip payout configuration.
          </p>
        </Card>
        <Card className="p-5">
          <div className="grid h-12 w-12 place-items-center rounded-[1.2rem] bg-[var(--ink)] text-[var(--gold)]">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="mt-5 text-xl font-black tracking-[-0.03em]">Report-ready status</h3>
          <p className="mt-3 text-sm leading-6 text-[var(--steel)]">
            Keep payment method, customer contact, payment URL, reference, gross value, fee, and state visible for owner review.
          </p>
        </Card>
      </section>
    </RouteSectionPage>
  );
}
