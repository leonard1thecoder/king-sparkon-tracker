export type UserRole = "Owner" | "Worker" | "Affiliate" | "Admin";
export type BusinessPlan = "FREE_TRIAL" | "PLUS" | "PRO";
export type PaymentType = "CASH" | "SWIPE_MACHINE" | "WEBSITE_PAYMENT";
export type TransactionType = "BUY" | "SELL";
export type PromotionChannel = "EMAIL" | "WHATSAPP" | "ANY";
export type PromotionAudience = "ALL_SUBSCRIBERS" | "REGISTERED_AFFILIATES" | "UNREGISTERED_AFFILIATES" | "REGISTERED_SUBSCRIBERS";

export type PageResponse<T> = {
  content: T[];
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
  first?: boolean;
  last?: boolean;
};

export type TrackerUser = {
  id: number;
  username: string;
  emailAddress: string;
  privilege?: UserRole | string;
  roles?: UserRole[] | string[];
  businessId?: number | null;
  businessName?: string | null;
  emailVerified?: boolean;
  affiliateCode?: string | null;
  affiliatePromotionUrl?: string | null;
  affiliateQrCodeUrl?: string | null;
  tipQrCodeUrl?: string | null;
};

export type ProductBarcode = {
  id?: number;
  barcode: string;
  referenceEmail?: string | null;
  referencee?: string | null;
  status?: string;
};

export type Product = {
  id: number;
  name: string;
  category: "Alcohol" | "NonAlcohol" | string;
  status?: string;
  price: number;
  stockQuantity: number;
  barcodes?: Array<string | ProductBarcode>;
  barcodeCount?: number;
  remainingBarcodeSlots?: number;
};

export type TransactionItemPayload = {
  productId: number;
  quantity: number;
  barcodes?: string[];
};

export type TransactionPayload = {
  type: TransactionType;
  paymentType?: PaymentType;
  paymentEmail?: string;
  paymentContact?: string;
  employeeId?: number;
  ownerId?: number;
  items: TransactionItemPayload[];
};

export type Transaction = TransactionPayload & {
  id: number;
  date?: string;
  status?: string;
  paymentStatus?: string | null;
  paymentReference?: string | null;
  paymentUrl?: string | null;
};

export type TipPayload = {
  workerId: number;
  tipAmount: number;
  callbackUrl: string;
  clientContact?: string;
};

export type Tip = TipPayload & {
  id: number;
  status?: string;
  grossAmount?: number;
  feeAmount?: number;
  netAmount?: number;
  paymentReference?: string | null;
  paymentUrl?: string | null;
  qrCodeUrl?: string | null;
};

export type Withdrawal = {
  id: number;
  grossAmount: number;
  feeAmount: number;
  netAmount: number;
  status: string;
  createdAt?: string;
};

export type PromotionPayload = {
  title: string;
  message: string;
  landingUrl?: string;
  channel: PromotionChannel;
  audience: PromotionAudience;
  scheduledFor?: string;
};

export type PromotionQuote = {
  targetCount: number;
  bulkPrice: number;
  currency?: string;
};

export type Promotion = PromotionPayload & PromotionQuote & {
  id: number;
  status?: string;
};
