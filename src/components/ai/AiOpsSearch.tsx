"use client";

import { useMemo, useState } from "react";
import { Bot, Filter, Loader2, Search, Sparkles } from "lucide-react";

type AiOpsSearchResponse = {
  domain: string;
  query: string | null;
  filters: Record<string, string>;
  resultCount: number;
  rows: Record<string, unknown>[];
  aiSummary: string;
};

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");
const domains = ["all", "products", "tips", "tickets"];

function tokenFromStorage() {
  if (typeof window === "undefined") return "";
  return (
    window.localStorage.getItem("king-sparkon-token") ??
    window.localStorage.getItem("accessToken") ??
    window.localStorage.getItem("token") ??
    window.localStorage.getItem("jwt") ??
    ""
  );
}

export function AiOpsSearch() {
  const [domain, setDomain] = useState("all");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [workerId, setWorkerId] = useState("");
  const [businessId, setBusinessId] = useState("");
  const [productId, setProductId] = useState("");
  const [ticketReference, setTicketReference] = useState("");
  const [authToken, setAuthToken] = useState(tokenFromStorage());
  const [result, setResult] = useState<AiOpsSearchResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const columns = useMemo(() => {
    const keys = new Set<string>();
    result?.rows.slice(0, 12).forEach((row) => Object.keys(row).forEach((key) => keys.add(key)));
    return Array.from(keys).slice(0, 10);
  }, [result]);

  const search = async () => {
    setErrorMessage("");
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("domain", domain);
      if (query.trim()) params.set("q", query.trim());
      if (status.trim()) params.set("status", status.trim());
      if (workerId.trim()) params.set("workerId", workerId.trim());
      if (businessId.trim()) params.set("businessId", businessId.trim());
      if (productId.trim()) params.set("productId", productId.trim());
      if (ticketReference.trim()) params.set("ticketReference", ticketReference.trim());
      params.set("limit", "50");

      const response = await fetch(`${apiBaseUrl}/api/v1/ai/ops/search?${params.toString()}`, {
        headers: {
          Accept: "application/json",
          ...(authToken.trim() ? { Authorization: `Bearer ${authToken.trim()}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error(`Search failed with status ${response.status}`);
      }

      setResult((await response.json()) as AiOpsSearchResponse);
    } catch (error) {
      console.error("AI ops search failed", error);
      setErrorMessage("Unable to run AI operations search. Make sure you are logged in and backend PR #35 is deployed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-white/70 bg-[var(--ink)] p-6 text-white shadow-[0_34px_120px_rgba(7,19,31,0.24)] sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-xs font-black uppercase tracking-[0.28em] text-[var(--gold)]">AI Ops Console</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-[-0.06em] sm:text-5xl">
              Search, filter, and explain products, tips, and tickets.
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-white/62 sm:text-base">
              Read-only AI summaries across stored operational data. It never marks tips paid, verifies tickets, changes inventory, or mutates records.
            </p>
          </div>
          <Bot className="h-12 w-12 text-[var(--gold)]" />
        </div>
      </div>

      <div className="rounded-[2rem] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-soft)] sm:p-6">
        <div className="grid gap-3 lg:grid-cols-4">
          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-[var(--steel)]">Domain</span>
            <select value={domain} onChange={(event) => setDomain(event.target.value)} className="h-12 w-full rounded-full border border-[var(--line-strong)] bg-white px-4 text-sm font-black text-[var(--ink)]">
              {domains.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="space-y-2 lg:col-span-2">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-[var(--steel)]">Search</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="barcode, product name, tip status, ticket reference" className="h-12 w-full rounded-full border border-[var(--line-strong)] bg-white px-4 text-sm font-bold text-[var(--ink)] outline-none" />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-[var(--steel)]">Status</span>
            <input value={status} onChange={(event) => setStatus(event.target.value)} placeholder="PAID, UNPAID, ACTIVE" className="h-12 w-full rounded-full border border-[var(--line-strong)] bg-white px-4 text-sm font-bold text-[var(--ink)] outline-none" />
          </label>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-5">
          <input value={businessId} onChange={(event) => setBusinessId(event.target.value)} placeholder="Business ID" className="h-11 rounded-full border border-[var(--line)] px-4 text-sm font-semibold" />
          <input value={workerId} onChange={(event) => setWorkerId(event.target.value)} placeholder="Worker ID" className="h-11 rounded-full border border-[var(--line)] px-4 text-sm font-semibold" />
          <input value={productId} onChange={(event) => setProductId(event.target.value)} placeholder="Product ID" className="h-11 rounded-full border border-[var(--line)] px-4 text-sm font-semibold" />
          <input value={ticketReference} onChange={(event) => setTicketReference(event.target.value)} placeholder="Ticket reference / QR" className="h-11 rounded-full border border-[var(--line)] px-4 text-sm font-semibold" />
          <button onClick={() => void search()} disabled={isLoading} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--gold)] px-5 text-sm font-black text-[var(--ink)] disabled:opacity-60">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Search AI
          </button>
        </div>

        <label className="mt-4 block space-y-2">
          <span className="text-xs font-black uppercase tracking-[0.18em] text-[var(--steel)]">Bearer token fallback</span>
          <input value={authToken} onChange={(event) => setAuthToken(event.target.value)} placeholder="Paste JWT if localStorage has no token" className="h-11 w-full rounded-full border border-[var(--line)] px-4 text-sm font-semibold" />
        </label>
      </div>

      {errorMessage ? <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{errorMessage}</div> : null}

      {result ? (
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[2rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-2 text-[var(--signal)]">
              <Sparkles className="h-5 w-5" />
              <p className="font-mono text-xs font-black uppercase tracking-[0.22em]">AI summary</p>
            </div>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-[var(--ink)]">{result.resultCount} rows found</h2>
            <p className="mt-3 text-sm font-bold leading-7 text-[var(--muted)]">{result.aiSummary}</p>
            <div className="mt-5 rounded-3xl bg-[var(--surface)] p-4 text-xs font-bold text-[var(--steel)]">
              <Filter className="mb-2 h-4 w-4" />
              {Object.entries(result.filters).map(([key, value]) => (
                <div key={key}>{key}: {value}</div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white shadow-[var(--shadow-soft)]">
            <div className="overflow-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[var(--surface)] text-xs uppercase tracking-[0.14em] text-[var(--steel)]">
                  <tr>{columns.map((column) => <th key={column} className="px-4 py-3 font-black">{column}</th>)}</tr>
                </thead>
                <tbody>
                  {result.rows.slice(0, 50).map((row, index) => (
                    <tr key={`${row.table}-${index}`} className="border-t border-[var(--line)]">
                      {columns.map((column) => (
                        <td key={column} className="max-w-[220px] truncate px-4 py-3 font-semibold text-[var(--ink)]">
                          {row[column] == null ? "—" : String(row[column])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
