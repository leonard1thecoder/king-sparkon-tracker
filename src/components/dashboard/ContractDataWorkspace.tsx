"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Database, ExternalLink, Loader2, RefreshCcw, TriangleAlert } from "lucide-react";
import { apiClient, normalizeApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";

type BackendRow = Record<string, unknown>;
type BackendPayload = BackendRow | BackendRow[] | { content?: BackendRow[]; data?: BackendRow[]; items?: BackendRow[] };

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; payload: BackendPayload };

function endpointPath(contract?: string) {
  if (!contract) return null;
  const match = contract.match(/\/api\/[\w\-/{}?=&]+/);
  if (!match) return null;
  if (match[0].includes("{")) return null;
  return match[0].replace(/^\/api/, "") || "/";
}

function rowsFromPayload(payload: BackendPayload): BackendRow[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.content)) return payload.content;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.items)) return payload.items;
  return [payload];
}

function nestedArrays(payload: BackendPayload) {
  if (Array.isArray(payload)) return [];

  return Object.entries(payload)
    .filter(([, value]) => Array.isArray(value))
    .map(([key, value]) => ({ key, rows: value as BackendRow[] }))
    .filter(({ rows }) => rows.length > 0 && rows.every((row) => typeof row === "object" && row !== null));
}

function tableKeys(rows: BackendRow[]) {
  const priority = ["id", "name", "title", "username", "emailAddress", "contact", "status", "type", "category", "price", "amount", "grossAmount", "feeAmount", "netAmount", "paymentStatus", "paymentReference", "stockQuantity", "barcodeCount", "createdAt", "updatedAt"];
  const discovered = new Set<string>();

  rows.slice(0, 8).forEach((row) => {
    Object.entries(row).forEach(([key, value]) => {
      if (value === null || value === undefined) return;
      if (Array.isArray(value) || typeof value === "object") return;
      discovered.add(key);
    });
  });

  const ordered = priority.filter((key) => discovered.has(key));
  const rest = [...discovered].filter((key) => !ordered.includes(key)).sort();
  return [...ordered, ...rest].slice(0, 8);
}

function labelFor(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function displayValue(key: string, value: unknown) {
  if (value === null || value === undefined || value === "") return <span className="text-[var(--steel)]/70">—</span>;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number" && /amount|price|fee|total|balance/i.test(key)) {
    return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(value);
  }
  if (typeof value === "string" && /^https?:\/\//i.test(value)) {
    return (
      <a href={value} target="_blank" rel="noreferrer" className="inline-flex max-w-48 items-center gap-1 truncate font-black text-[var(--signal)] hover:text-[var(--ink)]">
        Open <ExternalLink className="h-3.5 w-3.5" />
      </a>
    );
  }
  return String(value);
}

function LiveTable({ title, rows }: { title: string; rows: BackendRow[] }) {
  const keys = tableKeys(rows);

  if (!rows.length) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-dashed border-[var(--line)] bg-white p-6 text-sm font-semibold text-[var(--steel)]">
        No live backend records returned for this workspace yet.
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--line)] bg-white shadow-[var(--shadow-soft)]">
      <div className="flex flex-col gap-2 border-b border-[var(--line)] bg-[var(--paper)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.16em] text-[var(--signal)]">Live backend data</p>
          <h3 className="mt-1 text-lg font-black tracking-[-0.03em] text-[var(--ink)]">{labelFor(title)}</h3>
        </div>
        <span className="rounded-full bg-[var(--confirm)] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-white">{rows.length} rows</span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--line)] text-left text-sm">
          <thead className="bg-white">
            <tr>
              {keys.map((key) => (
                <th key={key} className="whitespace-nowrap px-4 py-3 font-mono text-[0.65rem] font-black uppercase tracking-[0.14em] text-[var(--steel)]">
                  {labelFor(key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {rows.map((row, index) => (
              <tr key={`${title}-${index}`} className="hover:bg-[var(--surface)]">
                {keys.map((key) => (
                  <td key={key} className={cn("max-w-56 whitespace-nowrap px-4 py-3 font-semibold text-[var(--ink)]", /status/i.test(key) ? "font-black uppercase tracking-[0.08em]" : "")}>{displayValue(key, row[key])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function ContractDataWorkspace({ endpoint, title }: { endpoint?: string; title: string }) {
  const path = useMemo(() => endpointPath(endpoint), [endpoint]);
  const [state, setState] = useState<LoadState>({ status: "loading" });

  const load = useCallback(async () => {
    if (!path) {
      setState({ status: "error", message: "This dashboard route needs a collection GET contract before live data can be rendered." });
      return;
    }

    setState({ status: "loading" });

    try {
      const response = await apiClient.get<BackendPayload>(path);
      setState({ status: "ready", payload: response.data });
    } catch (error) {
      const normalized = normalizeApiError(error);
      setState({ status: "error", message: normalized.message ?? "Unable to load live backend data for this workspace." });
    }
  }, [path]);

  useEffect(() => {
    void load();
  }, [load]);

  if (state.status === "loading") {
    return (
      <div className="rounded-[var(--radius-xl)] border border-[var(--line)] bg-white p-6 shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-3 text-sm font-black text-[var(--steel)]">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--signal)]" /> Loading backend-backed dashboard data...
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="rounded-[var(--radius-xl)] border border-[var(--signal)]/30 bg-white p-6 shadow-[var(--shadow-soft)]">
        <div className="flex items-start gap-3">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-[var(--signal)]" />
          <div>
            <h3 className="font-black text-[var(--ink)]">Backend contract not reachable</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--steel)]">{state.message}</p>
            <button type="button" onClick={() => void load()} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full bg-[var(--ink)] px-4 text-sm font-black text-white hover:bg-[var(--signal)]">
              <RefreshCcw className="h-4 w-4" /> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const primaryRows = rowsFromPayload(state.payload);
  const arraySections = nestedArrays(state.payload);

  return (
    <div className="grid gap-5">
      <div className="rounded-[var(--radius-xl)] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)]">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-[var(--radius-md)] bg-[var(--ink)] text-[var(--gold)]">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.16em] text-[var(--confirm)]">Connected workspace</p>
            <h3 className="mt-1 text-xl font-black tracking-[-0.03em] text-[var(--ink)]">{title} is reading the backend contract.</h3>
            <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-[var(--steel)]"><CheckCircle2 className="h-4 w-4 text-[var(--confirm)]" /> Empty tables mean the backend returned no records, not fake UI.</p>
          </div>
        </div>
      </div>

      {arraySections.length ? arraySections.map(({ key, rows }) => <LiveTable key={key} title={key} rows={rows} />) : <LiveTable title={title} rows={primaryRows} />}
    </div>
  );
}
