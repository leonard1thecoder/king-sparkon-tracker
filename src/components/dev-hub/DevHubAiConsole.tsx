"use client";

import { FormEvent, useMemo, useState } from "react";
import { CheckCircle2, Code2, Loader2, Search, Sparkles, XCircle } from "lucide-react";

type DevHubStatus = "PENDING_REVIEW" | "AI_QUOTED" | "ACCEPTED" | "REJECTED";

type DevHubRequest = {
  id: number;
  clientName: string;
  emailAddress: string;
  phoneNumber: string | null;
  companyName: string | null;
  projectType: string;
  title: string;
  description: string;
  budgetRange: string | null;
  timeline: string | null;
  currency: string;
  estimatedMinPrice: number;
  estimatedMaxPrice: number;
  aiDevelopmentPlan: string;
  aiAutomatedResponse: string;
  decisionReason: string | null;
  status: DevHubStatus;
  createdAt: string;
  updatedAt: string;
};

type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");

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

const emptyForm = {
  clientName: "",
  emailAddress: "",
  phoneNumber: "",
  companyName: "",
  projectType: "",
  title: "",
  description: "",
  budgetRange: "",
  timeline: "",
};

export function DevHubAiConsole() {
  const [form, setForm] = useState(emptyForm);
  const [createdRequest, setCreatedRequest] = useState<DevHubRequest | null>(null);
  const [requests, setRequests] = useState<PageResponse<DevHubRequest> | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [direction, setDirection] = useState("desc");
  const [page, setPage] = useState(0);
  const [authToken, setAuthToken] = useState(tokenFromStorage());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const rows = useMemo(() => requests?.content ?? [], [requests]);

  const authHeaders = () => ({
    Accept: "application/json",
    ...(authToken.trim() ? { Authorization: `Bearer ${authToken.trim()}` } : {}),
  });

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submitRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/dev-hub/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error(`Dev Hub request failed with status ${response.status}`);
      const data = (await response.json()) as DevHubRequest;
      setCreatedRequest(data);
      setForm(emptyForm);
    } catch (error) {
      console.error("Dev Hub AI request failed", error);
      setErrorMessage("Unable to create Dev Hub AI request. Check required fields and backend PR #35 deployment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const searchRequests = async (nextPage = page) => {
    setErrorMessage("");
    setIsSearching(true);

    try {
      const params = new URLSearchParams();
      params.set("page", String(nextPage));
      params.set("size", "10");
      params.set("sortBy", sortBy);
      params.set("direction", direction);
      if (query.trim()) params.set("q", query.trim());
      if (status.trim()) params.set("status", status.trim());

      const response = await fetch(`${apiBaseUrl}/api/dev-hub/requests?${params.toString()}`, {
        headers: authHeaders(),
      });

      if (!response.ok) throw new Error(`Dev Hub search failed with status ${response.status}`);
      const data = (await response.json()) as PageResponse<DevHubRequest>;
      setRequests(data);
      setPage(data.page);
    } catch (error) {
      console.error("Dev Hub request search failed", error);
      setErrorMessage("Unable to search Dev Hub requests. Owner/Admin token is required for review workflow.");
    } finally {
      setIsSearching(false);
    }
  };

  const decide = async (id: number, action: "accept" | "reject") => {
    setErrorMessage("");
    try {
      const response = await fetch(`${apiBaseUrl}/api/dev-hub/requests/${id}/${action}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ reason: action === "accept" ? "Accepted from Full King Sparkon AI Dev Hub console." : "Rejected from Full King Sparkon AI Dev Hub console." }),
      });

      if (!response.ok) throw new Error(`Dev Hub decision failed with status ${response.status}`);
      await searchRequests(page);
    } catch (error) {
      console.error("Dev Hub decision failed", error);
      setErrorMessage("Unable to update Dev Hub request decision. Owner/Admin token is required.");
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-white/70 bg-[var(--ink)] p-6 text-white shadow-[0_34px_120px_rgba(7,19,31,0.24)] sm:p-8">
        <p className="font-mono text-xs font-black uppercase tracking-[0.28em] text-[var(--gold)]">Full King Sparkon AI Dev Hub</p>
        <h1 className="mt-3 max-w-4xl text-3xl font-black tracking-[-0.06em] sm:text-5xl">
          Automated software quotes, development plans, and accept/reject workflow.
        </h1>
        <p className="mt-4 max-w-3xl text-sm font-semibold leading-7 text-white/62 sm:text-base">
          Clients submit development requests and instantly receive an AI-backed price range plus project plan. Owners review, search, sort, page, accept, or reject the request.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <form onSubmit={(event) => void submitRequest(event)} className="rounded-[2rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)]">
          <div className="flex items-center gap-2 text-[var(--signal)]">
            <Code2 className="h-5 w-5" />
            <p className="font-mono text-xs font-black uppercase tracking-[0.22em]">Send request</p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <input required value={form.clientName} onChange={(event) => updateForm("clientName", event.target.value)} placeholder="Client name" className="h-12 rounded-full border border-[var(--line)] px-4 text-sm font-semibold" />
            <input required type="email" value={form.emailAddress} onChange={(event) => updateForm("emailAddress", event.target.value)} placeholder="Email address" className="h-12 rounded-full border border-[var(--line)] px-4 text-sm font-semibold" />
            <input value={form.phoneNumber} onChange={(event) => updateForm("phoneNumber", event.target.value)} placeholder="Phone number" className="h-12 rounded-full border border-[var(--line)] px-4 text-sm font-semibold" />
            <input value={form.companyName} onChange={(event) => updateForm("companyName", event.target.value)} placeholder="Company name" className="h-12 rounded-full border border-[var(--line)] px-4 text-sm font-semibold" />
            <input required value={form.projectType} onChange={(event) => updateForm("projectType", event.target.value)} placeholder="Project type" className="h-12 rounded-full border border-[var(--line)] px-4 text-sm font-semibold" />
            <input required value={form.title} onChange={(event) => updateForm("title", event.target.value)} placeholder="Project title" className="h-12 rounded-full border border-[var(--line)] px-4 text-sm font-semibold" />
            <input value={form.budgetRange} onChange={(event) => updateForm("budgetRange", event.target.value)} placeholder="Budget range" className="h-12 rounded-full border border-[var(--line)] px-4 text-sm font-semibold" />
            <input value={form.timeline} onChange={(event) => updateForm("timeline", event.target.value)} placeholder="Timeline" className="h-12 rounded-full border border-[var(--line)] px-4 text-sm font-semibold" />
          </div>
          <textarea required value={form.description} onChange={(event) => updateForm("description", event.target.value)} placeholder="Describe the development work, integrations, pages, payments, AI, dashboards, barcode, tickets, or mobile needs." className="mt-3 min-h-36 w-full rounded-[1.5rem] border border-[var(--line)] p-4 text-sm font-semibold" />
          <button disabled={isSubmitting} className="mt-4 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--gold)] px-6 text-sm font-black text-[var(--ink)] disabled:opacity-60">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Get AI price and plan
          </button>
        </form>

        <div className="rounded-[2rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)]">
          <p className="font-mono text-xs font-black uppercase tracking-[0.22em] text-[var(--signal)]">Automated response</p>
          {createdRequest ? (
            <div className="mt-4 space-y-4">
              <h2 className="text-2xl font-black tracking-[-0.04em] text-[var(--ink)]">{createdRequest.currency} {createdRequest.estimatedMinPrice} - {createdRequest.estimatedMaxPrice}</h2>
              <p className="text-sm font-bold leading-7 text-[var(--muted)]">{createdRequest.aiAutomatedResponse}</p>
              <div className="rounded-3xl bg-[var(--surface)] p-4 text-sm font-semibold text-[var(--steel)]">{createdRequest.aiDevelopmentPlan}</div>
              <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">{createdRequest.status}</span>
            </div>
          ) : (
            <p className="mt-4 text-sm font-bold leading-7 text-[var(--muted)]">Submit a request to generate an instant price range and development plan.</p>
          )}
        </div>
      </div>

      <div className="rounded-[2rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)]">
        <p className="font-mono text-xs font-black uppercase tracking-[0.22em] text-[var(--signal)]">Owner/Admin review</p>
        <div className="mt-4 grid gap-3 lg:grid-cols-6">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search request" className="h-11 rounded-full border border-[var(--line)] px-4 text-sm font-semibold lg:col-span-2" />
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-11 rounded-full border border-[var(--line)] px-4 text-sm font-semibold">
            <option value="">All statuses</option>
            <option value="AI_QUOTED">AI_QUOTED</option>
            <option value="ACCEPTED">ACCEPTED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="h-11 rounded-full border border-[var(--line)] px-4 text-sm font-semibold">
            <option value="createdAt">Created</option>
            <option value="clientName">Client</option>
            <option value="companyName">Company</option>
            <option value="projectType">Project type</option>
            <option value="estimatedMinPrice">Min price</option>
            <option value="estimatedMaxPrice">Max price</option>
          </select>
          <select value={direction} onChange={(event) => setDirection(event.target.value)} className="h-11 rounded-full border border-[var(--line)] px-4 text-sm font-semibold">
            <option value="desc">DESC</option>
            <option value="asc">ASC</option>
          </select>
          <button onClick={() => void searchRequests(0)} disabled={isSearching} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--ink)] px-5 text-sm font-black text-white disabled:opacity-60">
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Search
          </button>
        </div>
        <input value={authToken} onChange={(event) => setAuthToken(event.target.value)} placeholder="Owner/Admin bearer token" className="mt-3 h-11 w-full rounded-full border border-[var(--line)] px-4 text-sm font-semibold" />

        {errorMessage ? <div className="mt-4 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{errorMessage}</div> : null}

        <div className="mt-5 overflow-auto rounded-[1.5rem] border border-[var(--line)]">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[var(--surface)] text-xs uppercase tracking-[0.14em] text-[var(--steel)]">
              <tr><th className="px-4 py-3">Client</th><th className="px-4 py-3">Project</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.id} className="border-t border-[var(--line)] align-top">
                  <td className="px-4 py-3 font-bold text-[var(--ink)]">{item.clientName}<br /><span className="text-xs text-[var(--muted)]">{item.emailAddress}</span></td>
                  <td className="max-w-[360px] px-4 py-3 font-semibold text-[var(--ink)]">{item.title}<br /><span className="text-xs text-[var(--muted)]">{item.projectType}</span></td>
                  <td className="px-4 py-3 font-black text-[var(--ink)]">{item.currency} {item.estimatedMinPrice} - {item.estimatedMaxPrice}</td>
                  <td className="px-4 py-3 font-black text-[var(--steel)]">{item.status}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => void decide(item.id, "accept")} className="inline-flex h-9 items-center gap-1 rounded-full bg-emerald-50 px-3 text-xs font-black text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" />Accept</button>
                      <button onClick={() => void decide(item.id, "reject")} className="inline-flex h-9 items-center gap-1 rounded-full bg-red-50 px-3 text-xs font-black text-red-700"><XCircle className="h-3.5 w-3.5" />Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {requests ? <div className="mt-4 flex items-center justify-between text-sm font-bold text-[var(--muted)]"><span>Page {requests.page + 1} of {Math.max(requests.totalPages, 1)} · {requests.totalElements} requests</span><div className="flex gap-2"><button disabled={requests.first} onClick={() => void searchRequests(Math.max(page - 1, 0))} className="rounded-full border border-[var(--line)] px-4 py-2 disabled:opacity-50">Prev</button><button disabled={requests.last} onClick={() => void searchRequests(page + 1)} className="rounded-full border border-[var(--line)] px-4 py-2 disabled:opacity-50">Next</button></div></div> : null}
      </div>
    </section>
  );
}
