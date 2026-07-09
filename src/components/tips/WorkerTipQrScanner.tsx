"use client";

import Link from "next/link";
import { type FormEvent, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Keyboard, QrCode, ShieldCheck, WalletCards } from "lucide-react";
import { BarcodeScanner } from "@/components/scanner/BarcodeScanner";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";

type WorkerQrResult = {
  workerId: string;
  source: "URL" | "JSON" | "RAW";
  rawValue: string;
};

const demoWorkerIds = ["demo-worker", "worker-demo-001", "sparkon-waiter-17"];

function cleanWorkerId(value: string) {
  return decodeURIComponent(value).trim().replace(/^@+/, "");
}

function readWorkerFromJson(value: string) {
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    const candidates = [parsed.workerId, parsed.worker_id, parsed.tipWorkerId, parsed.id, parsed.userId];
    const nestedWorker = parsed.worker && typeof parsed.worker === "object" ? (parsed.worker as Record<string, unknown>) : null;
    if (nestedWorker) {
      candidates.push(nestedWorker.id, nestedWorker.workerId, nestedWorker.worker_id);
    }
    const match = candidates.find((candidate) => typeof candidate === "string" && candidate.trim());
    return typeof match === "string" ? cleanWorkerId(match) : null;
  } catch {
    return null;
  }
}

function readWorkerFromUrl(value: string) {
  try {
    const url = new URL(value, typeof window === "undefined" ? "https://king-sparkon.local" : window.location.origin);
    const pathMatch = url.pathname.match(/\/tips\/workers\/([^/?#]+)/i);
    if (pathMatch?.[1]) {
      return cleanWorkerId(pathMatch[1]);
    }

    const queryMatch = url.searchParams.get("workerId") || url.searchParams.get("worker") || url.searchParams.get("tipWorkerId") || url.searchParams.get("w");
    return queryMatch ? cleanWorkerId(queryMatch) : null;
  } catch {
    return null;
  }
}

export function parseWorkerTipQr(rawValue: string): WorkerQrResult | null {
  const raw = rawValue.trim();
  if (!raw) return null;

  const prefixedValue = raw.match(/^(KST[-_:]?)?(WORKER[-_:]?TIP|TIP[-_:]?WORKER)[-_:](.+)$/i)?.[3];
  const value = prefixedValue ? prefixedValue.trim() : raw;
  const decoded = cleanWorkerId(value);

  const jsonWorkerId = readWorkerFromJson(decoded);
  if (jsonWorkerId) return { workerId: jsonWorkerId, source: "JSON", rawValue: raw };

  const urlWorkerId = readWorkerFromUrl(decoded);
  if (urlWorkerId) return { workerId: urlWorkerId, source: "URL", rawValue: raw };

  if (/^[a-z0-9][a-z0-9._:-]{2,80}$/i.test(decoded)) {
    return { workerId: decoded, source: "RAW", rawValue: raw };
  }

  return null;
}

export function WorkerTipQrScanner() {
  const [result, setResult] = useState<WorkerQrResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tipHref = useMemo(() => {
    if (!result) return null;
    return `/tips/workers/${encodeURIComponent(result.workerId)}`;
  }, [result]);

  function handleScan(value: string) {
    const parsed = parseWorkerTipQr(value);
    if (!parsed) {
      setResult(null);
      setError("This QR code does not look like a worker tip QR. Scan a worker QR or enter a worker ID manually.");
      return;
    }

    setResult(parsed);
    setError(null);
  }

  function submitManualWorker(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const workerId = String(formData.get("workerId") ?? "").trim();
    handleScan(workerId);
    event.currentTarget.reset();
  }

  return (
    <section className="grid gap-5">
      <Card className="overflow-hidden border-[var(--signal)]/25">
        <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Scan worker QR to tip</CardTitle>
            <p className="mt-2 text-sm leading-6 text-[var(--steel)]">
              Scan the worker QR code, confirm the worker, then continue into the secure worker tip page with the worker locked in.
            </p>
          </div>
          <StatusPill label="TIP SCANNER" tone="confirm" />
        </CardHeader>
        <CardContent>
          <BarcodeScanner onScan={handleScan} />
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Manual worker fallback</CardTitle>
            <p className="mt-2 text-sm leading-6 text-[var(--steel)]">Use this when the customer camera is blocked or the worker gives you the worker ID directly.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitManualWorker} className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <label className="relative block">
                <Keyboard className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--signal)]" />
                <input
                  name="workerId"
                  placeholder="Worker ID or /tips/workers/{workerId}"
                  className="min-h-12 w-full rounded-full border border-[var(--line)] bg-[var(--surface)] pl-11 pr-4 text-sm font-bold outline-none focus:border-[var(--signal)]"
                />
              </label>
              <Button type="submit" variant="secondary">Find worker</Button>
            </form>

            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              {demoWorkerIds.map((workerId) => (
                <button
                  key={workerId}
                  type="button"
                  onClick={() => handleScan(workerId)}
                  className="rounded-[1.2rem] border border-[var(--line)] bg-white px-4 py-3 text-left text-xs font-black text-[var(--ink)] hover:border-[var(--gold)]"
                >
                  {workerId}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>{result ? "Worker found" : "Waiting for worker QR"}</CardTitle>
              <p className="mt-2 text-sm leading-6 text-[var(--steel)]">
                {result ? "Confirm the worker context before creating the tip payment." : "The worker identity will appear here after scanning."}
              </p>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-[1.2rem] bg-[var(--ink)] text-[var(--gold)]">
              {result ? <CheckCircle2 className="h-6 w-6" /> : <QrCode className="h-6 w-6" />}
            </div>
          </CardHeader>
          <CardContent>
            {error ? <p className="rounded-[var(--radius-lg)] border border-[var(--danger)]/30 bg-white p-4 text-sm font-bold text-[var(--danger)]">{error}</p> : null}

            {result ? (
              <div className="grid gap-4">
                <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--ink)] p-5 text-white shadow-[var(--shadow-depth)]">
                  <p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.18em] text-[var(--gold)]">Worker ID</p>
                  <h3 className="code mt-3 break-all text-3xl font-black tracking-[-0.04em]">{result.workerId}</h3>
                  <div className="barcode-rule mt-5 h-10 text-white" />
                  <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-white/62">Detected from {result.source}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1.35rem] border border-[var(--line)] bg-[var(--surface)] p-4">
                    <ShieldCheck className="h-5 w-5 text-[var(--confirm)]" />
                    <p className="mt-3 text-sm font-black text-[var(--ink)]">Worker locked</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--steel)]">Tip URL carries this worker ID.</p>
                  </div>
                  <div className="rounded-[1.35rem] border border-[var(--line)] bg-[var(--surface)] p-4">
                    <WalletCards className="h-5 w-5 text-[var(--signal)]" />
                    <p className="mt-3 text-sm font-black text-[var(--ink)]">Tip flow next</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--steel)]">Customer chooses amount and continues payment.</p>
                  </div>
                  <div className="rounded-[1.35rem] border border-[var(--line)] bg-[var(--surface)] p-4">
                    <QrCode className="h-5 w-5 text-[var(--gold)]" />
                    <p className="mt-3 text-sm font-black text-[var(--ink)]">QR verified</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--steel)]">Raw scan is kept for traceability.</p>
                  </div>
                </div>

                {tipHref ? (
                  <Link href={tipHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-6 text-sm font-black text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ink)]">
                    Continue to tip this worker <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : null}
              </div>
            ) : (
              <div className="rounded-[2rem] border border-dashed border-[var(--line-strong)] bg-[var(--surface)] p-8 text-center">
                <QrCode className="mx-auto h-12 w-12 text-[var(--signal)]" />
                <h3 className="mt-4 text-2xl font-black tracking-[-0.04em] text-[var(--ink)]">Scan a worker QR</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--steel)]">Accepted values include raw worker IDs, full /tips/workers links, and JSON QR payloads containing workerId.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
