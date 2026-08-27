/**
 * South African UIF Act Constants
 */

// Monthly remuneration ceiling subject to UIF contributions & benefits
export const UIF_MAX_MONTHLY_CEILING = 17712;

// Maximum benefit duration days (365 days = ~12 months for 4+ years of service)
// For shorter employment periods, credits accrue at 1 day for every 4 days worked (or ~1 month benefit per 4 months worked).
export const UIF_MAX_CREDIT_DAYS = 365;

// Standard Income Replacement Rate (IRR) range: 38% to 60%
// Scale: 60% for lowest earners, sliding down to ~38% at the ceiling.
// Average median calculation rate ~ 45%-50%
export const UIF_BASE_IRR = 0.45;

export const TERMINATION_REASON_LABELS: Record<string, string> = {
  RETRENCHED: "Retrenched",
  CONTRACT_ENDED: "Contract ended",
  DISMISSED: "Dismissed",
  RESIGNED: "Resigned",
  OTHER: "Other",
};
