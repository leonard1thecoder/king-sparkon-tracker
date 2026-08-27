import type { UIFCalculatorInput, UIFValidationErrors } from "./uif.types";

export function validateUIFStep1(input: Partial<UIFCalculatorInput>): UIFValidationErrors {
  const errors: UIFValidationErrors = {};

  if (!input.employmentStartDate) {
    errors.employmentStartDate = "Employment start date is required.";
  }

  if (!input.employmentEndDate) {
    errors.employmentEndDate = "Employment end date is required.";
  } else if (input.employmentStartDate && new Date(input.employmentEndDate) < new Date(input.employmentStartDate)) {
    errors.employmentEndDate = "End date cannot be before your employment start date.";
  }

  if (!input.terminationReason) {
    errors.terminationReason = "Please select a reason why your employment ended.";
  } else if (input.terminationReason === "OTHER" && !input.otherTerminationReason?.trim()) {
    errors.otherTerminationReason = "Please specify your reason for employment termination.";
  }

  return errors;
}

export function validateUIFStep2(input: Partial<UIFCalculatorInput>): UIFValidationErrors {
  const errors: UIFValidationErrors = {};

  if (!input.monthlySalary || input.monthlySalary <= 0) {
    errors.monthlySalary = "Please enter a valid monthly gross salary greater than 0.";
  }

  if (input.salaryChanged && input.salaryHistory) {
    const historyErrors: Record<number, string> = {};
    input.salaryHistory.forEach((entry, idx) => {
      if (entry.grossSalary < 0 || isNaN(entry.grossSalary)) {
        historyErrors[idx] = "Salary cannot be negative.";
      }
    });
    if (Object.keys(historyErrors).length > 0) {
      errors.salaryHistory = historyErrors;
    }
  }

  return errors;
}
