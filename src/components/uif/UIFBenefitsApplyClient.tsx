"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { UIFDocumentUploadCard, type UIFDocumentType } from "./UIFDocumentUploadCard";

type FileState = Record<UIFDocumentType, File | null>;
type ErrorState = Record<UIFDocumentType, string | null>;

const DOCUMENTS: Array<{ type: UIFDocumentType; title: string; description: string }> = [
  { type: "UI-19", title: "UI-19", description: "Employment termination declaration" },
  { type: "SALARY_SCHEDULE", title: "Salary Schedule", description: "Employee salary and contribution schedule" },
  { type: "UIF_2_8", title: "UIF 2.8", description: "UIF declaration form" },
  { type: "ID_COPY", title: "I.D Copy", description: "Certified copy of identity document" },
];

export function UIFBenefitsApplyClient() {
  const [files, setFiles] = useState<FileState>({
    "UI-19": null,
    SALARY_SCHEDULE: null,
    UIF_2_8: null,
    ID_COPY: null,
  });
  const [errors, setErrors] = useState<ErrorState>({
    "UI-19": null,
    SALARY_SCHEDULE: null,
    UIF_2_8: null,
    ID_COPY: null,
  });

  const uploadedCount = useMemo(() => Object.values(files).filter(Boolean).length, [files]);
  const total = DOCUMENTS.length;
  const isComplete = uploadedCount === total;
  const progressPercent = (uploadedCount / total) * 100;

  const handleFileSelect = (type: UIFDocumentType, file: File | null) => {
    setFiles((prev) => ({ ...prev, [type]: file }));
    if (file) {
      setErrors((prev) => ({ ...prev, [type]: null }));
    }
  };

  const handleError = (type: UIFDocumentType, message: string | null) => {
    setErrors((prev) => ({ ...prev, [type]: message }));
  };

  const handleContinue = () => {
    if (!isComplete) return;
    // UI-only placeholder action as per spec
    console.log("UIF application documents ready", {
      "UI-19": files["UI-19"]?.name,
      SALARY_SCHEDULE: files["SALARY_SCHEDULE"]?.name,
      UIF_2_8: files["UIF_2_8"]?.name,
      ID_COPY: files["ID_COPY"]?.name,
      files,
    });
    // UI-only action: documents are validated locally; submission happens in the next step.
    // We keep it UI-only without API call
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Header */}
      <div className="text-center md:text-left">
        <h1 className="text-2xl font-black tracking-[-0.04em] text-[var(--ink)] md:text-3xl">Apply for UIF Benefits</h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[var(--steel)] md:mx-0">Upload the documents below to continue with your UIF benefit application.</p>
      </div>

      {/* Cards */}
      <div className="mt-8 grid gap-4 md:gap-5">
        {DOCUMENTS.map((doc) => (
          <UIFDocumentUploadCard
            key={doc.type}
            docType={doc.type}
            title={doc.title}
            description={doc.description}
            file={files[doc.type]}
            error={errors[doc.type]}
            onFileSelect={(file) => handleFileSelect(doc.type, file)}
            onError={(msg) => handleError(doc.type, msg)}
          />
        ))}
      </div>

      {/* Progress */}
      <div className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)] md:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">Documents uploaded</p>
          <p className="text-xs font-black text-[var(--ink)]" aria-live="polite">
            {uploadedCount} of {total} documents uploaded
          </p>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--surface)] border border-[var(--line)]/50" role="progressbar" aria-valuenow={uploadedCount} aria-valuemin={0} aria-valuemax={total} aria-label={`${uploadedCount} of ${total} documents uploaded`}>
          <div
            className="h-full rounded-full bg-[var(--signal)] transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="mt-2 text-xs font-semibold text-[var(--steel)]">
          {uploadedCount} of {total}
        </p>
      </div>

      {/* Continue */}
      <div className="mt-6 flex justify-center md:justify-end">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!isComplete}
          aria-disabled={!isComplete}
          className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border px-8 text-sm font-black shadow-[var(--shadow-soft)] transition-all focus-visible:outline-none focus-visible:ring-4 md:w-auto ${isComplete ? "border-[var(--signal)] bg-[var(--signal)] text-white hover:bg-[var(--signal-strong)] hover:shadow-[var(--shadow-ledger)] active:scale-[0.98] focus-visible:ring-[var(--signal)]/20" : "cursor-not-allowed border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] opacity-70"}`}
        >
          Continue <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-3 text-center text-[0.68rem] font-semibold leading-4 text-[var(--muted)] md:text-right">
        All 4 documents are required to continue. PDF only, max 10 MB each.
      </p>
    </div>
  );
}
