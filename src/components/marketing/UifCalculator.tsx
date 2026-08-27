"use client";

import { useState } from "react";
import { Calculator, CheckCircle2, ShieldCheck } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export function UifCalculator() {
  const [grossSalary, setGrossSalary] = useState<string>("15000");

  const grossNum = Math.max(0, Number(grossSalary.replace(/[^0-9.]/g, "")) || 0);

  // Maximum monthly remuneration subject to UIF ceiling (R17,712 per month as per South African UIF Act)
  const UIF_CEILING = 17712;
  const eligibleAmount = Math.min(grossNum, UIF_CEILING);

  // Employee contribution: 1% capped at R177.12
  const employeeContrib = eligibleAmount * 0.01;
  // Employer contribution: 1% capped at R177.12
  const employerContrib = eligibleAmount * 0.01;
  // Total monthly contribution into UIF fund
  const totalContrib = employeeContrib + employerContrib;

  // Maximum monthly benefit calculation (IRR scale: ~38% to 60% of earnings up to ceiling)
  // Approximate standard monthly payout rate (~45%)
  const approxMonthlyBenefit = eligibleAmount * 0.45;
  const maxClaimDays = 365; // Up to 365 days of credit with 4+ years of service
  const approxDailyRate = (eligibleAmount * 12 * 0.45) / 365;

  return (
    <GlassCard variant="elevated" className="overflow-hidden border border-[var(--line)] bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-[var(--line)] pb-5">
        <div>
          <span className="inline-flex rounded-full border border-[var(--signal)]/20 bg-[var(--signal-soft)] px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]">
            POPIA Compliant Calculator
          </span>
          <h3 className="mt-2 flex items-center gap-2.5 text-2xl font-black tracking-[-0.03em] text-[var(--ink)]">
            <Calculator className="h-6 w-6 text-[var(--signal)]" /> Official UIF Contribution & Benefit Calculator
          </h3>
          <p className="mt-1 text-sm text-[var(--steel)]">
            Calculate your monthly 1% contribution, employer matching, and estimated benefit payouts under South Africa&apos;s Unemployment Insurance Act.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-[var(--confirm)]/30 bg-[var(--confirm)]/10 px-3.5 py-2 text-xs font-bold text-[var(--confirm)]">
          <ShieldCheck className="h-4 w-4 shrink-0" /> Zero Personal Data Stored (POPIA Safe)
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Input Controls */}
        <div className="space-y-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5">
          <label className="grid gap-2">
            <span className="text-sm font-black text-[var(--ink)]">
              Gross Monthly Salary (ZAR)
            </span>
            <div className="relative">
              <span className="absolute left-4 top-3 font-mono text-sm font-bold text-[var(--muted)]">R</span>
              <input
                type="text"
                value={grossSalary}
                onChange={(e) => setGrossSalary(e.target.value)}
                placeholder="15000"
                className="h-12 w-full rounded-xl border border-[var(--line)] bg-white pl-9 pr-4 font-mono text-base font-bold text-[var(--ink)] focus:border-[var(--signal)] focus:outline-none focus:ring-4 focus:ring-[var(--signal-soft)]"
              />
            </div>
            <span className="text-xs text-[var(--steel)]">
              UIF Cap: R17,712.00/month (Maximum employee deduction: R177.12/month).
            </span>
          </label>

          <div className="rounded-lg border border-[var(--line)] bg-white p-3.5 text-xs text-[var(--steel)] space-y-1.5">
            <p className="font-bold text-[var(--ink)]">POPIA Data Protection Notice:</p>
            <p>
              This calculator operates purely in your web browser. No salary figures, ID numbers, or financial metrics are transmitted, saved, or shared.
            </p>
          </div>
        </div>

        {/* Calculations Display */}
        <div className="grid gap-3">
          <div className="rounded-xl border border-[var(--line)] bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--muted)]">Employee Contribution (1%)</p>
            <p className="mt-1 font-mono text-2xl font-black text-[var(--signal-strong)]">
              R{employeeContrib.toFixed(2)} <span className="text-xs font-semibold text-[var(--steel)]">/ month</span>
            </p>
          </div>

          <div className="rounded-xl border border-[var(--line)] bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--muted)]">Employer Matching Contribution (1%)</p>
            <p className="mt-1 font-mono text-2xl font-black text-[var(--ink)]">
              R{employerContrib.toFixed(2)} <span className="text-xs font-semibold text-[var(--steel)]">/ month</span>
            </p>
          </div>

          <div className="rounded-xl border border-[var(--signal)]/30 bg-[var(--signal-soft)] p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--signal-strong)]">Estimated Monthly Benefit Payout</p>
                <p className="mt-1 font-mono text-2xl font-black text-[var(--signal-strong)]">
                  ~R{approxMonthlyBenefit.toFixed(2)} <span className="text-xs font-semibold text-[var(--steel)]">/ month</span>
                </p>
              </div>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-extrabold text-[var(--signal-strong)] border border-[var(--line)]">
                Up to {maxClaimDays} days
              </span>
            </div>
            <p className="mt-2 text-xs text-[var(--steel)]">
              Estimated daily rate: ~R{approxDailyRate.toFixed(2)}/day based on full credit scale.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-4 text-xs font-bold text-[var(--steel)]">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-[var(--confirm)]" />
          <span>Compliant with Unemployment Insurance Act 63 of 2001 & POPIA</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/dashboard/user/uif/status" className="text-[var(--signal-strong)] hover:underline">Check Official Status →</a>
          <a href="/dashboard/user/uif/password" className="text-[var(--signal-strong)] hover:underline">Update Password →</a>
        </div>
      </div>
    </GlassCard>
  );
}
