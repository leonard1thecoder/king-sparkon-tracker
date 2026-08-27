export type TerminationReason =
  | "RETRENCHED"
  | "CONTRACT_ENDED"
  | "DISMISSED"
  | "RESIGNED"
  | "OTHER";

export type SalaryHistoryEntry = {
  month: string;
  grossSalary: number;
};

export type UIFCalculatorInput = {
  employmentStartDate: string;
  employmentEndDate: string;
  terminationReason: TerminationReason;
  otherTerminationReason?: string;
  monthlySalary: number;
  salaryChanged: boolean;
  salaryHistory?: SalaryHistoryEntry[];
};

export type UIFCalculationResult = {
  monthlySalaryAverage: number;
  cappedSalary: number;
  monthlyBenefit: number;
  dailyRate: number;
  totalCreditDays: number;
  durationMonths: number;
  totalBenefit: number;
  totalEmploymentMonths: number;
  yearsMonthsString: string;
  startDateFormatted: string;
  endDateFormatted: string;
  terminationReasonLabel: string;
};

export type UIFValidationErrors = {
  employmentStartDate?: string;
  employmentEndDate?: string;
  terminationReason?: string;
  otherTerminationReason?: string;
  monthlySalary?: string;
  salaryHistory?: Record<number, string>;
};
