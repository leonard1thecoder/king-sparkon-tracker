"use client";

import { CheckCircle2 } from "lucide-react";

type Step = 1 | 2 | 3 | 4;

interface UIFStepperProps {
  currentStep: Step;
}

const steps = [
  { number: 1, label: "01 Employment", desc: "Dates & Reason" },
  { number: 2, label: "02 Income", desc: "Salary & History" },
  { number: 3, label: "03 UIF History", desc: "Contributions & Estimate" },
];

export function UIFStepper({ currentStep }: UIFStepperProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--line)] pb-5">
        {steps.map((step) => {
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number || currentStep === 4;

          return (
            <div key={step.number} className="flex flex-1 items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-black transition-all ${
                  isCompleted
                    ? "border border-[var(--confirm)]/30 bg-[var(--confirm)]/10 text-[var(--confirm)]"
                    : isActive
                    ? "border border-[var(--signal)] bg-[var(--signal)] text-white shadow-[var(--shadow-soft)]"
                    : "border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]"
                }`}
              >
                {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : `0${step.number}`}
              </div>
              <div className="hidden sm:block">
                <p
                  className={`text-xs font-black uppercase tracking-[0.08em] ${
                    isActive ? "text-[var(--signal-strong)]" : isCompleted ? "text-[var(--ink)]" : "text-[var(--muted)]"
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-[11px] font-semibold text-[var(--steel)]">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
