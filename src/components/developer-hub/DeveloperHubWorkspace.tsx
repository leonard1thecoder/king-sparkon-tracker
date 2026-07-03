"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowRight, BadgeCheck, CloudCog, Code2, GitBranch, Loader2, PlayCircle, RefreshCw, ShieldCheck, Sparkles, TriangleAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatusPill } from "@/components/ui/StatusPill";
import {
  DEVELOPER_HUB_BACKEND_CONTRACT,
  SOFTWARE_DEVELOPMENT_STAGE_FLOW,
  SOFTWARE_DEVELOPMENT_STAGE_LABELS,
  SOFTWARE_DEVELOPMENT_STATUS_LABELS,
  developerHubPreviewRequests,
  nextSoftwareDevelopmentStage,
  statusForStage,
  type DeveloperHubScope,
  type SoftwareDevelopmentRequest,
  type SoftwareDevelopmentRequestPayload,
  type SoftwareDevelopmentStage,
} from "@/lib/developer-hub";

const inputClasses = "min-h-12 rounded-[var(--radius-lg)] border border-[var(--line)] bg-white px-4 text-[var(--ink)] shadow-[var(--shadow-soft)] outline-none placeholder:text-[var(--muted)] hover:border-[var(--gold)] focus:border-[var(--gold)] focus:ring-4 focus:ring-[rgba(255,217,102,0.18)]";
const checkboxClasses = "mt-1 h-5 w-5 rounded border-[var(--line)] accent-[var(--gold)]";

type WorkspaceMessage = {
  tone: "success" | "warning" | "error";
  text: string;
};

type ApiCollectionResponse = {
  content?: SoftwareDevelopmentRequest[];
  requests?: SoftwareDevelopmentRequest[];
  data?: SoftwareDevelopmentRequest[];
};

function messageClasses(tone: WorkspaceMessage["tone"]) {
  if (tone === "success") return "border-[var(--confirm)]/40 bg-[rgba(50,213,131,0.10)] text-[var(--confirm)]";
  if (tone === "warning") return "border-[var(--gold)]/50 bg-[rgba(255,217,102,0.12)] text-[var(--ink)]";
  return "border-[var(--warning)]/45 bg-[rgba(245,158,11,0.10)] text-[var(--warning)]";
}

function normalizeRequests(response: unknown) {
  if (Array.isArray(response)) return response as SoftwareDevelopmentRequest[];
  if (response && typeof response === "object") {
    const body = response as ApiCollectionResponse;
    if (Array.isArray(body.content)) return body.content;
    if (Array.isArray(body.requests)) return body.requests;
    if (Array.isArray(body.data)) return body.data;
  }
  return [];
}

function formatDate(value?: string | null) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-ZA", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function stageProgress(stage: SoftwareDevelopmentStage) {
  const index = SOFTWARE_DEVELOPMENT_STAGE_FLOW.indexOf(stage);
  return Math.round(((index + 1) / SOFTWARE_DEVELOPMENT_STAGE_FLOW.length) * 100);
}

function fieldValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function previewRequestsForScope(scope: DeveloperHubScope) {
  if (scope === "admin") return developerHubPreviewRequests;
  return developerHubPreviewRequests.slice(0, 1);
}

export function DeveloperHubWorkspace({ scope }: { scope: DeveloperHubScope }) {
  const [requests, setRequests] = useState<SoftwareDevelopmentRequest[]>(() => previewRequestsForScope(scope));
  const [message, setMessage] = useState<WorkspaceMessage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeRequestId, setActiveRequestId] = useState<string | number | null>(null);

  const metrics = useMemo(() => {
    const qaCount = requests.filter((request) => request.requiresQualityAssuranceRegression).length;
    const cloudCount = requests.filter((request) => request.requiresCloudMaintenance).length;
    const activeCount = requests.filter((request) => request.status !== "COMPLETED").length;
    const startedCount = requests.filter((request) => request.stage !== "REQUESTED").length;

    return { qaCount, cloudCount, activeCount, startedCount };
  }, [requests]);

  async function loadRequests({ quiet = false } = {}) {
    if (!quiet) setIsLoading(true);

    try {
      const response = await fetch(`/api/developer-hub/software-requests?scope=${scope}`, { cache: "no-store" });
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        setRequests(previewRequestsForScope(scope));
        setMessage({ tone: "warning", text: "Backend Developer Hub endpoints are not live yet. Showing preview rows while the frontend contract is ready." });
        return;
      }

      const nextRequests = normalizeRequests(body);
      setRequests(nextRequests.length ? nextRequests : previewRequestsForScope(scope));
      setMessage(nextRequests.length ? null : { tone: "warning", text: "No backend records returned yet. Showing preview rows so the table layout remains testable." });
    } catch {
      setRequests(previewRequestsForScope(scope));
      setMessage({ tone: "warning", text: "Backend Developer Hub API is unavailable. Showing preview rows and preserving the request workflow UI." });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadRequests();
  }, [scope]);

  async function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload: SoftwareDevelopmentRequestPayload = {
      softwareName: fieldValue(formData, "softwareName"),
      softwareDescription: fieldValue(formData, "softwareDescription"),
      requiresCloudMaintenance: formData.get("requiresCloudMaintenance") === "on",
      requiresQualityAssuranceRegression: formData.get("requiresQualityAssuranceRegression") === "on",
    };

    if (!payload.softwareName || payload.softwareName.length < 3) {
      setMessage({ tone: "error", text: "Add a software name with at least 3 characters." });
      setIsSubmitting(false);
      return;
    }

    if (!payload.softwareDescription || payload.softwareDescription.length < 30) {
      setMessage({ tone: "error", text: "Describe how the software will work. Minimum 30 characters so Dev Hub can quote properly." });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/developer-hub/software-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage({ tone: "error", text: typeof body.message === "string" ? body.message : "Backend rejected the software development request." });
        return;
      }

      const created = (body.request ?? body.data ?? body) as SoftwareDevelopmentRequest;
      setRequests((current) => [{ ...payload, ...created, id: created.id ?? `LOCAL-${Date.now()}`, stage: created.stage ?? "REQUESTED", status: created.status ?? "REQUESTED" }, ...current]);
      setMessage({ tone: "success", text: "Software development request submitted to King Sparkon Dev Hub." });
      form.reset();
    } catch {
      setMessage({ tone: "error", text: "Could not reach the Developer Hub API. Backend must implement the defined contract before live submission works." });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function changeStage(request: SoftwareDevelopmentRequest, stage: SoftwareDevelopmentStage) {
    setActiveRequestId(request.id);
    setMessage(null);

    try {
      const response = await fetch(`/api/developer-hub/software-requests/${request.id}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage, status: statusForStage(stage), adminNote: `Moved to ${SOFTWARE_DEVELOPMENT_STAGE_LABELS[stage]} from Admin Developer Hub.` }),
      });
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage({ tone: "error", text: typeof body.message === "string" ? body.message : "Backend rejected the stage update." });
        return;
      }

      const updated = (body.request ?? body.data ?? body) as SoftwareDevelopmentRequest;
      setRequests((current) => current.map((item) => (item.id === request.id ? { ...item, ...updated, stage, status: updated.status ?? statusForStage(stage), updatedAt: updated.updatedAt ?? new Date().toISOString() } : item)));
      setMessage({ tone: "success", text: `${request.softwareName} moved to ${SOFTWARE_DEVELOPMENT_STAGE_LABELS[stage]}.` });
    } catch {
      setMessage({ tone: "error", text: "Could not reach the admin stage API. Backend must wire the PATCH contract." });
    } finally {
      setActiveRequestId(null);
    }
  }

  return (
    <main className="grid gap-7 bg-[var(--surface)] p-5 md:p-8">
      <section className="grid gap-6 rounded-[2.5rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-ledger)] md:p-7 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] bg-[var(--ink)] p-6 text-white shadow-[var(--shadow-depth)] enterprise-grid md:p-8">
          <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[var(--gold)]">King Sparkon Dev Hub</p>
          <h1 className="mt-4 max-w-3xl text-3xl font-black tracking-[-0.05em] md:text-5xl">
            {scope === "admin" ? "Admin delivery cockpit for software development requests." : "Request software development from King-Sparkon-Strengths."}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/68 md:text-base">
            {scope === "admin"
              ? "Admin can view requested software, start discovery, move work through CI/CD, QA regression, cloud maintenance, UAT, and lifetime support stages."
              : "Business owners provide the software name, describe how the software must work, and request cloud maintenance or Quality Assurance regression support before a free quote."}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {["Software development", "CI/CD delivery", "QA + Cloud support"].map((item) => (
              <div key={item} className="rounded-[1.35rem] border border-white/10 bg-white/[0.06] p-4 text-sm font-black text-white/78 backdrop-blur">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <MetricCard label="Requested builds" value={String(requests.length).padStart(2, "0")} detail="Software development requests in view" tone="signal" icon={<Code2 className="h-5 w-5" />} />
          <MetricCard label="Active delivery" value={String(metrics.activeCount).padStart(2, "0")} detail="Not completed yet" tone="confirm" icon={<PlayCircle className="h-5 w-5" />} />
          <MetricCard label="QA regression" value={String(metrics.qaCount).padStart(2, "0")} detail="Owners requested regression coverage" icon={<ShieldCheck className="h-5 w-5" />} />
          <MetricCard label="Cloud maintenance" value={String(metrics.cloudCount).padStart(2, "0")} detail="Owners requested cloud support" icon={<CloudCog className="h-5 w-5" />} />
        </div>
      </section>

      {message ? (
        <div className={`flex items-start gap-3 rounded-[var(--radius-xl)] border px-5 py-4 text-sm font-bold leading-6 shadow-[var(--shadow-soft)] ${messageClasses(message.tone)}`} role={message.tone === "error" ? "alert" : "status"}>
          {message.tone === "success" ? <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0" /> : <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      ) : null}

      {scope === "owner" ? (
        <section className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Request software development</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4" onSubmit={submitRequest}>
                <label className="grid gap-2 text-sm font-black text-[var(--ink)]">
                  Name of software
                  <input name="softwareName" className={inputClasses} placeholder="Example: Worker QR tip payout portal" />
                </label>
                <label className="grid gap-2 text-sm font-black text-[var(--ink)]">
                  Software description — how will it work?
                  <textarea name="softwareDescription" className={`${inputClasses} min-h-36 py-3 leading-7`} placeholder="Explain users, dashboards, payments, reports, QR/barcode flows, admin controls, integrations, and what must happen after launch." />
                </label>
                <label className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] p-4 text-sm font-bold leading-6 text-[var(--steel)]">
                  <input name="requiresCloudMaintenance" type="checkbox" className={checkboxClasses} />
                  <span><span className="block text-[var(--ink)]">Require cloud maintenance</span> Hosting support, monitoring, release support, uptime discipline, and maintenance planning.</span>
                </label>
                <label className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] p-4 text-sm font-bold leading-6 text-[var(--steel)]">
                  <input name="requiresQualityAssuranceRegression" type="checkbox" className={checkboxClasses} />
                  <span><span className="block text-[var(--ink)]">Require Quality Assurance regression</span> Positive/negative tests, regression flow, release confidence, and bug prevention.</span>
                </label>
                <button type="submit" disabled={isSubmitting} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-[var(--gold)] bg-[var(--gold)] px-6 font-black text-[var(--ink)] shadow-[var(--shadow-soft)] hover:bg-white disabled:cursor-not-allowed disabled:opacity-70">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                  {isSubmitting ? "Submitting..." : "Request free quote"}
                </button>
              </form>
            </CardContent>
          </Card>

          <BackendContractCard />
        </section>
      ) : (
        <BackendContractCard />
      )}

      <section className="grid gap-4">
        <SectionHeader
          eyebrow={scope === "admin" ? "Admin process table" : "Owner request table"}
          title="Requested software development and delivery stages."
          description="The table shows every requested build with current stage, required QA/cloud support, and the next movement through King Sparkon Dev Hub."
        />
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Software development requests</CardTitle>
            <button type="button" onClick={() => void loadRequests()} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 text-xs font-black text-[var(--ink)] shadow-[var(--shadow-soft)] hover:border-[var(--gold)]">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-[1050px] w-full text-left text-sm">
                <thead className="border-b border-[var(--line)] bg-[var(--surface)] text-xs uppercase tracking-[0.12em] text-[var(--steel)]">
                  <tr>
                    <th className="px-5 py-4 font-black">Software</th>
                    <th className="px-5 py-4 font-black">Owner / business</th>
                    <th className="px-5 py-4 font-black">Support</th>
                    <th className="px-5 py-4 font-black">Stage</th>
                    <th className="px-5 py-4 font-black">Progress</th>
                    <th className="px-5 py-4 font-black">Updated</th>
                    {scope === "admin" ? <th className="px-5 py-4 font-black">Admin action</th> : null}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {requests.map((request) => {
                    const nextStage = nextSoftwareDevelopmentStage(request.stage);
                    const progress = stageProgress(request.stage);
                    return (
                      <tr key={request.id} className="bg-white align-top hover:bg-[var(--surface)]/70">
                        <td className="px-5 py-5">
                          <p className="font-black tracking-[-0.02em] text-[var(--ink)]">{request.softwareName}</p>
                          <p className="mt-2 max-w-md text-sm leading-6 text-[var(--steel)]">{request.softwareDescription}</p>
                          <p className="mt-3 font-mono text-[0.68rem] font-black uppercase tracking-[0.14em] text-[var(--muted)]">#{request.id}</p>
                        </td>
                        <td className="px-5 py-5">
                          <p className="font-black text-[var(--ink)]">{request.businessName ?? "Business owner"}</p>
                          <p className="mt-1 text-xs font-semibold text-[var(--steel)]">{request.ownerName ?? "Owner"}</p>
                          <p className="mt-1 text-xs font-semibold text-[var(--muted)]">{request.ownerEmail ?? "Email from backend JWT"}</p>
                        </td>
                        <td className="px-5 py-5">
                          <div className="flex flex-wrap gap-2">
                            {request.requiresCloudMaintenance ? <StatusPill label="Cloud maintenance" tone="signal" /> : <StatusPill label="No cloud add-on" />}
                            {request.requiresQualityAssuranceRegression ? <StatusPill label="QA regression" tone="confirm" /> : <StatusPill label="QA optional" />}
                          </div>
                        </td>
                        <td className="px-5 py-5">
                          <StatusPill label={SOFTWARE_DEVELOPMENT_STATUS_LABELS[request.status] ?? request.status} tone={request.status === "COMPLETED" ? "confirm" : request.status === "ON_HOLD" ? "warning" : "signal"} />
                          <p className="mt-3 font-black text-[var(--ink)]">{SOFTWARE_DEVELOPMENT_STAGE_LABELS[request.stage]}</p>
                          {request.adminNote ? <p className="mt-2 max-w-xs text-xs leading-5 text-[var(--steel)]">{request.adminNote}</p> : null}
                        </td>
                        <td className="px-5 py-5">
                          <div className="h-2.5 w-44 overflow-hidden rounded-full bg-[var(--line)]">
                            <div className="h-full rounded-full bg-[var(--gold)]" style={{ width: `${progress}%` }} />
                          </div>
                          <p className="mt-2 font-mono text-xs font-black text-[var(--signal)]">{progress}%</p>
                        </td>
                        <td className="px-5 py-5 text-xs font-semibold leading-5 text-[var(--steel)]">
                          <p>Requested: {formatDate(request.requestedAt)}</p>
                          <p className="mt-1">Updated: {formatDate(request.updatedAt)}</p>
                        </td>
                        {scope === "admin" ? (
                          <td className="px-5 py-5">
                            <div className="grid gap-2">
                              {request.stage === "REQUESTED" ? (
                                <button type="button" disabled={activeRequestId === request.id} onClick={() => void changeStage(request, "DISCOVERY")} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--gold)] bg-[var(--gold)] px-4 text-xs font-black text-[var(--ink)] shadow-[var(--shadow-soft)] hover:bg-white disabled:opacity-70">
                                  {activeRequestId === request.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
                                  Start process
                                </button>
                              ) : (
                                <button type="button" disabled={activeRequestId === request.id || nextStage === request.stage} onClick={() => void changeStage(request, nextStage)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 text-xs font-black text-[var(--ink)] shadow-[var(--shadow-soft)] hover:border-[var(--gold)] disabled:opacity-70">
                                  {activeRequestId === request.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                                  Move to {SOFTWARE_DEVELOPMENT_STAGE_LABELS[nextStage]}
                                </button>
                              )}
                            </div>
                          </td>
                        ) : null}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function BackendContractCard() {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>How backend uses this frontend</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            [Code2, "Owner creates request", "Backend derives owner and business from JWT."],
            [GitBranch, "Admin starts process", "Admin moves stages through delivery pipeline."],
            [Sparkles, "Dev Hub delivers", "CI/CD, QA regression, cloud maintenance, UAT, support."],
          ].map(([Icon, title, copy]) => (
            <div key={String(title)} className="rounded-[1.35rem] border border-[var(--line)] bg-[var(--surface)] p-4">
              <Icon className="h-5 w-5 text-[var(--signal)]" />
              <p className="mt-4 font-black text-[var(--ink)]">{String(title)}</p>
              <p className="mt-2 text-xs leading-5 text-[var(--steel)]">{String(copy)}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-2 rounded-[1.35rem] border border-[var(--line)] bg-[var(--surface)] p-4">
          {DEVELOPER_HUB_BACKEND_CONTRACT.map((line) => (
            <p key={line} className="text-xs font-semibold leading-5 text-[var(--steel)]">• {line}</p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
