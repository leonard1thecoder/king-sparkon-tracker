export type BillingPlan = {
  plan: "FREE_TRIAL" | "PLUS" | "PRO";
  displayName: string;
  monthlyPrice: number;
  currency: string;
  maxWorkers: number;
  unlimitedWorkers: boolean;
  workerTipsPlatform: boolean;
  businessAnalysisAi: boolean;
  workerClocker: boolean;
  features: string[];
};

export type BillingDashboard = {
  businessId: number;
  businessName: string;
  currentPlan: "FREE_TRIAL" | "PLUS" | "PRO";
  businessStatus: string;
  trial?: boolean;
  trialDaysLeft?: number;
  showUpgradeButtons?: boolean;
};
