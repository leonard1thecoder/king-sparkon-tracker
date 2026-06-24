export type UserRole = "Owner" | "Worker" | (string & {});
export type ProductCategory = "Alcohol" | "NonAlcohol";
export type ProductStatus = "CREATED" | "PENDING_APPROVAL";
export type TransactionType = "BUY" | "SELL";
export type ProductBarcodeStatus = "NOT_CLAIMED" | "CLAIMED" | "EXPIRED" | "NOT_CLAIMABLE";
export type BusinessPlan = "FREE_TRIAL" | "PLUS" | "PRO";
export type BillingInterval = "MONTHLY" | "YEARLY";
export type SubscriptionPaymentStatus =
  | "CREATED"
  | "APPROVAL_PENDING"
  | "ACTIVE"
  | "PAYMENT_FAILED"
  | "EXPIRED"
  | "CANCELLED";

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface RegisterRequest {
  username: string;
  emailAddress: string;
  password: string;
  businessName: string;
  localizationCountry: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface ForgotPasswordRequest {
  emailAddress: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResendEmailVerificationRequest {
  emailAddress: string;
}

export interface MessageResponse {
  message: string;
}

export interface TrackerUser {
  id: number;
  username: string;
  emailAddress: string;
  createdDate: string;
  modifiedDate: string;
  privilege: UserRole;
  businessId?: number | null;
  businessName?: string | null;
  localizationCountry?: string | null;
}

export interface AuthResponse {
  tokenType: "Bearer";
  expiresAt: string;
  user: TrackerUser;
}

export interface MoneyResponse {
  amount: number;
  currency: string;
  formatted?: string;
}

export interface ProductBarcode {
  id?: number;
  barcode: string;
  referencee?: string | null;
  status?: ProductBarcodeStatus;
}

export interface Product {
  id: number;
  businessId?: number | null;
  businessName?: string | null;
  name: string;
  category: ProductCategory;
  status?: ProductStatus;
  price: number;
  salePrice?: number;
  baseCurrency?: string;
  localizedPrice?: MoneyResponse;
  localizedSalePrice?: MoneyResponse;
  returnableEnabled?: boolean;
  returnablePrice?: number | null;
  localizedReturnablePrice?: MoneyResponse;
  nightShiftEnabled?: boolean;
  nightShiftPrice?: number | null;
  localizedNightShiftPrice?: MoneyResponse;
  nightShiftStartTime?: string | null;
  nightShiftEndTime?: string | null;
  bottleReturnable?: boolean;
  stockQuantity: number;
  barcodes?: ProductBarcode[];
  barcodeCount?: number;
  remainingBarcodeSlots?: number;
}

export interface ProductCreateRequest {
  name: string;
  category: ProductCategory;
  price: number;
  returnableEnabled: boolean;
  returnablePrice: number;
  nightShiftEnabled: boolean;
  nightShiftPrice: number;
  nightShiftStartTime: string | null;
  nightShiftEndTime: string | null;
  stockQuantity: number;
}

export interface AddBarcodeRequest {
  barcode: string;
  referencee?: string;
}

export interface TransactionItemRequest {
  productId: number;
  quantity: number;
  unitPrice?: number;
  barcodes?: string[];
}

export interface TransactionRequest {
  type: TransactionType;
  employeeId: number;
  ownerId: number;
  items: TransactionItemRequest[];
}

export interface TransactionItem {
  id?: number;
  productId: number;
  productName?: string;
  quantity: number;
  unitPrice: number;
  barcodes?: string[];
}

export interface Transaction {
  id: number;
  date: string;
  type: TransactionType;
  businessId?: number | null;
  businessName?: string | null;
  status?: string;
  employeeId: number;
  ownerId: number;
  items: TransactionItem[];
}

export interface InventorySummary {
  totalProducts: number;
  alcoholProducts: number;
  nonAlcoholProducts: number;
  totalStockQuantity: number;
  totalStockValue: number;
  lowStockProducts: number;
}

export interface CategoryReport {
  from?: string | null;
  to?: string | null;
  boughtQuantity: number;
  soldQuantity: number;
  boughtValue: number;
  soldValue: number;
}

export interface ProductMovement {
  productId: number;
  productName: string;
  category: ProductCategory;
  barcodes?: string[];
  boughtQuantity: number;
  soldQuantity: number;
  boughtValue: number;
  soldValue: number;
}

export interface ProductBarcodeLookup {
  id: number;
  barcode: string;
  referencee?: string | null;
  status: ProductBarcodeStatus;
  productId: number;
  productName: string;
  productCategory: ProductCategory;
  returnableEnabled?: boolean;
  bottleReturnable: boolean;
}

export interface AuditLog {
  id: number;
  businessId?: number | null;
  businessName?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  actorUsername: string;
  details: string;
  createdAt: string;
}

export interface BillingPlanResponse {
  plan: BusinessPlan;
  displayName: string;
  monthlyPrice: number;
  currency: string;
  maxWorkers: number;
  unlimitedWorkers: boolean;
  unlimitedProducts: boolean;
  unlimitedBarcodeScanning: boolean;
  workerTipsPlatform: boolean;
  businessAnalysisAi: boolean;
  workerClocker: boolean;
  features: string[];
}

export interface BusinessBillingResponse {
  businessId: number;
  businessName: string;
  businessPlan: BusinessPlan;
  businessStatus: string;
  trialStartDate?: string | null;
  trialEndDate?: string | null;
  currentBillingPeriodStartDate?: string | null;
  currentBillingPeriodEndDate?: string | null;
  paypalSubscriptionId?: string | null;
  subscriptionId?: number | null;
  billingInterval?: BillingInterval | null;
  termYears?: number | null;
  amount?: number | null;
  currency?: string | null;
  paymentStatus?: SubscriptionPaymentStatus | null;
  paypalApprovalUrl?: string | null;
  stripeCheckoutUrl?: string | null;
  stripeSubscriptionId?: string | null;
}

export interface StripeCheckoutSessionResponse {
  subscriptionId?: number | null;
  checkoutSessionId: string;
  checkoutUrl: string;
  paymentStatus?: SubscriptionPaymentStatus | null;
}

export interface BillingDashboardResponse {
  businessId: number;
  businessName: string;
  currentPlan: BusinessPlan;
  businessStatus: string;
  paymentStatus?: SubscriptionPaymentStatus | null;
  trial: boolean;
  trialDaysLeft: number;
  trialEndDate?: string | null;
  currentBillingPeriodEndDate?: string | null;
  deactivated: boolean;
  showDeactivatedOverlay: boolean;
  showUpgradeButtons: boolean;
  canUseProducts: boolean;
  canUseBarcodeScanning: boolean;
  canUseWorkerTipsPlatform: boolean;
  canUseBusinessAnalysisAi: boolean;
  canUseWorkerClocker: boolean;
  availablePlans: BillingPlanResponse[];
}

export interface SubscriptionRequest {
  plan: Exclude<BusinessPlan, "FREE_TRIAL">;
  billingInterval: BillingInterval;
  termYears?: number;
}
