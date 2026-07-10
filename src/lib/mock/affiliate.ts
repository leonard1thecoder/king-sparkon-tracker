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

export const affiliateMockProfile: AffiliateProfileView = {
  name: "Sizolwakhe Mthimunye",
  email: "affiliate.preview@kingsparkon.co.za",
  code: "SPARK-AFF-2048",
  referralUrl: "https://king-sparkon-tracker.vercel.app/register?ref=SPARK-AFF-2048",
  qrCodeUrl: null,
  status: "ACTIVE",
  joinedAt: "2026-05-12T09:30:00+02:00",
};

export const affiliateMockReferrals: AffiliateReferralRow[] = [
  { id: 5101, businessName: "Ubuntu Corner Store", contactName: "Nandi Mokoena", source: "WhatsApp", clicks: 84, signups: 5, status: "CONVERTED", createdAt: "2026-07-09T14:20:00+02:00", estimatedValue: 1495 },
  { id: 5102, businessName: "Jozi Event Crew", contactName: "Thabo Nkosi", source: "QR poster", clicks: 61, signups: 3, status: "TRIAL", createdAt: "2026-07-08T10:15:00+02:00", estimatedValue: 897 },
  { id: 5103, businessName: "Cape Fresh Market", contactName: "Ayesha Jacobs", source: "LinkedIn", clicks: 43, signups: 2, status: "QUALIFIED", createdAt: "2026-07-07T16:45:00+02:00", estimatedValue: 598 },
  { id: 5104, businessName: "Soweto Mobile Bar", contactName: "Kagiso Molefe", source: "Instagram", clicks: 35, signups: 1, status: "CONTACTED", createdAt: "2026-07-06T18:05:00+02:00", estimatedValue: 299 },
  { id: 5105, businessName: "Durban Ticket Hub", contactName: "Lindiwe Dlamini", source: "Email", clicks: 29, signups: 2, status: "CONVERTED", createdAt: "2026-07-05T11:25:00+02:00", estimatedValue: 598 },
  { id: 5106, businessName: "Pretoria Campus Shop", contactName: "Refilwe Maseko", source: "Direct link", clicks: 22, signups: 1, status: "TRIAL", createdAt: "2026-07-04T09:10:00+02:00", estimatedValue: 299 },
  { id: 5107, businessName: "Maboneng Pop-up", contactName: "Sipho Zulu", source: "QR card", clicks: 18, signups: 0, status: "CLICKED", createdAt: "2026-07-03T13:35:00+02:00", estimatedValue: 0 },
];

export const affiliateMockAssets: AffiliateAssetRow[] = [
  { id: 6101, title: "WhatsApp business opener", channel: "WhatsApp", format: "Short message", copy: "Hi! I’m sharing King Sparkon Tracker — a barcode, QR, stock, tips and ticket operations platform built for modern businesses.", callToAction: "Open my referral link to create your workspace.", status: "READY", updatedAt: "2026-07-09T08:00:00+02:00" },
  { id: 6102, title: "Retail owner pitch", channel: "LinkedIn", format: "Social post", copy: "Stop losing visibility between products, workers and payments. King Sparkon Tracker brings barcode inventory, QR workflows and business dashboards into one operating system.", callToAction: "Book a walkthrough through my affiliate link.", status: "READY", updatedAt: "2026-07-08T15:30:00+02:00" },
  { id: 6103, title: "Event QR campaign", channel: "Print / QR", format: "Poster copy", copy: "Scan to discover smarter ticket verification, QR access control and real-time event operations with King Sparkon Tracker.", callToAction: "Scan the QR and register today.", status: "READY", updatedAt: "2026-07-08T10:20:00+02:00" },
  { id: 6104, title: "Instagram product story", channel: "Instagram", format: "Story caption", copy: "One scan. Clear stock. Faster checkout. Better business decisions. 👑📦", callToAction: "Tap the link to start your King Sparkon workspace.", status: "DRAFT", updatedAt: "2026-07-07T17:10:00+02:00" },
  { id: 6105, title: "Worker tips campaign", channel: "Facebook", format: "Campaign post", copy: "Help service workers receive transparent digital tips through secure worker QR codes and tracked payout records.", callToAction: "See how worker tips work through my referral page.", status: "READY", updatedAt: "2026-07-06T12:40:00+02:00" },
];

export const affiliateMockCommissions: AffiliateCommissionRow[] = [
  { id: 7101, reference: "COM-2026-0710-01", businessName: "Ubuntu Corner Store", rate: 12, amount: 179.4, status: "APPROVED", earnedAt: "2026-07-10T08:25:00+02:00" },
  { id: 7102, reference: "COM-2026-0709-02", businessName: "Durban Ticket Hub", rate: 12, amount: 71.76, status: "PENDING", earnedAt: "2026-07-09T16:40:00+02:00" },
  { id: 7103, reference: "COM-2026-0708-03", businessName: "Jozi Event Crew", rate: 10, amount: 89.7, status: "APPROVED", earnedAt: "2026-07-08T12:05:00+02:00" },
  { id: 7104, reference: "COM-2026-0707-04", businessName: "Cape Fresh Market", rate: 10, amount: 59.8, status: "PENDING", earnedAt: "2026-07-07T18:15:00+02:00" },
  { id: 7105, reference: "COM-2026-0705-05", businessName: "Braamfontein Foods", rate: 12, amount: 155.88, status: "PAID", earnedAt: "2026-07-05T11:50:00+02:00" },
  { id: 7106, reference: "COM-2026-0702-06", businessName: "Sandton Pop-up Market", rate: 10, amount: 69.9, status: "PAID", earnedAt: "2026-07-02T14:10:00+02:00" },
];

export const affiliateMockPayouts: AffiliatePayoutRow[] = [
  { id: 8101, reference: "PAY-AFF-2026-0708", amount: 225.78, provider: "PayPal", status: "PAID", requestedAt: "2026-07-08T09:00:00+02:00", paidAt: "2026-07-08T15:32:00+02:00" },
  { id: 8102, reference: "PAY-AFF-2026-0701", amount: 310.5, provider: "PayPal", status: "PAID", requestedAt: "2026-07-01T10:20:00+02:00", paidAt: "2026-07-01T16:05:00+02:00" },
  { id: 8103, reference: "PAY-AFF-2026-0624", amount: 184.2, provider: "PayPal", status: "PAID", requestedAt: "2026-06-24T08:45:00+02:00", paidAt: "2026-06-24T14:18:00+02:00" },
  { id: 8104, reference: "PAY-AFF-2026-0710", amount: 400.66, provider: "PayPal", status: "PROCESSING", requestedAt: "2026-07-10T09:12:00+02:00", paidAt: null },
];
