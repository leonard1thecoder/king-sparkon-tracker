"use client";

import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter,
  LoaderCircle,
  RefreshCcw,
  Search,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import { apiClient, normalizeApiError } from "@/lib/api/client";

const PAGE_SIZES = [10, 20, 50] as const;

type Row = Record<string, unknown>;
type ViewState = "loading" | "ready" | "empty" | "forbidden" | "error";
type EndpointContract = { method: "GET" | "POST"; path: string };
type PageResult = { rows: Row[]; page: number; size: number; totalElements: number; totalPages: number };

type MutationField = {
  name: string;
  label: string;
  type?: "text" | "email" | "number" | "textarea" | "select";
  required?: boolean;
  options?: string[];
};

type MutationConfig = {
  submitLabel: string;
  successMessage: string;
  fields: MutationField[];
};

function parseEndpoint(endpoint: string): EndpointContract {
  const candidate = endpoint.split(/\s+or\s+/i)[0]?.trim() ?? "";
  const match = candidate.match(/^(GET|POST)\s+([^\s]+)$/i);
  if (!match) throw new Error(`Unsupported endpoint contract: ${endpoint}`);
  return { method: match[1].toUpperCase() as EndpointContract["method"], path: match[2] };
}

function mutationConfig(path: string): MutationConfig | null {
  if (path.includes("promotions")) {
    return {
      submitLabel: "Create promotion",
      successMessage: "Promotion created successfully.",
      fields: [
        { name: "title", label: "Promotion title", required: true },
        { name: "message", label: "Campaign message", type: "textarea", required: true },
        { name: "channel", label: "Channel", type: "select", options: ["EMAIL", "WHATSAPP", "ANY"], required: true },
        { name: "audience", label: "Audience", type: "select", options: ["ALL_SUBSCRIBERS", "REGISTERED_AFFILIATES", "UNREGISTERED_AFFILIATES", "REGISTERED_SUBSCRIBERS"], required: true },
      ],
    };
  }
  if (path.includes("/barcodes") && !path.includes("claims")) {
    return {
      submitLabel: "Allocate barcode",
      successMessage: "Barcode allocated successfully.",
      fields: [
        { name: "unitCode", label: "Unit code", required: true },
        { name: "referenceEmail", label: "Reference email", type: "email" },
      ],
    };
  }
  if (path.includes("claims")) {
    return {
      submitLabel: "Submit claim",
      successMessage: "Barcode claim submitted successfully.",
      fields: [{ name: "barcode", label: "Barcode value", required: true }],
    };
  }
  return null;
}

function pageResult(data: unknown, requestedPage: number, requestedSize: number): PageResult {
  if (Array.isArray(data)) {
    return { rows: data as Row[], page: requestedPage, size: requestedSize, totalElements: data.length, totalPages: data.length ? 1 : 0 };
  }
  if (!data || typeof data !== "object") {
    return { rows: [], page: requestedPage, size: requestedSize, totalElements: 0, totalPages: 0 };
  }
  const source = data as Record<string, unknown>;
  const rows = Array.isArray(source.content)
    ? (source.content as Row[])
    : Array.isArray(source.items)
      ? (source.items as Row[])
      : [source as Row];
  return {
    rows,
    page: typeof source.page === "number" ? source.page : requestedPage,
    size: typeof source.size === "number" ? source.size : requestedSize,
    totalElements: typeof source.totalElements === "number" ? source.totalElements : rows.length,
    totalPages: typeof source.totalPages === "number" ? source.totalPages : rows.length ? 1 : 0,
  };
}

function valueText(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function DataState({ icon: Icon, title, message, action }: { icon: LucideIcon; title: string; message: string; action?: () => void }) {
  return (
    <section className="grid min-h-64 place-items-center rounded-xl border border-[var(--line)] bg-white p-8 text-center">
      <div className="max-w-lg">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-[var(--line)] bg-[var(--gold)]/25 text-[var(--ink)]"><Icon className="h-5 w-5" /></span>
        <h3 className="mt-4 text-lg font-black text-[var(--ink)]">{title}</h3>
        <p className="mt-2 text-sm font-semibold leading-6 text-[var(--muted)]">{message}</p>
        {action ? <button type="button" onClick={action} className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--signal)] bg-[var(--signal)] px-4 text-sm font-black text-white hover:border-[var(--accent-hover)] hover:bg-[var(--accent-hover)]"><RefreshCcw className="h-4 w-4" />Retry</button> : null}
      </div>
    </section>
  );
}

function MutationWorkspace({ contract, title }: { contract: EndpointContract; title: string }) {
  const config = mutationConfig(contract.path);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!config) {
    return <DataState icon={AlertTriangle} title={`${title} is not configured`} message="This operation requires a domain-specific request form before it can be safely exposed." />;
  }
  const mutation = config;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    setError(null);
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(mutation.fields.map((field) => {
      const raw = String(form.get(field.name) ?? "").trim();
      return [field.name, field.type === "number" && raw ? Number(raw) : raw || undefined];
    }));
    try {
      await apiClient.request({ method: contract.method, url: contract.path.replace(/^\/api/, ""), data: payload });
      event.currentTarget.reset();
      setMessage(mutation.successMessage);
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-xl border border-[var(--line)] bg-white p-5 shadow-sm" aria-label={`${title} form`}>
      <div className="grid gap-4 md:grid-cols-2">
        {mutation.fields.map((field) => (
          <label key={field.name} className={field.type === "textarea" ? "grid gap-2 md:col-span-2" : "grid gap-2"}>
            <span className="text-xs font-black uppercase tracking-[0.14em] text-[var(--muted)]">{field.label}</span>
            {field.type === "textarea" ? (
              <textarea name={field.name} required={field.required} rows={5} className="rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--signal)]" />
            ) : field.type === "select" ? (
              <select name={field.name} required={field.required} className="min-h-11 rounded-xl border border-[var(--line)] bg-white px-3 text-sm outline-none focus:border-[var(--signal)]">
                {field.options?.map((option) => <option key={option} value={option}>{option.replaceAll("_", " ")}</option>)}
              </select>
            ) : (
              <input name={field.name} type={field.type ?? "text"} required={field.required} className="min-h-11 rounded-xl border border-[var(--line)] bg-white px-3 text-sm outline-none focus:border-[var(--signal)]" />
            )}
          </label>
        ))}
      </div>
      {message ? <p role="status" className="rounded-xl border border-[var(--line-strong)] bg-[var(--signal-soft)] px-3 py-2 text-sm font-bold text-[var(--signal-strong)]">{message}</p> : null}
      {error ? <p role="alert" className="rounded-xl border border-red-600/20 bg-red-50 px-3 py-2 text-sm font-bold text-red-800">{error}</p> : null}
      <button disabled={busy} className="inline-flex min-h-11 w-fit items-center gap-2 rounded-xl border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white hover:border-[var(--accent-hover)] hover:bg-[var(--accent-hover)] disabled:opacity-50">
        {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}{mutation.submitLabel}
      </button>
    </form>
  );
}

export function DomainDataWorkspace({ endpoint, title }: { endpoint: string; title: string }) {
  const contract = useMemo(() => parseEndpoint(endpoint), [endpoint]);
  const [state, setState] = useState<ViewState>("loading");
  const [result, setResult] = useState<PageResult>({ rows: [], page: 0, size: 20, totalElements: 0, totalPages: 0 });
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState<number>(20);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const load = useCallback(async () => {
    if (contract.method !== "GET") return;
    setState("loading");
    setError("");
    try {
      const response = await apiClient.get(contract.path.replace(/^\/api/, ""), { params: { page, size, search: search || undefined, status: status || undefined } });
      const next = pageResult(response.data, page, size);
      setResult(next);
      setState(next.rows.length ? "ready" : "empty");
    } catch (exception) {
      const normalized = normalizeApiError(exception);
      if (normalized.status === 401 || normalized.status === 403) setState("forbidden");
      else { setError(normalized.message); setState("error"); }
    }
  }, [contract, page, search, size, status]);

  useEffect(() => { void load(); }, [load]);

  if (contract.method === "POST") return <MutationWorkspace contract={contract} title={title} />;
  if (state === "loading") return <DataState icon={LoaderCircle} title={`Loading ${title}`} message="Retrieving live server data and access policy." />;
  if (state === "forbidden") return <DataState icon={ShieldAlert} title="Access denied" message="Your authenticated role or business tenant cannot access this data." />;
  if (state === "error") return <DataState icon={AlertTriangle} title={`Could not load ${title}`} message={error} action={() => void load()} />;
  if (state === "empty") return <DataState icon={Search} title={`No ${title.toLowerCase()} found`} message="No records match the current server-side filters." />;

  const columns = Array.from(new Set(result.rows.flatMap((row) => Object.keys(row)))).slice(0, 8);
  return (
    <section className="grid gap-4" aria-label={`${title} data`}>
      <div className="grid gap-3 rounded-xl border border-[var(--line)] bg-white p-4 md:grid-cols-[1fr_12rem_auto]">
        <label className="relative"><span className="sr-only">Search {title}</span><Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-[var(--muted)]" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} placeholder={`Search ${title.toLowerCase()}`} className="min-h-11 w-full rounded-xl border border-[var(--line)] bg-white pl-10 pr-3 text-sm outline-none focus:border-[var(--signal)]" /></label>
        <label className="relative"><span className="sr-only">Filter by status</span><Filter className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-[var(--muted)]" /><input value={status} onChange={(event) => { setStatus(event.target.value); setPage(0); }} placeholder="Status filter" className="min-h-11 w-full rounded-xl border border-[var(--line)] bg-white pl-10 pr-3 text-sm outline-none focus:border-[var(--signal)]" /></label>
        <button type="button" onClick={() => void load()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-white px-4 text-sm font-black"><RefreshCcw className="h-4 w-4" />Refresh</button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-[var(--line)] bg-white">
        <table className="min-w-full text-left text-sm"><thead className="bg-[var(--gold)]/25"><tr>{columns.map((column) => <th key={column} scope="col" className="whitespace-nowrap px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-[var(--ink)]">{column.replaceAll(/([A-Z])/g, " $1")}</th>)}</tr></thead><tbody>{result.rows.map((row, index) => <tr key={String(row.id ?? index)} className="border-t border-[var(--line)]">{columns.map((column) => <td key={column} className="max-w-72 truncate px-4 py-3 font-semibold text-[var(--ink)]/75" title={valueText(row[column])}>{valueText(row[column])}</td>)}</tr>)}</tbody></table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm font-bold text-[var(--muted)]">
        <span>{result.totalElements} records · Page {result.page + 1} of {Math.max(result.totalPages, 1)}</span>
        <div className="flex items-center gap-2"><label><span className="sr-only">Rows per page</span><select value={size} onChange={(event) => { setSize(Number(event.target.value)); setPage(0); }} className="min-h-10 rounded-lg border border-[var(--line)] bg-white px-2">{PAGE_SIZES.map((value) => <option key={value} value={value}>{value} rows</option>)}</select></label><button type="button" disabled={page === 0} onClick={() => setPage((value) => Math.max(0, value - 1))} aria-label="Previous page" className="grid h-10 w-10 place-items-center rounded-lg border border-[var(--line)] bg-white disabled:opacity-35"><ChevronLeft className="h-4 w-4" /></button><button type="button" disabled={result.totalPages === 0 || page + 1 >= result.totalPages} onClick={() => setPage((value) => value + 1)} aria-label="Next page" className="grid h-10 w-10 place-items-center rounded-lg border border-[var(--line)] bg-white disabled:opacity-35"><ChevronRight className="h-4 w-4" /></button></div>
      </div>
    </section>
  );
}
