"use client";

import { useState } from "react";
import { UIFStepper } from "./UIFStepper";
import { UIFEmploymentStep } from "./UIFEmploymentStep";
import { UIFIncomeStep } from "./UIFIncomeStep";
import { UIFHistoryStep } from "./UIFHistoryStep";
import { UIFResult } from "./UIFResult";
import type { UIFCalculatorInput, UIFCalculationResult, UIFValidationErrors } from "@/domain/uif/uif.types";
import { validateUIFStep1, validateUIFStep2 } from "@/domain/uif/uif.validation";
import { calculateUIF } from "@/domain/uif/calculateUIF";

export function UIFCalculator() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isCalculating, setIsCalculating] = useState(false);
  const [errors, setErrors] = useState<UIFValidationErrors>({});

  const [input, setInput] = useState<UIFCalculatorInput>({
    employmentStartDate: "",
    employmentEndDate: "",
    terminationReason: "RETRENCHED",
    otherTerminationReason: "",
    monthlySalary: 15000,
    salaryChanged: false,
  });

  const [result, setResult] = useState<UIFCalculationResult | null>(null);

  function handleChange(fields: Partial<UIFCalculatorInput>) {
    setInput((prev) => ({ ...prev, ...fields }));
    // Clear validation errors when user changes input
    setErrors({});
  }

  function handleNextFromStep1() {
    const errs = validateUIFStep1(input);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStep(2);
  }

  function handleNextFromStep2() {
    const errs = validateUIFStep2(input);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStep(3);
  }

  function handleCalculate() {
    setIsCalculating(true);
    setTimeout(() => {
      const calcRes = calculateUIF(input);
      setResult(calcRes);
      setIsCalculating(false);
      setStep(4);
    }, 500);
  }

  function handleReset() {
    setStep(1);
    setResult(null);
  }

  return (
    <div className="mx-auto max-w-4xl rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow-soft)] md:p-10">
      {/* Stepper Header (Steps 1 to 3) */}
      {step < 4 && <UIFStepper currentStep={step} />}

      <div className="mt-8">
        {step === 1 && (
          <UIFEmploymentStep
            input={input}
            errors={errors}
            onChange={handleChange}
            onNext={handleNextFromStep1}
          />
        )}

        {step === 2 && (
          <UIFIncomeStep
            input={input}
            errors={errors}
            onChange={handleChange}
            onNext={handleNextFromStep2}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <UIFHistoryStep
            input={input}
            isCalculating={isCalculating}
            onCalculate={handleCalculate}
            onBack={() => setStep(2)}
          />
        )}

        {step === 4 && result && (
          <UIFResult
            result={result}
            input={input}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}
