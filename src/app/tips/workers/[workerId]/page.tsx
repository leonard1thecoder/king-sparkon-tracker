import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, CreditCard, QrCode, ShieldCheck, WalletCards } from "lucide-react";
import { RouteSectionPage } from "@/components/layout/RouteSectionPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";

type WorkerTipPageProps = {
  params: Promise<{ workerId: string }>;
};

const tipOptions = [
  ["R20", "Quick thanks", "A small thank-you for fast service."],
  ["R50", "Great support", "Reward helpful service and good attitude."],
  ["R100", "Excellent work", "For workers who went above expectation."],
  ["Custom", "Own amount", "Let the payment step collect a custom tip value."],
] as const;

const trustSignals = [
  ["Worker locked", "This tip page is tied to the worker ID in the QR URL."],
  ["PayPal ready", "Checkout can redirect to PayPal once the backend payment link is active."],
  ["Owner review", "Owners can review gross tips, platform fee, net amount, and paid state."],
] as const;

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value).trim() || value;
  } catch {
    return value;
  }
}

export async function generateMetadata({ params }: WorkerTipPageProps): Promise<Metadata> {
  const { workerId } = await params;
  const workerLabel = safeDecode(workerId);

  return {
    title: `Tip Worker ${workerLabel}`,
    description: `Secure public worker tip page for King Sparkon Tracker worker ${workerLabel}.`,
  };
}

export default async function WorkerTipPage({ params }: WorkerTipPageProps) {
  const { workerId } = await params;
  const workerLabel = safeDecode(workerId);
  const encodedWorkerId = encodeURIComponent(workerLabel);

  return (
    <RouteSectionPage
      role="TIP QR"
      title="Tip worker"
      description={`Secure tip page for worker ${workerLabel}. Customers can scan the worker QR card, confirm the worker context, and continue into the PayPal tip payment flow when the backend link is connected.`}
      endpoint="POST /api/tips/workers/{workerId}/paypal/checkout"
    >
      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-[var(--ink)] p-6 text-white shadow-[var(--shadow-depth)] enterprise-grid md:p-8">
          <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[var(--gold)]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-10 h-72 w-72 rounded-full bg-[var(--ember)]/16 blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between gap-4">
              <StatusPill label="WORKER VERIFIED" tone="confirm" />
              <div className="grid h-12 w-12 place-items-center rounded-[1.2rem] border border-white/10 bg-white/[0.08] text-[var(--gold)]">
                <QrCode className="h-6 w-6" />
              </div>
            </div>

            <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
              <p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.18em] text-[var(--gold)]">Worker ID</p>
              <h2 className="code mt-3 break-all text-3xl font-black tracking-[-0.04em] md:text-5xl">{workerLabel}</h2>
              <div className="barcode-rule mt-5 h-10 text-white" />
              <p className="mt-4 text-sm leading-6 text-white/64">
                This is the customer-facing tip link generated for this worker.
              </p>
            </div>

            <div className="mt-7 grid gap-3">
              {trustSignals.map(([title, detail]) => (
                <div key={title} className="flex items-start gap-3 rounded-[1.35rem] border border-white/10 bg-white/[0.06] p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--gold)]" />
                  <div>
                    <h3 className="text-sm font-black text-white">{title}</h3>
                    <p className="mt-1 text-xs leading-5 text-white/62">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Choose a tip amount</CardTitle>
              <p className="mt-2 text-sm leading-6 text-[var(--steel)]">
                Keep the payment decision simple on mobile. The backend can convert the selected value into a PayPal payment link.
              </p>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-[1.2rem] bg-[var(--ink)] text-[var(--gold)]">
              <WalletCards className="h-6 w-6" />
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {tipOptions.map(([amount, title, detail]) => (
                <Link
                  key={amount}
                  href={`/tips/workers/${encodedWorkerId}?amount=${encodeURIComponent(amount)}`}
                  className="group rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-4 hover:border-[var(--gold)] hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="money text-2xl font-black text-[var(--ink)]">{amount}</p>
                      <h3 className="mt-2 font-black tracking-[-0.02em] text-[var(--ink)]">{title}</h3>
                    </div>
                    <ArrowRight className="mt-1 h-5 w-5 text-[var(--signal)] group-hover:text-[var(--ember)]" />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--steel)]">{detail}</p>
                </Link>
              ))}
            </div>

            <div className="rounded-[1.5rem] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-soft)]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-mono text-[0.66rem] font-black uppercase tracking-[0.16em] text-[var(--signal)]">Payment handoff</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--steel)]">
                    Continue when you are ready to generate a live payment link for worker {workerLabel}.
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ink)]"
                >
                  Continue to PayPal <CreditCard className="h-4 w-4" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 hover:-translate-y-1 hover:border-[var(--gold)]">
          <div className="grid h-12 w-12 place-items-center rounded-[1.2rem] bg-[var(--ink)] text-[var(--gold)]">
            <QrCode className="h-6 w-6" />
          </div>
          <h3 className="mt-5 text-xl font-black tracking-[-0.03em]">QR-first checkout</h3>
          <p className="mt-3 text-sm leading-6 text-[var(--steel)]">
            The scanned worker QR code lands directly here, reducing confusion for customers paying tips.
          </p>
        </Card>
        <Card className="p-5 hover:-translate-y-1 hover:border-[var(--gold)]">
          <div className="grid h-12 w-12 place-items-center rounded-[1.2rem] bg-[var(--ink)] text-[var(--gold)]">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="mt-5 text-xl font-black tracking-[-0.03em]">Clear worker context</h3>
          <p className="mt-3 text-sm leading-6 text-[var(--steel)]">
            Worker identity remains visible before payment so the customer knows who receives the tip allocation.
          </p>
        </Card>
        <Card className="p-5 hover:-translate-y-1 hover:border-[var(--gold)]">
          <div className="grid h-12 w-12 place-items-center rounded-[1.2rem] bg-[var(--ink)] text-[var(--gold)]">
            <CreditCard className="h-6 w-6" />
          </div>
          <h3 className="mt-5 text-xl font-black tracking-[-0.03em]">Payment link ready</h3>
          <p className="mt-3 text-sm leading-6 text-[var(--steel)]">
            The UI is ready for backend PayPal checkout generation, email fallback, and WhatsApp payment link sharing.
          </p>
        </Card>
      </section>
    </RouteSectionPage>
  );
}
