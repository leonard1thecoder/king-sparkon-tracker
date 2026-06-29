import Link from "next/link";
import { ArrowRight, BarChart3, CreditCard } from "lucide-react";
import { RouteSectionPage } from "@/components/layout/RouteSectionPage";

const transactionActions = [
  [
    "/dashboard/owner/transactions/paypal/onboarding",
    "PayPal onboarding",
    "Connect or review the owner PayPal setup used for BUY and SELL transaction payment links.",
    CreditCard,
  ],
  [
    "/dashboard/owner",
    "Owner command center",
    "Return to the owner dashboard for products, workers, tips, tickets, and reporting visibility.",
    BarChart3,
  ],
] as const;

export default function OwnerTransactionsPage() {
  return (
    <RouteSectionPage
      role="OWNER"
      title="Transactions"
      description="Multi-line BUY and SELL checkout with payment type, payment contact, payment URL, status, and reference visibility."
      endpoint="GET/POST /api/transactions"
    >
      <section className="grid gap-4 lg:grid-cols-2">
        {transactionActions.map(([href, title, detail, Icon]) => (
          <Link
            key={href}
            href={href}
            className="group rounded-[var(--radius-xl)] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)] ring-1 ring-white/70 hover:-translate-y-1 hover:border-[var(--gold)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-[1.2rem] bg-[var(--ink)] text-[var(--gold)]">
                <Icon className="h-6 w-6" />
              </div>
              <ArrowRight className="mt-2 h-5 w-5 text-[var(--signal)] group-hover:text-[var(--ember)]" />
            </div>
            <h3 className="mt-5 text-xl font-black tracking-[-0.03em] text-[var(--ink)]">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-[var(--steel)]">{detail}</p>
          </Link>
        ))}
      </section>
    </RouteSectionPage>
  );
}
