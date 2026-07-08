"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Database, ExternalLink, Loader2, Search, ShieldCheck, TriangleAlert } from "lucide-react";
import { apiClient, normalizeApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";

type BackendRow = Record<string, unknown>;
type BackendPayload = BackendRow | BackendRow[] | { content?: BackendRow[]; data?: BackendRow[]; items?: BackendRow[] };

type FallbackReason = "NO_GET_CONTRACT" | "ROLE_FORBIDDEN" | "NOT_DEPLOYED" | "RATE_LIMITED" | "BACKEND_UNAVAILABLE" | "UNKNOWN";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; payload: BackendPayload; sourcePath: string }
  | { status: "fallback"; message: string; reason: FallbackReason; attemptedPaths: string[] };

function endpointPaths(contract?: string) {
  if (!contract) return [];

  return Array.from(
    new Set(
      contract
        .split(/[·;|\n]+/)
        .filter((part) => /^\s*GET\b/i.test(part))
        .flatMap((part) => part.match(/\/api\/[\w\-/{}?=&%.]+/g) ?? [])
        .filter((path) => !path.includes("{"))
        .map((path) => path.replace(/^\/api/, "") || "/"),
    ),
  );
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
  const priority = ["id", "name", "title", "username", "email", "emailAddress", "contact", "status", "type", "category", "price", "amount", "grossAmount", "feeAmount", "netAmount", "paymentStatus", "paymentReference", "stockQuantity", "barcodeCount", "createdAt", "updatedAt"];
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

function rowMatchesSearch(row: BackendRow, query: string) {
  if (!query.trim()) return true;
  const haystack = Object.values(row)
    .filter((value) => value !== null && value !== undefined && typeof value !== "object")
    .join(" ")
    .toLowerCase();
  return haystack.includes(query.trim().toLowerCase());
}

function rowStatus(row: BackendRow) {
  const value = row.status ?? row.paymentStatus ?? row.state ?? row.type;
  return value === null || value === undefined ? "" : String(value);
}

function filterRows(rows: BackendRow[], query: string, status: string) {
  return rows.filter((row) => rowMatchesSearch(row, query) && (!status || rowStatus(row) === status));
}

function statusOptionsFromRows(rows: BackendRow[]) {
  return Array.from(new Set(rows.map(rowStatus).filter(Boolean))).sort();
}

function fallbackMessage(reason: FallbackReason, title: string, role: string, attemptedPaths: string[], originalMessage?: string) {
  const paths = attemptedPaths.length ? attemptedPaths.join(", ") : "the configured route contract";

  if (reason === "NO_GET_CONTRACT") {
    return `${title} is configured as a write/action workspace for ${role}. No safe GET table contract is available yet, so the UI is using an empty role-safe table instead of a retry error.`;
  }

  if (reason === "ROLE_FORBIDDEN") {
    return `${title} data is not exposed to the ${role} role by the backend security rules. The UI is not retrying a forbidden table; it is showing a safe empty table fallback.`;
  }

  if (reason === "NOT_DEPLOYED") {
    return `${title} has no deployed backend table route at ${paths}. The UI is showing a safe empty table fallback until the JPA endpoint exists.`;
  }

  if (reason === "RATE_LIMITED") {
    return `${title} was rate-limited in production. The UI stopped retrying and kept the table shell stable. Try again after the backend cooldown.`;
  }

  if (reason === "BACKEND_UNAVAILABLE") {
    return `${title} could not reach the production backend. The UI is showing a safe empty table fallback instead of replacing the workspace with a retry error.`;
  }

  return originalMessage ?? `${title} could not load ${paths}. The UI is showing a safe empty table fallback.`;
}

function fallbackReason(status?: number): FallbackReason {
  if (status === 401 || status === 403) return "ROLE_FORBIDDEN";
  if (status === 404 || status === 405) return "NOT_DEPLOYED";
  if (status === 429) return "RATE_LIMITED";
  if (status === 502 || status === 503 || status === 504) return "BACKEND_UNAVAILABLE";
  return "UNKNOWN";
}

function LiveTable({ title, rows, searchQuery, statusFilter }: { title: string; rows: BackendRow[]; searchQuery: string; statusFilter: string }) {
  const filteredRows = filterRows(rows, searchQuery, statusFilter);
  const keys = tableKeys(filteredRows.length ? filteredRows : rows);

  if (!rows.length) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-dashed border-[var(--line)] bg-white p-6 text-sm font-semibold text-[var(--steel)]">
        No live records returned for this workspace yet. This is a safe empty table state, not an AI failure.
      </div>
    );
  }

  if (!filteredRows.length) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-dashed border-[var(--line)] bg-white p-6 text-sm font-semibold text-[var(--steel)]">
        No rows match the current search/filter. Clear filters to see the loaded data again.
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--line)] bg-white shadow-[var(--shadow-soft)]">
      <div className="flex flex-col gap-2 border-b border-[var(--line)] bg-[var(--paper)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.16em] text-[var(--signal)]">Live data</p>
          <h3 className="mt-1 text-lg font-black tracking-[-0.03em] text-[var(--ink)]">{labelFor(title)}</h3>
        </div>
        <span className="rounded-full bg-[var(--confirm)] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-white">{filteredRows.length} rows</span>
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
            {filteredRows.map((row, index) => (
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

export function ContractDataWorkspace({ endpoint, role, title }: { endpoint?: string; role: string; title: string }) {
  const paths = useMemo(() => endpointPaths(endpoint), [endpoint]);
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const load = useCallback(async () => {
    if (!paths.length) {
      setState({
        status: "fallback",
        reason: "NO_GET_CONTRACT",
        attemptedPaths: [],
        message: fallbackMessage("NO_GET_CONTRACT", title, role, []),
      });
      return;
    }

    setState({ status: "loading" });
    let lastStatus: number | undefined;
    let lastMessage: string | undefined;

    for (const path of paths) {
      try {
        const response = await apiClient.get<BackendPayload>(path);
        setState({ status: "ready", payload: response.data, sourcePath: path });
        return;
      } catch (error) {
        const normalized = normalizeApiError(error);
        lastStatus = normalized.status;
        lastMessage = normalized.message;
      }
    }

    const reason = fallbackReason(lastStatus);
    setState({
      status: "fallback",
      reason,
      attemptedPaths: paths,
      message: fallbackMessage(reason, title, role, paths, lastMessage),
    });
  }, [paths, role, title]);

  useEffect(() => {
    void load();
  }, [load]);

  if (state.status === "loading") {
    return (
      <div className="rounded-[var(--radius-xl)] border border-[var(--line)] bg-white p-6 shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-3 text-sm font-black text-[var(--steel)]">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--signal)]" /> Loading dashboard data...
        </div>
      </div>
    );
  }

  if (state.status === "fallback") {
    return (
      <div className="grid gap-5">
        <div className="rounded-[var(--radius-xl)] border border-amber-200 bg-amber-50 p-5 shadow-[var(--shadow-soft)]">
          <div className="flex items-start gap-3">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
            <div>
              <h3 className="font-black text-[var(--ink)]">Table fallback active</h3>
              <p className="mt-2 text-sm leading-6 text-amber-900">{state.message}</p>
              {state.attemptedPaths.length ? <p className="mt-2 font-mono text-xs font-black uppercase tracking-[0.14em] text-amber-800">Tried: {state.attemptedPaths.join(" · ")}</p> : null}
            </div>
          </div>
        </div>
        <LiveTable title={title} rows={[]} searchQuery="" statusFilter="" />
      </div>
    );
  }

  const primaryRows = rowsFromPayload(state.payload);
  const arraySections = nestedArrays(state.payload);
  const allRows = arraySections.length ? arraySections.flatMap(({ rows }) => rows) : primaryRows;
  const statusOptions = statusOptionsFromRows(allRows);

  return (
    <div className="grid gap-5">
      <div className="rounded-[var(--radius-xl)] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)]">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-[var(--radius-md)] bg-[var(--ink)] text-[var(--gold)]">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.16em] text-[var(--confirm)]">Connected workspace</p>
            <h3 className="mt-1 text-xl font-black tracking-[-0.03em] text-[var(--ink)]">{title} is reading live King Sparkon data.</h3>
            <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-[var(--steel)]"><CheckCircle2 className="h-4 w-4 text-[var(--confirm)]" /> Source: {state.sourcePath}. Search and filters run locally against the loaded table data, so AI quota cannot break them.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 rounded-[var(--radius-xl)] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-soft)] md:grid-cols-[1fr_240px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--steel)]" />
          <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder={`Search ${title.toLowerCase()} table`} className="h-11 w-full rounded-full border border-[var(--line)] bg-white pl-11 pr-4 text-sm font-semibold text-[var(--ink)] outline-none focus:border-[var(--signal)]" />
        </label>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-11 rounded-full border border-[var(--line)] bg-white px-4 text-sm font-semibold text-[var(--ink)] outline-none focus:border-[var(--signal)]">
          <option value="">All statuses/types</option>
          {statusOptions.map((status) => <option key={status} value={status}>{labelFor(status)}</option>)}
        </select>
        <div className="md:col-span-2 flex items-center gap-2 text-xs font-bold text-[var(--steel)]">
          <ShieldCheck className="h-4 w-4 text-[var(--confirm)]" /> Table filtering is local fallback logic. It does not call AI and does not retry forbidden production endpoints.
        </div>
      </div>

      {arraySections.length ? arraySections.map(({ key, rows }) => <LiveTable key={key} title={key} rows={rows} searchQuery={searchQuery} statusFilter={statusFilter} />) : <LiveTable title={title} rows={primaryRows} searchQuery={searchQuery} statusFilter={statusFilter} />}
    </div>
  );
}
