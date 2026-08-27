"use client";

import { ShieldCheck, Info, Loader2 } from "lucide-react";
import type { UIFCalculatorInput } from "@/domain/uif/uif.types";
import { calculateEmploymentDuration } from "@/domain/uif/calculateUIF";

interface UIFHistoryStepProps {
  input: UIFCalculatorInput;
  isCalculating: boolean;
  onCalculate: () => void;
  onBack: () => void;
}

export function UIFHistoryStep({ input, isCalculating, onCalculate, onBack }: UIFHistoryStepProps) {
  const duration = calculateEmploymentDuration(input.employmentStartDate, input.employmentEndDate);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <span className="inline-flex rounded-full border border-[var(--signal)]/20 bg-[var(--signal-soft)] px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]">
          Step 3 of 3
        </span>
        <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[var(--ink)]">Your UIF history</h2>
        <p className="mt-1 text-sm leading-6 text-[var(--steel)]">
          We&apos;ll use your employment period to estimate how long you may have contributed to UIF.
        </p>
      </div>

      {/* Auto-derived Employment Period & Contributions */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)]/60 p-5">
          <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--muted)]">
            Employment duration
          </p>
          <p className="mt-2 font-mono text-2xl font-black text-[var(--ink)]">
            {duration.formatted}
          </p>
          <p className="mt-1 text-xs text-[var(--steel)]">
            Derived directly from your start and end dates.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--signal)]/30 bg-[var(--signal-soft)] p-5">
          <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--signal-strong)]">
            Estimated contribution period
          </p>
          <p className="mt-2 font-mono text-2xl font-black text-[var(--signal-strong)]">
            Approximately {duration.totalMonths} months
          </p>
          <p className="mt-1 text-xs text-[var(--steel)]">
            Est. ~{Math.min(365, Math.round((duration.totalMonths / 48) * 365))} credit days accrued.
          </p>
        </div>
      </div>

      {/* Disclaimer Card */}
      <div className="flex items-start gap-3 rounded-2xl border border-[var(--line)] bg-white p-5">
        <Info className="h-5 w-5 shrink-0 text-[var(--signal)] mt-0.5" />
        <div className="text-xs leading-5 text-[var(--steel)]">
          <p className="font-bold text-[var(--ink)]">Official Record Disclaimer:</p>
          <p>
            Your actual UIF contribution history is determined from official Department of Employment and Labour records. This calculator provides an estimate based on the information you provide.
          </p>
        </div>
      </div>

      {/* Calculate CTA */}
      <div className="space-y-4 border-t border-[var(--line)] pt-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            disabled={isCalculating}
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--line-strong)] bg-white px-6 text-sm font-extrabold text-[var(--ink)] transition-all hover:bg-[var(--surface)] disabled:opacity-50"
          >
            ← Back
          </button>

          <button
            type="button"
            onClick={onCalculate}
            disabled={isCalculating}
            className="inline-flex min-h-14 items-center justify-center gap-2.5 rounded-xl border border-[var(--signal)] bg-[var(--signal)] px-8 text-base font-black text-white shadow-[var(--shadow-soft)] transition-all hover:bg-[var(--signal-strong)] active:scale-[0.98] disabled:opacity-60"
          >
            {isCalculating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Calculating...
              </>
            ) : (
              <>
                <ShieldCheck className="h-5 w-5" /> Calculate my UIF benefit
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
