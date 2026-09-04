export type AffiliateProfileView = {
  name: string;
  email: string;
  code: string;
  referralUrl: string;
  qrCodeUrl?: string | null;
  status: string;
  joinedAt: string;
};

export type AffiliateReferralRow = {
  id: number;
  businessName: string;
  contactName: string;
  source: string;
  clicks: number;
  signups: number;
  status: string;
  createdAt: string;
  estimatedValue: number;
};

export type AffiliateAssetRow = {
  id: number;
  title: string;
  channel: string;
  format: string;
  copy: string;
  callToAction: string;
  status: string;
  updatedAt: string;
};

export type AffiliateCommissionRow = {
  id: number;
  reference: string;
  businessName: string;
  rate: number;
  amount: number;
  status: string;
  earnedAt: string;
};

export type AffiliatePayoutRow = {
  id: number;
  reference: string;
  amount: number;
  provider: string;
  status: string;
  requestedAt: string;
  paidAt?: string | null;
};
