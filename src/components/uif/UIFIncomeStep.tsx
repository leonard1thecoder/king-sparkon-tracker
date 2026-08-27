"use client";

import { Banknote, AlertCircle, Calendar } from "lucide-react";
import type { UIFCalculatorInput, UIFValidationErrors, SalaryHistoryEntry } from "@/domain/uif/uif.types";
import { generateSalaryHistoryMonths } from "@/domain/uif/calculateUIF";

interface UIFIncomeStepProps {
  input: UIFCalculatorInput;
  errors: UIFValidationErrors;
  onChange: (fields: Partial<UIFCalculatorInput>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function UIFIncomeStep({ input, errors, onChange, onNext, onBack }: UIFIncomeStepProps) {
  const dynamicMonths = generateSalaryHistoryMonths(input.employmentEndDate);

  function handleSalaryChange(rawVal: string) {
    const numeric = Math.max(0, Number(rawVal.replace(/[^0-9.]/g, "")) || 0);
    onChange({ monthlySalary: numeric });

    // Sync salary history default values if enabled
    if (input.salaryChanged) {
      const currentHistory = input.salaryHistory || [];
      const updatedHistory: SalaryHistoryEntry[] = dynamicMonths.map((mName, i) => ({
        month: mName,
        grossSalary: currentHistory[i]?.grossSalary ?? numeric,
      }));
      onChange({ salaryHistory: updatedHistory });
    }
  }

  function handleSalaryChangedToggle(changed: boolean) {
    if (changed) {
      const updatedHistory: SalaryHistoryEntry[] = dynamicMonths.map((mName) => ({
        month: mName,
        grossSalary: input.monthlySalary || 0,
      }));
      onChange({ salaryChanged: true, salaryHistory: updatedHistory });
    } else {
      onChange({ salaryChanged: false, salaryHistory: undefined });
    }
  }

  function handleHistoryMonthChange(index: number, rawVal: string) {
    const numeric = Math.max(0, Number(rawVal.replace(/[^0-9.]/g, "")) || 0);
    const updated = [...(input.salaryHistory || [])];
    updated[index] = { month: dynamicMonths[index], grossSalary: numeric };
    onChange({ salaryHistory: updated });
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <span className="inline-flex rounded-full border border-[var(--signal)]/20 bg-[var(--signal-soft)] px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]">
          Step 2 of 3
        </span>
        <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[var(--ink)]">Your income</h2>
        <p className="mt-1 text-sm leading-6 text-[var(--steel)]">
          Your salary helps us estimate your UIF benefit amount.
        </p>
      </div>

      {/* Main Gross Monthly Salary Input */}
      <div className="space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)]/50 p-5 md:p-6">
        <label htmlFor="monthlySalary" className="block text-sm font-black text-[var(--ink)]">
          Gross monthly salary
        </label>
        <div className="relative">
          <span className="absolute left-4 top-3.5 font-mono text-base font-black text-[var(--muted)]">R</span>
          <input
            id="monthlySalary"
            type="text"
            value={input.monthlySalary ? input.monthlySalary.toLocaleString("en-ZA") : ""}
            onChange={(e) => handleSalaryChange(e.target.value)}
            placeholder="15,000"
            className={`h-13 w-full rounded-xl border bg-white pl-9 pr-4 font-mono text-lg font-bold text-[var(--ink)] focus:outline-none focus:ring-4 ${
              errors.monthlySalary
                ? "border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger)]/10"
                : "border-[var(--line)] focus:border-[var(--signal)] focus:ring-[var(--signal-soft)]"
            }`}
          />
        </div>
        <p className="text-xs font-semibold text-[var(--steel)]">
          Enter your gross monthly salary before tax and deductions.
        </p>
        {errors.monthlySalary && (
          <p className="flex items-center gap-1.5 text-xs font-bold text-[var(--danger)]">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {errors.monthlySalary}
          </p>
        )}
      </div>

      {/* Salary Change Segmented Control */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-black text-[var(--ink)]">
            Did your salary change during the last 6 months?
          </label>
          <p className="mt-1 text-xs text-[var(--steel)]">
            Select Yes if your gross salary fluctuated over the last 6 months of employment.
          </p>
        </div>

        <div className="flex max-w-xs rounded-xl border border-[var(--line)] bg-[var(--surface)] p-1">
          <button
            type="button"
            onClick={() => handleSalaryChangedToggle(false)}
            className={`flex-1 rounded-lg py-2.5 text-sm font-black transition-all ${
              !input.salaryChanged
                ? "bg-white text-[var(--signal-strong)] shadow-[var(--shadow-soft)]"
                : "text-[var(--steel)] hover:text-[var(--ink)]"
            }`}
          >
            No
          </button>
          <button
            type="button"
            onClick={() => handleSalaryChangedToggle(true)}
            className={`flex-1 rounded-lg py-2.5 text-sm font-black transition-all ${
              input.salaryChanged
                ? "bg-white text-[var(--signal-strong)] shadow-[var(--shadow-soft)]"
                : "text-[var(--steel)] hover:text-[var(--ink)]"
            }`}
          >
            Yes
          </button>
        </div>
      </div>

      {/* Dynamic 6-Month Salary History Table */}
      {input.salaryChanged && (
        <div className="space-y-4 rounded-2xl border border-[var(--signal)]/30 bg-white p-5 md:p-6 animate-in fade-in duration-300">
          <div>
            <h3 className="flex items-center gap-2 text-base font-black text-[var(--ink)]">
              <Calendar className="h-5 w-5 text-[var(--signal)]" /> Your salary for the last 6 months
            </h3>
            <p className="mt-1 text-xs text-[var(--steel)]">
              Enter your gross salary for each month preceding your employment end date.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-[var(--line)]">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--line)] bg-[var(--surface)] text-xs font-black uppercase tracking-[0.08em] text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3">Month</th>
                  <th className="px-4 py-3 text-right">Gross salary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {dynamicMonths.map((monthName, idx) => {
                  const val = input.salaryHistory?.[idx]?.grossSalary ?? input.monthlySalary;
                  return (
                    <tr key={monthName} className="hover:bg-[var(--surface)]/50">
                      <td className="px-4 py-3 font-semibold text-[var(--ink)]">{monthName}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="relative inline-block w-40">
                          <span className="absolute left-3 top-2.5 font-mono text-xs font-bold text-[var(--muted)]">R</span>
                          <input
                            type="text"
                            value={val ? val.toLocaleString("en-ZA") : ""}
                            onChange={(e) => handleHistoryMonthChange(idx, e.target.value)}
                            className="h-9 w-full rounded-lg border border-[var(--line)] bg-white pl-7 pr-3 text-right font-mono text-sm font-bold text-[var(--ink)] focus:border-[var(--signal)] focus:outline-none focus:ring-2 focus:ring-[var(--signal-soft)]"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Navigation Controls */}
      <div className="flex items-center justify-between border-t border-[var(--line)] pt-5">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--line-strong)] bg-white px-6 text-sm font-extrabold text-[var(--ink)] transition-all hover:bg-[var(--surface)]"
        >
          ← Back
        </button>
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
