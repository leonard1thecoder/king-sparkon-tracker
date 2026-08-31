"use client";

import { useId, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, FileText, Upload, X } from "lucide-react";

export type UIFDocumentType = "UI-19" | "SALARY_SCHEDULE" | "UIF_2_8" | "ID_COPY";

type Props = {
  docType: UIFDocumentType;
  title: string;
  description: string;
  file: File | null;
  error?: string | null;
  onFileSelect: (file: File | null) => void;
  onError?: (message: string | null) => void;
};

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export function UIFDocumentUploadCard({ docType, title, description, file, error: externalError, onFileSelect, onError }: Props) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);

  const error = externalError ?? internalError;
  const isUploaded = !!file;

  const setError = (msg: string | null) => {
    setInternalError(msg);
    onError?.(msg);
  };

  const validateAndSet = (candidate: File | null) => {
    if (!candidate) {
      onFileSelect(null);
      setError(null);
      return;
    }
    if (candidate.type !== "application/pdf" && !candidate.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a PDF document.");
      return;
    }
    if (candidate.size > MAX_SIZE_BYTES) {
      setError("File is too large. Maximum size is 10 MB.");
      return;
    }
    setError(null);
    onFileSelect(candidate);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    validateAndSet(f);
    // reset input so same file can be selected again after remove
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0] ?? null;
    validateAndSet(f);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    onFileSelect(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleReplace = () => {
    fileInputRef.current?.click();
  };

  const handleKeyDownBrowse = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleBrowse();
    }
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-white p-5 shadow-[var(--shadow-soft)] transition-all md:p-6 ${isDragging ? "border-[var(--signal)] bg-[var(--signal-soft)] ring-4 ring-[var(--signal)]/10" : error ? "border-[var(--danger)]/40 bg-red-50/20" : isUploaded ? "border-emerald-200 bg-emerald-50/10" : "border-[var(--line)] hover:border-[var(--line-strong)] hover:shadow-[var(--shadow-ledger)]"} ${isUploaded ? "" : ""}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      aria-labelledby={`${inputId}-title`}
      role="region"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border text-sm font-black transition ${isUploaded ? "border-emerald-200 bg-emerald-500 text-white" : error ? "border-[var(--danger)]/30 bg-white text-[var(--danger)]" : "border-[var(--line)] bg-[var(--surface)] text-[var(--steel)]"}`}
            aria-hidden="true"
          >
            {isUploaded ? <CheckCircle2 className="h-5 w-5" /> : <span className="h-2.5 w-2.5 rounded-full border-2 border-current opacity-60" />}
          </span>
          <div className="min-w-0">
            <h3 id={`${inputId}-title`} className="truncate text-sm font-black tracking-[-0.02em] text-[var(--ink)] md:text-[15px]">
              {title}
            </h3>
            <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-[var(--steel)] md:text-sm">{description}</p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-[0.1em] ${isUploaded ? "border-emerald-200 bg-emerald-500 text-white" : "border-[var(--line)] bg-white text-[var(--muted)]"}`}
          aria-live="polite"
        >
          {isUploaded ? "Uploaded" : "Required"}
        </span>
      </div>

      {/* Hidden input */}
      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={handleInputChange}
      />

      {/* Body */}
      {!isUploaded ? (
        <div className="mt-5">
          <div
            role="button"
            tabIndex={0}
            aria-label={`Upload ${title} PDF. Drag and drop or browse files. Only PDF up to 10 MB.`}
            aria-describedby={error ? `${inputId}-error` : undefined}
            onClick={handleBrowse}
            onKeyDown={handleKeyDownBrowse}
            className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed bg-[var(--surface)]/60 px-4 py-8 text-center transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--signal)]/15 focus-visible:border-[var(--signal)] ${isDragging ? "border-[var(--signal)] bg-white" : "border-[var(--line)] hover:border-[var(--line-strong)] hover:bg-white"} cursor-pointer`}
          >
            <span className={`grid h-11 w-11 place-items-center rounded-full border bg-white shadow-[var(--shadow-soft)] ${isDragging ? "border-[var(--signal)] text-[var(--signal-strong)]" : "border-[var(--line)] text-[var(--signal)]"}`}>
              <Upload className="h-5 w-5" />
            </span>
            <p className="mt-3 text-sm font-black text-[var(--ink)]">Upload your PDF</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-[var(--steel)]">
              Drag & drop here or <span className="font-black text-[var(--signal-strong)] underline decoration-[var(--signal)]/30 underline-offset-4 group-hover:text-[var(--signal)]">Browse files</span>
            </p>
            <p className="mt-2 text-[0.68rem] font-semibold text-[var(--muted)]">PDF only • Max 10 MB</p>
          </div>
          {error ? (
            <p id={`${inputId}-error`} className="mt-3 flex items-center gap-1.5 rounded-xl border border-[var(--danger)]/20 bg-red-50 px-3 py-2 text-xs font-bold text-[var(--danger)]" role="alert">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {error}
            </p>
          ) : null}
          <label htmlFor={inputId} className="sr-only">
            {title} - {description} (PDF, max 10 MB, required)
          </label>
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-white p-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-50 text-red-600 border border-red-100">
              <FileText className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black leading-5 text-[var(--ink)]" title={file.name}>
                {file.name}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-[var(--muted)]">{formatBytes(file.size)}</p>
            </div>
            <span className="hidden items-center gap-1.5 rounded-full bg-emerald-500 px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-[0.08em] text-white sm:inline-flex">
              <CheckCircle2 className="h-3 w-3" /> PDF
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleReplace}
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[var(--line)] bg-white px-3 text-xs font-black text-[var(--ink)] transition hover:border-[var(--signal)] hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--signal)]/15"
              aria-label={`Replace ${title} file`}
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-[var(--line)] bg-white px-3 text-xs font-black text-[var(--danger)] transition hover:border-[var(--danger)]/30 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--danger)]/15"
              aria-label={`Remove ${title} file`}
            >
              <X className="h-3.5 w-3.5" /> Remove
            </button>
          </div>
          {error ? (
            <p id={`${inputId}-error`} className="mt-3 flex items-center gap-1.5 text-xs font-bold text-[var(--danger)]" role="alert">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {error}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
