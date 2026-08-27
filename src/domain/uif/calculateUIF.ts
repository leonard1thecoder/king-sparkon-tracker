import { UIF_MAX_MONTHLY_CEILING, UIF_MAX_CREDIT_DAYS, UIF_BASE_IRR, TERMINATION_REASON_LABELS } from "./uif.constants";
import type { UIFCalculatorInput, UIFCalculationResult } from "./uif.types";

export function calculateEmploymentDuration(startDateStr: string, endDateStr: string): { years: number; months: number; totalMonths: number; formatted: string } {
  if (!startDateStr || !endDateStr) {
    return { years: 0, months: 0, totalMonths: 0, formatted: "0 months" };
  }

  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
    return { years: 0, months: 0, totalMonths: 0, formatted: "0 months" };
  }

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();

  if (end.getDate() < start.getDate()) {
    months--;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  const totalMonths = Math.max(1, years * 12 + months);

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? "year" : "years"}`);
  if (months > 0 || parts.length === 0) parts.push(`${months} ${months === 1 ? "month" : "months"}`);

  return {
    years,
    months,
    totalMonths,
    formatted: parts.join(", "),
  };
}

export function generateSalaryHistoryMonths(endDateStr: string): string[] {
  const endDate = endDateStr ? new Date(endDateStr) : new Date();
  const months: string[] = [];

  for (let i = 0; i < 6; i++) {
    const d = new Date(endDate.getFullYear(), endDate.getMonth() - i, 1);
    const monthName = d.toLocaleString("en-US", { month: "Long", year: "numeric" });
    months.push(monthName);
  }

  return months;
}

export function calculateUIF(input: UIFCalculatorInput): UIFCalculationResult {
  const duration = calculateEmploymentDuration(input.employmentStartDate, input.employmentEndDate);

  // Determine average monthly salary from 6-month history if provided & salary changed
  let averageSalary = input.monthlySalary;
  if (input.salaryChanged && input.salaryHistory && input.salaryHistory.length > 0) {
    const sum = input.salaryHistory.reduce((acc, curr) => acc + (curr.grossSalary || 0), 0);
    averageSalary = sum / input.salaryHistory.length;
  }

  // Cap salary at South African UIF ceiling (R17,712)
  const cappedSalary = Math.min(averageSalary, UIF_MAX_MONTHLY_CEILING);

  // IRR formula (sliding scale based on salary level):
  // Low earners get ~60%, high earners capped at ceiling get ~38% - ~45%
  let irr = UIF_BASE_IRR;
  if (averageSalary <= 3000) {
    irr = 0.58;
  } else if (averageSalary <= 8000) {
    irr = 0.50;
  } else {
    irr = 0.44;
  }

  const monthlyBenefit = Math.round(cappedSalary * irr);
  const dailyRate = Math.round((monthlyBenefit * 12) / 365);

  // Credit Days accrual: 1 day for every 4 days worked (~1 month benefit for every 4 months worked)
  // Max cap: 365 days (~12 months) achieved after 4+ years (48 months) of continuous employment.
  const accruedCreditDays = Math.min(UIF_MAX_CREDIT_DAYS, Math.round((duration.totalMonths / 48) * UIF_MAX_CREDIT_DAYS));
  const durationMonths = Math.max(1, Math.min(12, Math.round(accruedCreditDays / 30)));
  const totalBenefit = Math.round(monthlyBenefit * durationMonths);

  const formatDateStr = (dStr: string) => {
    if (!dStr) return "-";
    const date = new Date(dStr);
    return isNaN(date.getTime()) ? dStr : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const terminationLabel = input.terminationReason === "OTHER" && input.otherTerminationReason
    ? input.otherTerminationReason
    : TERMINATION_REASON_LABELS[input.terminationReason] || input.terminationReason;

  return {
    monthlySalaryAverage: Math.round(averageSalary),
    cappedSalary,
    monthlyBenefit,
    dailyRate,
    totalCreditDays: accruedCreditDays,
    durationMonths,
    totalBenefit,
    totalEmploymentMonths: duration.totalMonths,
    yearsMonthsString: duration.formatted,
    startDateFormatted: formatDateStr(input.employmentStartDate),
    endDateFormatted: formatDateStr(input.employmentEndDate),
    terminationReasonLabel: terminationLabel,
  };
}
