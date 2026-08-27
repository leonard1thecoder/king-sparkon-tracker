"use client";

import { ShieldCheck, Calendar, Clock, Banknote, AlertCircle, RotateCcw } from "lucide-react";
import type { UIFCalculationResult, UIFCalculatorInput } from "@/domain/uif/uif.types";

interface UIFResultProps {
  result: UIFCalculationResult;
  input: UIFCalculatorInput;
  onReset: () => void;
}

export function UIFResult({ result, input, onReset }: UIFResultProps) {
  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-400">
      <div>
        <span className="inline-flex rounded-full border border-[var(--confirm)]/30 bg-[var(--confirm)]/10 px-3.5 py-1 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--confirm)]">
          Calculation Result
        </span>
        <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[var(--ink)]">
          Your estimated UIF benefit
        </h2>
        <p className="mt-1 text-sm leading-6 text-[var(--steel)]">
          Based on the information you provided, here&apos;s an estimate of your potential UIF benefit.
        </p>
      </div>

      {/* Primary Hero Result Card */}
      <div className="rounded-3xl border border-[var(--signal)]/40 bg-gradient-to-br from-[var(--signal-soft)] via-white to-sky-50 p-6 md:p-8 shadow-[var(--shadow-soft)]">
        <p className="text-xs font-black uppercase tracking-[0.1em] text-[var(--signal-strong)]">
          Estimated monthly benefit
        </p>
        <p className="mt-2 font-mono text-4xl md:text-5xl font-black text-[var(--signal-strong)]">
          R {result.monthlyBenefit.toLocaleString("en-ZA")} <span className="text-base font-bold text-[var(--steel)]">/ month</span>
        </p>
        <p className="mt-2 text-xs font-semibold text-[var(--steel)]">
          Subject to South African UIF remuneration cap (R17,712/month).
        </p>
      </div>

      {/* Secondary Cards: Duration & Total */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)]">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.08em] text-[var(--muted)]">
            <Clock className="h-4 w-4 text-[var(--signal)]" /> Estimated benefit duration
          </div>
          <p className="mt-2 font-mono text-2xl font-black text-[var(--ink)]">
            ~{result.durationMonths} {result.durationMonths === 1 ? "month" : "months"}
          </p>
          <p className="mt-1 text-xs text-[var(--steel)]">
            Based on ~{result.totalCreditDays} accrued credit days.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)]">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.08em] text-[var(--muted)]">
            <Banknote className="h-4 w-4 text-[var(--signal)]" /> Estimated total benefit
          </div>
          <p className="mt-2 font-mono text-2xl font-black text-[var(--ink)]">
            ~R {result.totalBenefit.toLocaleString("en-ZA")}
          </p>
          <p className="mt-1 text-xs text-[var(--steel)]">
            Estimated cumulative payout across claim duration.
          </p>
        </div>
      </div>

      {/* Calculation Summary Breakdown */}
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 md:p-6 space-y-4">
        <h3 className="text-base font-black text-[var(--ink)]">Calculation summary</h3>

        <div className="divide-y divide-[var(--line)] text-sm">
          <div className="flex justify-between py-2.5">
            <span className="font-semibold text-[var(--steel)]">Employment period</span>
            <span className="font-mono font-bold text-[var(--ink)]">
              {result.startDateFormatted} – {result.endDateFormatted}
            </span>
          </div>

          <div className="flex justify-between py-2.5">
            <span className="font-semibold text-[var(--steel)]">Employment duration</span>
            <span className="font-mono font-bold text-[var(--ink)]">{result.yearsMonthsString}</span>
          </div>

          <div className="flex justify-between py-2.5">
            <span className="font-semibold text-[var(--steel)]">Termination reason</span>
            <span className="font-bold text-[var(--ink)]">{result.terminationReasonLabel}</span>
          </div>

          <div className="flex justify-between py-2.5">
            <span className="font-semibold text-[var(--steel)]">Average monthly salary</span>
            <span className="font-mono font-bold text-[var(--ink)]">
              R {result.monthlySalaryAverage.toLocaleString("en-ZA")}
            </span>
          </div>

          <div className="flex justify-between py-2.5">
            <span className="font-semibold text-[var(--steel)]">Estimated monthly UIF benefit</span>
            <span className="font-mono font-black text-[var(--signal-strong)]">
              R {result.monthlyBenefit.toLocaleString("en-ZA")}
            </span>
          </div>

          <div className="flex justify-between py-2.5">
            <span className="font-semibold text-[var(--steel)]">Estimated duration</span>
            <span className="font-mono font-bold text-[var(--ink)]">~{result.durationMonths} months</span>
          </div>
        </div>
      </div>

      {/* Trust & Disclaimer Panel */}
      <div className="flex items-start gap-3 rounded-2xl border border-[var(--line)] bg-amber-50/50 p-5 text-amber-900">
        <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
        <div className="text-xs leading-5">
          <p className="font-black text-amber-950">Important Notice:</p>
          <p>
            This calculator provides an estimate based on the information you enter. Your final UIF benefit, qualifying period and payment duration are determined by UIF using your official contribution records and applicable rules.
          </p>
        </div>
      </div>

      {/* Recalculate CTA */}
      <div className="flex justify-start border-t border-[var(--line)] pt-5">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[var(--line-strong)] bg-white px-6 text-sm font-extrabold text-[var(--ink)] transition-all hover:bg-[var(--surface)] active:scale-[0.98]"
        >
          <RotateCcw className="h-4 w-4" /> Edit / Recalculate
        </button>
      </div>
    </div>
  );
}
