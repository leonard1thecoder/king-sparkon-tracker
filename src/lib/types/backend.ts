export type UserRole = "Owner" | "Worker" | "Affiliate" | "Admin" | "User";
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
  availabilityStatus?: string;
};

export type Product = {
  id: number;
  businessId?: number | null;
  businessName?: string | null;
  name: string;
  productImageUrl?: string | null;
  category: "Alcohol" | "NonAlcohol" | string;
  status?: string;
  price: number;
  salePrice?: number;
  localizedPrice?: MoneyResponse | null;
  localizedSalePrice?: MoneyResponse | null;
  stockQuantity: number;
  barcodes?: Array<string | ProductBarcode>;
  barcodeCount?: number;
  remainingBarcodeSlots?: number;
  returnableEnabled?: boolean;
  returnablePrice?: number;
  nightShiftEnabled?: boolean;
  nightShiftPrice?: number;
};

export type MoneyResponse = {
  amount: number;
  currency?: string;
  formatted?: string;
};

export type CreateProductPayload = {
  name: string;
  category: string;
  price: number;
  returnableEnabled: boolean;
  returnablePrice?: number | null;
  nightShiftEnabled: boolean;
  nightShiftPrice?: number | null;
  nightShiftStartTime?: string | null;
  nightShiftEndTime?: string | null;
  stockQuantity: number;
  productImageUrl?: string | null;
};

export type ProductImageUpdatePayload = {
  productImageUrl: string;
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

export type TuckShopPurchaseItemPayload = {
  productId: number;
  quantity: number;
  barcodes?: string[];
};

export type CreateTuckShopPurchasePayload = {
  paymentEmail?: string;
  paymentContact?: string;
  workerId?: number | null;
  tipAmount?: number | null;
  tipCallbackUrl?: string | null;
  items: TuckShopPurchaseItemPayload[];
};

export type TuckShopPurchaseItem = {
  productId: number;
  productName: string;
  productImageUrl?: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  barcodes?: string[];
};

export type TuckShopPurchase = {
  transactionId: number;
  businessId?: number | null;
  businessName?: string | null;
  workerId?: number | null;
  ownerId?: number | null;
  productTotal: number;
  paymentStatus?: string | null;
  paymentType?: PaymentType | string | null;
  paymentReference?: string | null;
  paymentUrl?: string | null;
  paymentQrCodeUrl?: string | null;
  tip?: Tip | null;
  createdAt?: string;
  items: TuckShopPurchaseItem[];
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
