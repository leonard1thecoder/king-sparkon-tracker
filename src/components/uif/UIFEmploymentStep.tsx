"use client";

import { Calendar, Briefcase, AlertCircle } from "lucide-react";
import type { UIFCalculatorInput, UIFValidationErrors, TerminationReason } from "@/domain/uif/uif.types";
import { calculateEmploymentDuration } from "@/domain/uif/calculateUIF";

interface UIFEmploymentStepProps {
  input: UIFCalculatorInput;
  errors: UIFValidationErrors;
  onChange: (fields: Partial<UIFCalculatorInput>) => void;
  onNext: () => void;
}

const terminationOptions: { value: TerminationReason; label: string; desc: string }[] = [
  { value: "RETRENCHED", label: "Retrenched", desc: "Operational requirements or company downsizing" },
  { value: "CONTRACT_ENDED", label: "Contract ended", desc: "Fixed-term employment agreement expired" },
  { value: "DISMISSED", label: "Dismissed", desc: "Employer-initiated termination of service" },
  { value: "RESIGNED", label: "Resigned", desc: "Voluntary departure from employment" },
  { value: "OTHER", label: "Other", desc: "Illness, insolvency or custom reasons" },
];

export function UIFEmploymentStep({ input, errors, onChange, onNext }: UIFEmploymentStepProps) {
  const duration = calculateEmploymentDuration(input.employmentStartDate, input.employmentEndDate);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <span className="inline-flex rounded-full border border-[var(--signal)]/20 bg-[var(--signal-soft)] px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]">
          Step 1 of 3
        </span>
        <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[var(--ink)]">Your employment</h2>
        <p className="mt-1 text-sm leading-6 text-[var(--steel)]">
          Tell us about your employment period and why your employment ended.
        </p>
      </div>

      {/* Employment Dates Section */}
      <div className="space-y-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)]/50 p-5 md:p-6">
        <h3 className="flex items-center gap-2 text-base font-black text-[var(--ink)]">
          <Calendar className="h-5 w-5 text-[var(--signal)]" /> Employment dates
        </h3>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Field 1: Start Date */}
          <div className="space-y-2">
            <label htmlFor="employmentStartDate" className="block text-sm font-black text-[var(--ink)]">
              Employment start date
            </label>
            <input
              id="employmentStartDate"
              type="date"
              value={input.employmentStartDate}
              onChange={(e) => onChange({ employmentStartDate: e.target.value })}
              className={`h-12 w-full rounded-xl border bg-white px-4 font-mono text-sm text-[var(--ink)] focus:outline-none focus:ring-4 ${
                errors.employmentStartDate
                  ? "border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger)]/10"
                  : "border-[var(--line)] focus:border-[var(--signal)] focus:ring-[var(--signal-soft)]"
              }`}
            />
            <p className="text-xs font-semibold text-[var(--steel)]">
              When did you start working for this employer?
            </p>
            {errors.employmentStartDate && (
              <p className="flex items-center gap-1.5 text-xs font-bold text-[var(--danger)]">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors.employmentStartDate}
              </p>
            )}
          </div>

          {/* Field 2: End Date */}
          <div className="space-y-2">
            <label htmlFor="employmentEndDate" className="block text-sm font-black text-[var(--ink)]">
              Employment end date
            </label>
            <input
              id="employmentEndDate"
              type="date"
              value={input.employmentEndDate}
              onChange={(e) => onChange({ employmentEndDate: e.target.value })}
              className={`h-12 w-full rounded-xl border bg-white px-4 font-mono text-sm text-[var(--ink)] focus:outline-none focus:ring-4 ${
                errors.employmentEndDate
                  ? "border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger)]/10"
                  : "border-[var(--line)] focus:border-[var(--signal)] focus:ring-[var(--signal-soft)]"
              }`}
            />
            <p className="text-xs font-semibold text-[var(--steel)]">When did your employment end?</p>
            {errors.employmentEndDate && (
              <p className="flex items-center gap-1.5 text-xs font-bold text-[var(--danger)]">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors.employmentEndDate}
              </p>
            )}
          </div>
        </div>

        {/* Derived Employment Period */}
        {input.employmentStartDate && input.employmentEndDate && !errors.employmentEndDate && (
          <div className="rounded-xl border border-[var(--signal)]/30 bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--muted)]">
              Calculated Employment Period
            </p>
            <p className="mt-1 font-mono text-lg font-black text-[var(--signal-strong)]">
              {duration.formatted}
            </p>
          </div>
        )}
      </div>

      {/* Termination Reason Section */}
      <div className="space-y-4">
        <div>
          <h3 className="flex items-center gap-2 text-base font-black text-[var(--ink)]">
            <Briefcase className="h-5 w-5 text-[var(--signal)]" /> Why did your employment end?
          </h3>
          <p className="mt-1 text-xs text-[var(--steel)]">Select the primary reason for termination of service.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {terminationOptions.map((opt) => {
            const isSelected = input.terminationReason === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ terminationReason: opt.value })}
                className={`flex flex-col justify-between rounded-xl border p-4 text-left transition-all ${
                  isSelected
                    ? "border-[var(--signal)] bg-[var(--signal-soft)] ring-2 ring-[var(--signal)]"
                    : "border-[var(--line)] bg-white hover:border-[var(--line-strong)] hover:bg-[var(--surface)]"
                }`}
              >
                <div>
                  <span className={`text-sm font-black ${isSelected ? "text-[var(--signal-strong)]" : "text-[var(--ink)]"}`}>
                    {opt.label}
                  </span>
                  <p className="mt-1 text-xs leading-5 text-[var(--steel)]">{opt.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {errors.terminationReason && (
          <p className="flex items-center gap-1.5 text-xs font-bold text-[var(--danger)]">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors.terminationReason}
          </p>
        )}

        {/* Revealable Other Reason */}
        {input.terminationReason === "OTHER" && (
          <div className="space-y-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
            <label htmlFor="otherTerminationReason" className="block text-sm font-black text-[var(--ink)]">
              Please specify
            </label>
            <input
              id="otherTerminationReason"
              type="text"
              value={input.otherTerminationReason || ""}
              onChange={(e) => onChange({ otherTerminationReason: e.target.value })}
              placeholder="Specify reason (e.g. Insolvency, Medical discharge)"
              className="h-11 w-full rounded-xl border border-[var(--line)] bg-white px-4 text-sm text-[var(--ink)] focus:border-[var(--signal)] focus:outline-none focus:ring-4 focus:ring-[var(--signal-soft)]"
            />
            {errors.otherTerminationReason && (
              <p className="flex items-center gap-1.5 text-xs font-bold text-[var(--danger)]">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors.otherTerminationReason}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-end border-t border-[var(--line)] pt-5">
        <button
          type="button"
          onClick={onNext}
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--signal)] bg-[var(--signal)] px-8 text-sm font-extrabold text-white shadow-[var(--shadow-soft)] transition-all hover:bg-[var(--signal-strong)] active:scale-[0.98]"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
