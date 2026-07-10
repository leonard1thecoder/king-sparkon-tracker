import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, CreditCard, QrCode, ShieldCheck } from "lucide-react";
import { RouteSectionPage } from "@/components/layout/RouteSectionPage";
import { WorkerTipCheckout } from "@/components/tips/WorkerTipCheckout";
import { Card } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";

type WorkerTipPageProps = {
  params: Promise<{ workerId: string }>;
};

const trustSignals = [
  ["Worker locked", "This dashboard tip page is tied to the worker ID found from the QR code."],
  ["Payment ready", "The selected amount is sent to the existing tip payment handoff."],
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
    description: `User dashboard worker tip page for King Sparkon Tracker worker ${workerLabel}.`,
  };
}

export default async function DashboardUserWorkerTipPage({ params }: WorkerTipPageProps) {
  const { workerId } = await params;
  const workerLabel = safeDecode(workerId);

  return (
    <RouteSectionPage
      role="USER WORKSPACE"
      title="Tip worker"
      description={`Worker ${workerLabel} was found from the QR scan. Choose an amount, enter secure payment details, and tip the worker without leaving the user dashboard.`}
      endpoint="POST /api/tips"
    >
      <section className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
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
                The scanned worker remains visible while you choose and confirm the tip amount.
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

            <Link href="/dashboard/user/tips/scan" className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-white/15 bg-white/[0.08] px-5 text-sm font-black text-white hover:bg-white/15">
              Scan another worker
            </Link>
          </div>
        </div>

        <WorkerTipCheckout workerId={workerLabel} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 hover:-translate-y-1 hover:border-[var(--gold)]">
          <div className="grid h-12 w-12 place-items-center rounded-[1.2rem] bg-[var(--ink)] text-[var(--gold)]">
            <QrCode className="h-6 w-6" />
          </div>
          <h3 className="mt-5 text-xl font-black tracking-[-0.03em]">QR-first checkout</h3>
          <p className="mt-3 text-sm leading-6 text-[var(--steel)]">
            The scanned worker QR code lands directly in the user dashboard tip flow.
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
          <h3 className="mt-5 text-xl font-black tracking-[-0.03em]">Payment handoff ready</h3>
          <p className="mt-3 text-sm leading-6 text-[var(--steel)]">
            Card details remain browser-only while the backend creates the worker tip and secure provider handoff.
          </p>
        </Card>
      </section>
    </RouteSectionPage>
  );
}
