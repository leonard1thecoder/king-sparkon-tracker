"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Keyboard,
  Loader2,
  QrCode,
  RefreshCw,
  ShieldCheck,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { BarcodeScanner } from "@/components/scanner/BarcodeScanner";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";
import { listTips } from "@/lib/api/tips";
import { normalizeApiError } from "@/lib/api/client";
import type { PageResponse, Tip } from "@/lib/types/backend";

type WorkerQrResult = {
  workerId: string;
  source: "URL" | "JSON" | "RAW";
  rawValue: string;
};

type TipHistoryRow = Tip & {
  workerName?: string | null;
  workerFullName?: string | null;
  createdAt?: string | null;
  createdDate?: string | null;
  updatedAt?: string | null;
  worker?: {
    id?: number;
    name?: string | null;
    fullName?: string | null;
    username?: string | null;
  } | null;
};

const TIP_PAGE_SIZE = 6;
const demoWorkerIds = ["demo-worker", "worker-demo-001", "sparkon-waiter-17"];

const FALLBACK_TIPS: TipHistoryRow[] = [
  { id: 1401, workerId: 201, workerName: "Thando Mokoena", tipAmount: 85, grossAmount: 85, status: "PAID", callbackUrl: "/dashboard/user/tips", createdAt: "2026-07-10T08:42:00+02:00" },
  { id: 1402, workerId: 207, workerName: "Lerato Dlamini", tipAmount: 50, grossAmount: 50, status: "PAID", callbackUrl: "/dashboard/user/tips", createdAt: "2026-07-10T07:18:00+02:00" },
  { id: 1403, workerId: 212, workerName: "Sibusiso Ndlovu", tipAmount: 120, grossAmount: 120, status: "PENDING", callbackUrl: "/dashboard/user/tips", createdAt: "2026-07-09T20:06:00+02:00" },
  { id: 1404, workerId: 204, workerName: "Naledi Khumalo", tipAmount: 40, grossAmount: 40, status: "PAID", callbackUrl: "/dashboard/user/tips", createdAt: "2026-07-09T18:34:00+02:00" },
  { id: 1405, workerId: 219, workerName: "Ayanda Zulu", tipAmount: 75, grossAmount: 75, status: "PROCESSING", callbackUrl: "/dashboard/user/tips", createdAt: "2026-07-09T15:11:00+02:00" },
  { id: 1406, workerId: 201, workerName: "Thando Mokoena", tipAmount: 30, grossAmount: 30, status: "PAID", callbackUrl: "/dashboard/user/tips", createdAt: "2026-07-09T12:47:00+02:00" },
  { id: 1407, workerId: 225, workerName: "Boitumelo Molefe", tipAmount: 150, grossAmount: 150, status: "PAID", callbackUrl: "/dashboard/user/tips", createdAt: "2026-07-08T21:25:00+02:00" },
  { id: 1408, workerId: 207, workerName: "Lerato Dlamini", tipAmount: 60, grossAmount: 60, status: "PAID", callbackUrl: "/dashboard/user/tips", createdAt: "2026-07-08T17:53:00+02:00" },
  { id: 1409, workerId: 212, workerName: "Sibusiso Ndlovu", tipAmount: 100, grossAmount: 100, status: "FAILED", callbackUrl: "/dashboard/user/tips", createdAt: "2026-07-08T14:09:00+02:00" },
  { id: 1410, workerId: 204, workerName: "Naledi Khumalo", tipAmount: 45, grossAmount: 45, status: "PAID", callbackUrl: "/dashboard/user/tips", createdAt: "2026-07-08T10:36:00+02:00" },
  { id: 1411, workerId: 219, workerName: "Ayanda Zulu", tipAmount: 90, grossAmount: 90, status: "PENDING", callbackUrl: "/dashboard/user/tips", createdAt: "2026-07-07T19:22:00+02:00" },
  { id: 1412, workerId: 225, workerName: "Boitumelo Molefe", tipAmount: 55, grossAmount: 55, status: "PAID", callbackUrl: "/dashboard/user/tips", createdAt: "2026-07-07T16:02:00+02:00" },
  { id: 1413, workerId: 201, workerName: "Thando Mokoena", tipAmount: 200, grossAmount: 200, status: "PAID", callbackUrl: "/dashboard/user/tips", createdAt: "2026-07-07T12:14:00+02:00" },
  { id: 1414, workerId: 207, workerName: "Lerato Dlamini", tipAmount: 35, grossAmount: 35, status: "PAID", callbackUrl: "/dashboard/user/tips", createdAt: "2026-07-06T18:48:00+02:00" },
];

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function cleanWorkerId(value: string) {
  return safeDecode(value).trim().replace(/^@+/, "");
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
    const pathMatch = url.pathname.match(/\/(?:dashboard\/user\/tips\/workers|tips\/workers)\/([^/?#]+)/i);
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

function money(value: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(Number(value || 0));
}

function workerLabel(tip: TipHistoryRow) {
  return tip.workerName
    || tip.workerFullName
    || tip.worker?.fullName
    || tip.worker?.name
    || tip.worker?.username
    || `Worker #${tip.workerId}`;
}

function tipDate(tip: TipHistoryRow) {
  const value = tip.createdAt || tip.createdDate || tip.updatedAt;
  if (!value) return "Not recorded";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function tipTone(status?: string) {
  const normalized = String(status ?? "PENDING").toUpperCase();
  if (["PAID", "COMPLETED", "SUCCESS"].includes(normalized)) return "confirm" as const;
  if (["PENDING", "PROCESSING", "CREATED"].includes(normalized)) return "signal" as const;
  return "neutral" as const;
}

function normalizeTipResponse(response: PageResponse<Tip> | Tip[], page: number, size: number) {
  if (Array.isArray(response)) {
    const rows = response as TipHistoryRow[];
    return {
      rows: rows.slice(page * size, page * size + size),
      totalElements: rows.length,
      totalPages: Math.max(1, Math.ceil(rows.length / size)),
    };
  }

  return {
    rows: (response.content ?? []) as TipHistoryRow[],
    totalElements: response.totalElements ?? response.content?.length ?? 0,
    totalPages: Math.max(1, response.totalPages ?? 1),
  };
}

export function WorkerTipQrScanner() {
  const [result, setResult] = useState<WorkerQrResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tips, setTips] = useState<TipHistoryRow[]>([]);
  const [tipPage, setTipPage] = useState(0);
  const [tipTotalPages, setTipTotalPages] = useState(1);
  const [tipTotalElements, setTipTotalElements] = useState(0);
  const [tipsLoading, setTipsLoading] = useState(true);
  const [tipsError, setTipsError] = useState<string | null>(null);
  const [usingPreviewTips, setUsingPreviewTips] = useState(false);

  const tipHref = useMemo(() => {
    if (!result) return null;
    return `/dashboard/user/tips/workers/${encodeURIComponent(result.workerId)}`;
  }, [result]);

  async function loadTipHistory(page = tipPage) {
    setTipsLoading(true);
    setTipsError(null);

    try {
      const response = await listTips({ page, size: TIP_PAGE_SIZE });
      const normalized = normalizeTipResponse(response, page, TIP_PAGE_SIZE);
      setTips(normalized.rows);
      setTipTotalPages(normalized.totalPages);
      setTipTotalElements(normalized.totalElements);
      setUsingPreviewTips(false);

      if (page >= normalized.totalPages && page > 0) {
        setTipPage(normalized.totalPages - 1);
      }
    } catch (exception) {
      const start = page * TIP_PAGE_SIZE;
      setTips(FALLBACK_TIPS.slice(start, start + TIP_PAGE_SIZE));
      setTipTotalPages(Math.max(1, Math.ceil(FALLBACK_TIPS.length / TIP_PAGE_SIZE)));
      setTipTotalElements(FALLBACK_TIPS.length);
      setUsingPreviewTips(true);
      setTipsError(`${normalizeApiError(exception).message} Showing labelled preview tip data until the service responds.`);
    } finally {
      setTipsLoading(false);
    }
  }

  useEffect(() => {
    void loadTipHistory(tipPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipPage]);

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
    <section className="grid gap-6">
      <Card className="overflow-hidden border-[var(--signal)]/25">
        <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Scan worker QR to tip</CardTitle>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--steel)]">
              Scan the worker QR, use the worker-specific manual fallback when needed, confirm the worker, and continue to the secure tip payment.
            </p>
          </div>
          <StatusPill label="TIP SCANNER" tone="confirm" />
        </CardHeader>

        <CardContent className="grid gap-6">
          <BarcodeScanner onScan={handleScan} hideResult hideManualFallback />

          <div className="grid gap-5 border-t border-[var(--line)] pt-6 xl:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface)] p-5">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-[1rem] bg-white text-[var(--signal)] shadow-[var(--shadow-soft)]">
                  <Keyboard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black tracking-[-0.03em] text-[var(--ink)]">Manual worker fallback</h3>
                  <p className="mt-1 text-xs leading-5 text-[var(--steel)]">Use a worker ID or worker tip URL when the camera cannot read the QR.</p>
                </div>
              </div>

              <form onSubmit={submitManualWorker} className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
                <input
                  name="workerId"
                  placeholder="Worker ID or dashboard worker tip URL"
                  className="min-h-12 w-full rounded-full border border-[var(--line)] bg-white px-5 text-sm font-bold outline-none focus:border-[var(--signal)]"
                />
                <Button type="submit" variant="secondary">Find worker</Button>
              </form>

              <div className="mt-4 flex flex-wrap gap-2">
                {demoWorkerIds.map((workerId) => (
                  <button
                    key={workerId}
                    type="button"
                    onClick={() => handleScan(workerId)}
                    className="rounded-full border border-[var(--line)] bg-white px-3 py-2 text-xs font-black text-[var(--ink)] hover:border-[var(--gold)] hover:bg-[var(--gold)]/20"
                  >
                    {workerId}
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.16em] text-[var(--signal)]">Worker confirmation</p>
                  <h3 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[var(--ink)]">{result ? "Worker found" : "Waiting for worker"}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--steel)]">
                    {result ? "The worker is locked into the next tip step." : "Scan a QR or enter a worker ID to continue."}
                  </p>
                </div>
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[1.2rem] bg-[var(--ink)] text-[var(--gold)]">
                  {result ? <CheckCircle2 className="h-6 w-6" /> : <QrCode className="h-6 w-6" />}
                </div>
              </div>

              {error ? <p className="mt-4 rounded-[var(--radius-lg)] border border-[var(--danger)]/30 bg-[var(--danger)]/10 p-4 text-sm font-bold text-[var(--danger)]">{error}</p> : null}

              {result ? (
                <div className="mt-5 grid gap-4">
                  <div className="rounded-[1.5rem] border border-white/10 bg-[var(--ink)] p-5 text-white">
                    <p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.18em] text-[var(--gold)]">Worker ID</p>
                    <p className="code mt-3 break-all text-2xl font-black">{result.workerId}</p>
                    <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-white/55">Detected from {result.source}</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[1.2rem] border border-[var(--line)] bg-[var(--surface)] p-3">
                      <ShieldCheck className="h-4 w-4 text-[var(--confirm)]" />
                      <p className="mt-2 text-xs font-black text-[var(--ink)]">Worker locked</p>
                    </div>
                    <div className="rounded-[1.2rem] border border-[var(--line)] bg-[var(--surface)] p-3">
                      <WalletCards className="h-4 w-4 text-[var(--signal)]" />
                      <p className="mt-2 text-xs font-black text-[var(--ink)]">Amount next</p>
                    </div>
                    <div className="rounded-[1.2rem] border border-[var(--line)] bg-[var(--surface)] p-3">
                      <QrCode className="h-4 w-4 text-[var(--gold)]" />
                      <p className="mt-2 text-xs font-black text-[var(--ink)]">QR verified</p>
                    </div>
                  </div>

                  {tipHref ? (
                    <Link href={tipHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-6 text-sm font-black text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ink)]">
                      Continue to tip this worker <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : null}
                </div>
              ) : null}
            </section>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col gap-4 border-b border-[var(--line)] lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.16em] text-[var(--signal)]">Tip ledger</p>
            <CardTitle className="mt-2">All worker tips</CardTitle>
            <p className="mt-2 text-sm leading-6 text-[var(--steel)]">Review the worker, date and time, amount, and payment state for every available tip record.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-xs font-black text-[var(--ink)]">
              <UsersRound className="h-4 w-4 text-[var(--signal)]" /> {tipTotalElements} tips
            </div>
            <Button type="button" variant="quiet" onClick={() => void loadTipHistory(tipPage)} disabled={tipsLoading}>
              <RefreshCw className={`h-4 w-4 ${tipsLoading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {tipsError ? (
            <div className="m-5 rounded-[1.25rem] border border-[var(--gold)]/45 bg-[var(--gold)]/15 p-4 text-sm font-bold leading-6 text-[var(--steel)]">
              {tipsError}
              {usingPreviewTips ? <span className="ml-2 rounded-full bg-[var(--ink)] px-2 py-1 text-[0.62rem] font-black uppercase tracking-[0.1em] text-white">Preview data</span> : null}
            </div>
          ) : null}

          {tipsLoading ? (
            <div className="flex min-h-64 items-center justify-center gap-3 text-sm font-black text-[var(--steel)]">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading tip history
            </div>
          ) : tips.length === 0 ? (
            <div className="p-10 text-center">
              <WalletCards className="mx-auto h-10 w-10 text-[var(--signal)]" />
              <p className="mt-3 text-lg font-black text-[var(--ink)]">No tips recorded yet</p>
              <p className="mt-2 text-sm text-[var(--steel)]">Completed and pending worker tips will appear here.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-[760px] w-full border-collapse text-left">
                  <thead className="bg-[var(--surface)] text-[0.68rem] font-black uppercase tracking-[0.12em] text-[var(--steel)]">
                    <tr>
                      <th className="px-5 py-4">Worker</th>
                      <th className="px-5 py-4">When</th>
                      <th className="px-5 py-4">Amount</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4 text-right">Tip ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tips.map((tip) => (
                      <tr key={tip.id} className="border-t border-[var(--line)] bg-white transition hover:bg-[var(--gold)]/10">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[1rem] bg-[var(--ink)] text-[var(--gold)]">
                              <UsersRound className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-black text-[var(--ink)]">{workerLabel(tip)}</p>
                              <p className="mt-1 text-xs font-semibold text-[var(--muted)]">Worker ID {tip.workerId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="inline-flex items-center gap-2 text-sm font-bold text-[var(--steel)]">
                            <Clock3 className="h-4 w-4 text-[var(--signal)]" /> {tipDate(tip)}
                          </div>
                        </td>
                        <td className="money px-5 py-4 text-lg font-black text-[var(--ink)]">{money(tip.grossAmount ?? tip.tipAmount)}</td>
                        <td className="px-5 py-4"><StatusPill label={tip.status ?? "PENDING"} tone={tipTone(tip.status)} /></td>
                        <td className="code px-5 py-4 text-right text-sm font-black text-[var(--steel)]">#{tip.id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col items-center justify-between gap-4 border-t border-[var(--line)] bg-[var(--surface)] px-5 py-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setTipPage((page) => Math.max(0, page - 1))}
                  disabled={tipPage === 0 || tipsLoading}
                  className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 text-sm font-black text-[var(--ink)] hover:border-[var(--gold)] hover:bg-[var(--gold)]/20 disabled:cursor-not-allowed disabled:opacity-35 sm:w-auto"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>

                <div className="text-center">
                  <p className="text-sm font-black text-[var(--ink)]">Page {tipPage + 1} of {tipTotalPages}</p>
                  <p className="mt-1 text-xs font-semibold text-[var(--steel)]">Showing up to {TIP_PAGE_SIZE} tips per page</p>
                </div>

                <button
                  type="button"
                  onClick={() => setTipPage((page) => Math.min(tipTotalPages - 1, page + 1))}
                  disabled={tipPage >= tipTotalPages - 1 || tipsLoading}
                  className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-[var(--ink)] bg-[var(--ink)] px-4 text-sm font-black text-white hover:border-[var(--signal)] hover:bg-[var(--signal)] disabled:cursor-not-allowed disabled:opacity-35 sm:w-auto"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
