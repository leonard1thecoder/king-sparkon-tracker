"use client";

import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  RefreshCw,
  Trash2,
  Upload,
  Users2,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";
import { TableWrap } from "@/components/ui/Table";
import { apiClient, normalizeApiError } from "@/lib/api/client";
import type {
  SubscriberImportError,
  SubscriberImportResponse,
} from "@/lib/types/backend";

// ─── Constants ───────────────────────────────────────────────────────────────

/** Matches the backend default: app.subscriber-import.max-file-size-bytes = 5 MB */
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_PREVIEW_ROWS = 8;
const ACCEPTED_MIME = "text/csv,application/vnd.ms-excel,.csv";

// ─── Utilities ────────────────────────────────────────────────────────────────

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function parseCsvPreview(text: string): { headers: string[]; rows: string[][]; totalDataLines: number } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return { headers: [], rows: [], totalDataLines: 0 };
  const splitLine = (line: string) =>
    line.split(",").map((cell) => cell.trim().replace(/^"|"$/g, "").trim());
  const headers = splitLine(lines[0]);
  const dataLines = lines.slice(1);
  const rows = dataLines.slice(0, MAX_PREVIEW_ROWS).map(splitLine);
  return { headers, rows, totalDataLines: dataLines.length };
}

function hasContactColumn(headers: string[]) {
  return headers.some(
    (h) =>
      h
        .toLowerCase()
        .replace(/[\s_\-]+/g, "")
        .replace(/\uFEFF/g, "") === "contact"
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InlineAlert({
  tone,
  children,
}: {
  tone: "error" | "success" | "warning" | "info";
  children: React.ReactNode;
}) {
  const styles: Record<typeof tone, string> = {
    error: "border-red-200 bg-red-50 text-red-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    info: "border-[var(--line)] bg-[var(--signal-soft)] text-[var(--ink)]",
  };
  const icons: Record<typeof tone, React.ReactNode> = {
    error: <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />,
    success: <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />,
    warning: <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />,
    info: <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />,
  };
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      aria-live="polite"
      className={`flex gap-3 rounded-xl border px-4 py-3 text-sm font-semibold leading-6 ${styles[tone]}`}
    >
      {icons[tone]}
      <span>{children}</span>
    </div>
  );
}

function ResultCountCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "signal" | "confirm" | "warning" | "danger" | "neutral";
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-soft)]">
      <p className="text-2xl font-black tracking-[-0.04em] text-[var(--ink)]">
        {value.toLocaleString()}
      </p>
      <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[var(--steel)]">
        {label}
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type Phase = "idle" | "previewing" | "importing" | "done" | "error";

export function BulkSubscriberImport() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<{
    headers: string[];
    rows: string[][];
    totalDataLines: number;
  } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Phase & results
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<SubscriberImportResponse | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // ─── File handling ──────────────────────────────────────────────────────────

  const validateAndSetFile = useCallback((candidate: File | null | undefined) => {
    setFileError(null);
    setCsvPreview(null);
    setResult(null);
    setImportError(null);

    if (!candidate) {
      setFile(null);
      setPhase("idle");
      return;
    }

    if (!candidate.name.toLowerCase().endsWith(".csv")) {
      setFileError("Only .csv files are supported.");
      setFile(null);
      setPhase("idle");
      return;
    }

    if (candidate.size === 0) {
      setFileError("The selected file is empty.");
      setFile(null);
      setPhase("idle");
      return;
    }

    if (candidate.size > MAX_FILE_SIZE_BYTES) {
      setFileError(
        `File exceeds the 5 MB maximum allowed size. Selected file is ${formatBytes(candidate.size)}.`
      );
      setFile(null);
      setPhase("idle");
      return;
    }

    // Parse a preview client-side (no upload yet)
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) ?? "";
      const preview = parseCsvPreview(text);
      setCsvPreview(preview);
      setFile(candidate);
      setPhase("previewing");
    };
    reader.onerror = () => {
      setFileError("Unable to read the file. Please try again.");
      setFile(null);
      setPhase("idle");
    };
    reader.readAsText(candidate, "utf-8");
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndSetFile(e.target.files?.[0]);
    e.target.value = ""; // Allow re-selection of the same file
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    validateAndSetFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const removeFile = () => {
    setFile(null);
    setCsvPreview(null);
    setFileError(null);
    setResult(null);
    setImportError(null);
    setPhase("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ─── Import ─────────────────────────────────────────────────────────────────

  const handleImport = async () => {
    if (!file || phase === "importing") return;

    setPhase("importing");
    setImportError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Uses the authenticated apiClient (baseURL: /api/backend, withCredentials: true)
      // → proxied to POST /api/admin/subscribers/import on the Spring Boot backend
      const response = await apiClient.post<SubscriberImportResponse>(
        "/admin/subscribers/import",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setResult(response.data);
      setPhase("done");
    } catch (err) {
      const normalized = normalizeApiError(err);
      setImportError(
        normalized.message ?? "An unexpected error occurred during import."
      );
      setPhase("error");
    }
  };

  const handleReset = () => {
    setFile(null);
    setCsvPreview(null);
    setFileError(null);
    setResult(null);
    setImportError(null);
    setPhase("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ─── Derived state ──────────────────────────────────────────────────────────

  const canImport = phase === "previewing" && file !== null;
  const isImporting = phase === "importing";
  const missingContactColumn =
    csvPreview !== null && csvPreview.headers.length > 0 && !hasContactColumn(csvPreview.headers);

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="grid gap-6">

      {/* ── Result view ──────────────────────────────────────────────────────── */}
      {phase === "done" && result ? (
        <section aria-label="Import result">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle>Import complete</CardTitle>
              <StatusPill label="Done" tone="confirm" />
            </CardHeader>
            <CardContent className="grid gap-5">
              <InlineAlert tone="success">
                <strong>{result.filename}</strong> processed —{" "}
                {result.processedRows.toLocaleString()} of {result.totalRows.toLocaleString()} rows
                imported successfully.
              </InlineAlert>

              {/* Result metrics */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <ResultCountCard label="Total rows" value={result.totalRows} tone="neutral" />
                <ResultCountCard label="Processed" value={result.processedRows} tone="signal" />
                <ResultCountCard label="Created" value={result.created} tone="confirm" />
                <ResultCountCard label="Reactivated" value={result.reactivated} tone="signal" />
                <ResultCountCard label="Duplicates" value={result.duplicates} tone="warning" />
                <ResultCountCard
                  label="Failed"
                  value={result.failed}
                  tone={result.failed > 0 ? "danger" : "neutral"}
                />
              </div>

              {/* Failed rows error table */}
              {result.errors.length > 0 && (
                <div className="grid gap-3">
                  <p className="text-sm font-extrabold text-[var(--ink)]">
                    Failed rows ({result.errors.length})
                  </p>
                  <TableWrap>
                    <table className="table-ledger text-sm" aria-label="Failed import rows">
                      <thead>
                        <tr className="border-b border-[var(--line)] bg-[var(--surface)]">
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-extrabold uppercase tracking-[0.07em] text-[var(--steel)]"
                          >
                            Row
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-extrabold uppercase tracking-[0.07em] text-[var(--steel)]"
                          >
                            Contact
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-extrabold uppercase tracking-[0.07em] text-[var(--steel)]"
                          >
                            Reason
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.errors.map((error: SubscriberImportError) => (
                          <tr
                            key={`${error.row}-${error.contact}`}
                            className="border-b border-[var(--line)] last:border-b-0"
                          >
                            <td className="px-4 py-3 font-mono text-xs text-[var(--steel)]">
                              {error.row}
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-[var(--ink)]">
                              {error.contact || "—"}
                            </td>
                            <td className="px-4 py-3 text-sm text-[var(--steel)]">
                              {error.message}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </TableWrap>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" onClick={handleReset} className="gap-2">
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Import another file
                </Button>
                <Link
                  href="/dashboard/admin/subscribers"
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[var(--line)] bg-white px-4 py-2 text-sm font-extrabold text-[var(--ink)] shadow-[var(--shadow-soft)] transition duration-200 hover:-translate-y-0.5 hover:border-[var(--signal)] hover:bg-[var(--signal-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)] focus-visible:ring-offset-2"
                >
                  <Users2 className="h-4 w-4" aria-hidden="true" />
                  View Subscribers
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      ) : (
        <>
          {/* ── Two-column layout: upload + column reference ──────────────────── */}
          <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">

            {/* ── CSV Upload Card ───────────────────────────────────────────── */}
            <Card>
              <CardHeader>
                <CardTitle>CSV file</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">

                {/* Drop zone (no file selected) */}
                {!file ? (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`relative flex min-h-52 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
                      isDragOver
                        ? "border-[var(--signal)] bg-[var(--signal-soft)]"
                        : "border-[var(--line)] bg-[var(--surface)] hover:border-[var(--signal)] hover:bg-[var(--signal-soft)]"
                    }`}
                    aria-label="CSV file drop zone"
                  >
                    <span
                      className="grid h-14 w-14 place-items-center rounded-2xl border border-[var(--line)] bg-white text-[var(--signal)] shadow-[var(--shadow-soft)]"
                      aria-hidden="true"
                    >
                      <Upload className="h-6 w-6" />
                    </span>
                    <div>
                      <p className="text-sm font-extrabold text-[var(--ink)]">Upload CSV file</p>
                      <p className="mt-1 text-xs font-semibold text-[var(--steel)]">
                        Drag and drop your CSV here, or browse
                      </p>
                      <p className="mt-1 text-[0.68rem] font-bold text-[var(--muted)]">
                        Accepted format: .csv · Maximum size: 5 MB
                      </p>
                    </div>
                    <label
                      htmlFor="csv-file-upload"
                      className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-[var(--signal)] bg-[var(--signal)] px-4 py-2 text-sm font-extrabold text-white shadow-[var(--shadow-soft)] transition duration-200 hover:-translate-y-0.5 hover:border-[var(--ink)] hover:bg-[var(--ink)] focus-within:shadow-[var(--focus-ring)]"
                    >
                      <Upload className="h-4 w-4" aria-hidden="true" />
                      Browse files
                      <input
                        ref={fileInputRef}
                        id="csv-file-upload"
                        type="file"
                        accept={ACCEPTED_MIME}
                        className="sr-only"
                        onChange={handleFileInput}
                        aria-label="Select a CSV file to import"
                        aria-describedby="csv-file-hint"
                      />
                    </label>
                    <p id="csv-file-hint" className="sr-only">
                      Select a CSV file up to 5 MB containing a contact column with phone numbers
                      or email addresses.
                    </p>
                  </div>
                ) : (
                  /* Selected file info strip */
                  <div className="flex items-start gap-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[var(--line)] bg-white text-[var(--signal)] shadow-[var(--shadow-soft)]">
                      <FileText className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-extrabold text-[var(--ink)]">{file.name}</p>
                      <p className="mt-0.5 text-xs font-semibold text-[var(--steel)]">
                        {formatBytes(file.size)}
                        {csvPreview
                          ? ` · ${csvPreview.totalDataLines.toLocaleString()} data row${csvPreview.totalDataLines !== 1 ? "s" : ""} detected`
                          : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      disabled={isImporting}
                      aria-label="Remove selected file"
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[var(--line)] bg-white text-[var(--steel)] transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-55"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                )}

                {/* File validation error */}
                {fileError && <InlineAlert tone="error">{fileError}</InlineAlert>}

                {/* Missing contact column warning */}
                {missingContactColumn && (
                  <InlineAlert tone="warning">
                    No <code className="font-mono text-xs">contact</code> column detected in this
                    file. The backend requires a{" "}
                    <code className="font-mono text-xs">contact</code> column containing phone
                    numbers or email addresses.
                  </InlineAlert>
                )}

                {/* CSV preview table */}
                {csvPreview && csvPreview.headers.length > 0 && (
                  <div className="grid gap-2">
                    <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[var(--steel)]">
                      Preview — first {Math.min(csvPreview.rows.length, MAX_PREVIEW_ROWS)} of{" "}
                      {csvPreview.totalDataLines.toLocaleString()} rows
                    </p>
                    <TableWrap>
                      <table className="table-ledger text-sm" aria-label="CSV file preview">
                        <thead>
                          <tr className="border-b border-[var(--line)] bg-[var(--surface)]">
                            {csvPreview.headers.map((h, i) => (
                              <th
                                key={`${h}-${i}`}
                                scope="col"
                                className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-extrabold uppercase tracking-[0.07em] text-[var(--steel)]"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {csvPreview.rows.map((row, ri) => (
                            <tr key={ri} className="border-b border-[var(--line)] last:border-b-0">
                              {row.map((cell, ci) => (
                                <td
                                  key={ci}
                                  className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-[var(--ink)]"
                                >
                                  {cell || "—"}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </TableWrap>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ── CSV Column Reference Card ────────────────────────────────── */}
            <Card>
              <CardHeader>
                <CardTitle>CSV column reference</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-5">
                <p className="text-sm leading-6 text-[var(--steel)]">
                  The backend reads each column value per row. The{" "}
                  <code className="rounded bg-[var(--surface)] px-1.5 py-0.5 font-mono text-xs">
                    contact
                  </code>{" "}
                  column is required. All other columns are optional.
                </p>

                {/* Column: contact */}
                <div className="grid gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
                  <div className="flex items-center gap-2">
                    <code className="rounded bg-[var(--ink)] px-2 py-0.5 font-mono text-xs font-bold text-white">
                      contact
                    </code>
                    <StatusPill label="Required" tone="signal" />
                  </div>
                  <p className="text-xs leading-5 text-[var(--steel)]">
                    Phone number in international format (e.g.{" "}
                    <code className="font-mono">+27821234567</code>) or email address.
                  </p>
                </div>

                {/* Column: subscriberType */}
                <div className="grid gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
                  <div className="flex items-center gap-2">
                    <code className="rounded bg-[var(--ink)] px-2 py-0.5 font-mono text-xs font-bold text-white">
                      subscriberType
                    </code>
                    <StatusPill label="Optional" tone="neutral" />
                  </div>
                  <p className="text-xs leading-5 text-[var(--steel)]">
                    Accepted values (case-insensitive):
                  </p>
                  <ul className="grid gap-1">
                    {[
                      { value: "KINGSPARKON_SUBSCRIBER", note: "default" },
                      { value: "CLIENT", note: "" },
                      { value: "FREE_USER", note: "" },
                      { value: "BUSINESS_OWNER", note: "" },
                      { value: "AFFILIATE", note: "" },
                      { value: "DEV_HUB_CLIENT", note: "" },
                    ].map(({ value, note }) => (
                      <li key={value} className="flex items-center gap-2">
                        <code className="font-mono text-[0.68rem] text-[var(--ink)]">{value}</code>
                        {note && (
                          <span className="text-[0.65rem] font-bold text-[var(--muted)]">
                            — {note}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column: preferredChannel */}
                <div className="grid gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
                  <div className="flex items-center gap-2">
                    <code className="rounded bg-[var(--ink)] px-2 py-0.5 font-mono text-xs font-bold text-white">
                      preferredChannel
                    </code>
                    <StatusPill label="Optional" tone="neutral" />
                  </div>
                  <ul className="mt-1 grid gap-1">
                    {[
                      { value: "ANY", note: "default" },
                      { value: "EMAIL", note: "" },
                      { value: "WHATSAPP", note: "" },
                    ].map(({ value, note }) => (
                      <li key={value} className="flex items-center gap-2">
                        <code className="font-mono text-[0.68rem] text-[var(--ink)]">{value}</code>
                        {note && (
                          <span className="text-[0.65rem] font-bold text-[var(--muted)]">
                            — {note}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column: affiliateRegistered */}
                <div className="grid gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
                  <div className="flex items-center gap-2">
                    <code className="rounded bg-[var(--ink)] px-2 py-0.5 font-mono text-xs font-bold text-white">
                      affiliateRegistered
                    </code>
                    <StatusPill label="Optional" tone="neutral" />
                  </div>
                  <p className="text-xs leading-5 text-[var(--steel)]">
                    Truthy:{" "}
                    <code className="font-mono">true</code>,{" "}
                    <code className="font-mono">yes</code>,{" "}
                    <code className="font-mono">1</code>
                    {" "}· Falsy:{" "}
                    <code className="font-mono">false</code>,{" "}
                    <code className="font-mono">no</code>,{" "}
                    <code className="font-mono">0</code>{" "}
                    (default)
                  </p>
                </div>

                {/* Sample CSV */}
                <div className="grid gap-2">
                  <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[var(--steel)]">
                    Sample CSV
                  </p>
                  <pre className="overflow-x-auto rounded-xl border border-[var(--line)] bg-[var(--ink)] p-4 text-[0.68rem] leading-5 text-white">
{`contact,subscriberType,preferredChannel
+27821234567,FREE_USER,WHATSAPP
hello@example.com,AFFILIATE,EMAIL
+27831234567,,`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Import error banner ───────────────────────────────────────────── */}
          {importError && (
            <InlineAlert tone="error">
              <strong>Import failed:</strong> {importError}
            </InlineAlert>
          )}

          {/* ── Import action bar ─────────────────────────────────────────────── */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-white px-5 py-4 shadow-[var(--shadow-soft)]">
            <div>
              <p className="text-sm font-extrabold text-[var(--ink)]">
                {file ? `Ready to import — ${file.name}` : "No file selected"}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-[var(--steel)]">
                {file
                  ? "Review the preview, then click Import Subscribers."
                  : "Select a CSV file above to enable import."}
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              disabled={!canImport || isImporting}
              onClick={handleImport}
              aria-disabled={!canImport || isImporting}
              aria-label={
                !file
                  ? "Import Subscribers (disabled: no file selected)"
                  : isImporting
                  ? "Import in progress"
                  : "Import Subscribers from the selected CSV file"
              }
              className="gap-2 px-6"
            >
              {isImporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Importing…</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" aria-hidden="true" />
                  <span>Import Subscribers</span>
                </>
              )}
            </Button>
          </div>

          {/* ── Importing status ─────────────────────────────────────────────── */}
          {isImporting && (
            <div
              role="status"
              aria-live="polite"
              className="flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--signal-soft)] px-4 py-3"
            >
              <Loader2
                className="h-4 w-4 shrink-0 animate-spin text-[var(--signal)]"
                aria-hidden="true"
              />
              <p className="text-sm font-semibold text-[var(--ink)]">
                Uploading and processing CSV — please wait, do not close this page.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
