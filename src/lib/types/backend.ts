export type UserRole = "Owner" | "Worker" | "Affiliate" | "Admin" | "User" | "Artist";
export type BusinessPlan = "FREE_TRIAL" | "PLUS" | "PRO";
export type PaymentType = "CASH" | "SWIPE_MACHINE" | "WEBSITE_PAYMENT";
export type TransactionType = "BUY" | "SELL";
export type PromotionChannel = "EMAIL" | "WHATSAPP" | "ANY";
export type PromotionAudience = "ALL_SUBSCRIBERS" | "REGISTERED_AFFILIATES" | "UNREGISTERED_AFFILIATES" | "REGISTERED_SUBSCRIBERS";
export type WorkplaceType = "ONSITE" | "REMOTE" | "HYBRID";
export type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" | "TEMPORARY";
export type ExperienceLevel = "ENTRY_LEVEL" | "JUNIOR" | "MID_LEVEL" | "SENIOR" | "LEAD" | "EXECUTIVE";
export type JobOpportunityStatus = "DRAFT" | "OPEN" | "CLOSED" | "ARCHIVED";
export type JobApplicationStatus = "SUBMITTED" | "VIEWED" | "REJECTED" | "ACCEPTED" | "INTERVIEW_BOOKED" | "WITHDRAWN";

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
  jobTitle?: string | null;
  cellphoneNumber?: string | null;
  staffDiscountPercentage?: number | null;
};

export type ProductBarcode = {
  id?: number;
  barcode: string;
  unitCode?: string;
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
  productBarcode?: string | null;
  barcodeCatalogId?: number | null;
  productImageUrl?: string | null;
  category: "Alcohol" | "NonAlcohol" | string;
  status?: string;
  price: number;
  salePrice?: number;
  staffPrice?: number | null;
  staffDiscountPercent?: number | null;
  discountPercent?: number | null;
  saleStartsAt?: string | null;
  saleEndsAt?: string | null;
  localizedPrice?: MoneyResponse | null;
  localizedSalePrice?: MoneyResponse | null;
  localizedStaffPrice?: MoneyResponse | null;
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
  emptiesReturned?: number;
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
  transactionItemId?: number;
  productId: number;
  productName: string;
  productImageUrl?: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  barcodes?: string[];
  emptiesReturned?: number;
  depositUnitPrice?: number;
  depositTotal?: number;
  emptiesCreditTotal?: number;
  netLineTotal?: number;
  refunded?: boolean;
};

export type RefundKind = "PRODUCT_ITEM" | "TICKET";

export type RefundStatus = "REQUESTED" | "APPROVED" | "REJECTED";

export type RefundRequest = {
  id: number;
  kind: RefundKind;
  transactionId?: number | null;
  transactionItemId?: number | null;
  userTicketId?: string | null;
  eventId?: string | null;
  productName?: string | null;
  quantity?: number | null;
  grossAmount: number;
  feeAmount: number;
  netAmount: number;
  status: RefundStatus;
  requestedAt?: string | null;
  requestedByUsername?: string | null;
  decidedAt?: string | null;
  decidedByUsername?: string | null;
  rejectReason?: string | null;
};

export type TuckShopPurchase = {
  transactionId: number;
  businessId?: number | null;
  businessName?: string | null;
  workerId?: number | null;
  ownerId?: number | null;
  productTotal: number;
  depositTotal?: number;
  emptiesCreditTotal?: number;
  netTotal?: number;
  paymentStatus?: string | null;
  paymentType?: PaymentType | string | null;
  paymentReference?: string | null;
  paymentUrl?: string | null;
  paymentQrCodeUrl?: string | null;
  tip?: Tip | null;
  createdAt?: string;
  items: TuckShopPurchaseItem[];
  customerId?: number | null;
  customerUsername?: string | null;
  fulfilmentStatus?: string | null;
  barcodesRequired?: number;
  collectionQrCodeValue?: string | null;
  collectionQrCodeUrl?: string | null;
  collectionReadyAt?: string | null;
  collectedAt?: string | null;
  preparedByWorkerId?: number | null;
};

export type EmbeddedCartTicketItem = {
  eventId: string;
  ticketType: "REGULAR" | "VIP" | "VVIP" | string;
  quantity: number;
};

export type CreateEmbeddedCartPaymentPayload = {
  idempotencyKey: string;
  buyerName: string;
  buyerEmail: string;
  products: TuckShopPurchaseItemPayload[];
  tickets: EmbeddedCartTicketItem[];
  tips?: EmbeddedCartTipItem[];
  services?: EmbeddedCartServiceItem[];
};

export type EmbeddedCartTipItem = {
  workerId: number;
  tipAmount: number;
};

export type EmbeddedCartServiceItem = {
  kind: "BASIC_CARE" | "PERFORMANCE_CARE" | "BUSINESS_CARE" | "MARKETPLACE_HUB" | "COOLER_BOX" | "DEV_HUB" | "ARTIST_BOOKING";
  referenceId: string;
  label?: string;
  amount: number;
};

export type ReturnableRefundStatus = "REQUESTED" | "APPROVED" | "REJECTED";

export type ReturnableRefund = {
  id: number;
  transactionId: number;
  transactionItemId: number;
  productId: number;
  productName: string;
  quantity: number;
  depositUnitPrice: number;
  amount: number;
  status: ReturnableRefundStatus;
  requestedAt?: string | null;
  requestedByUsername?: string | null;
  decidedAt?: string | null;
  decidedByUsername?: string | null;
  rejectReason?: string | null;
};

export type CreateReturnableRefundPayload = {
  transactionId: number;
  transactionItemId: number;
  quantity: number;
};

export type PayFastCartPayment = {
  paymentId: number;
  merchantPaymentId: string;
  processUrl: string;
  fields: Record<string, string>;
  amount: number;
  currency: string;
  status: string;
};

export type PayFastCartPaymentStatus = {
  paymentId: number;
  merchantPaymentId: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  fulfilled: boolean;
  productPurchases: TuckShopPurchase[];
  ticketPaymentIds: string[];
  message: string;
};

export type PayFastFormResponse = {
  merchantPaymentId: string;
  processUrl: string;
  fields: Record<string, string>;
  amount: number;
  currency: string;
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

export type JobApplicationType = "INTERNAL" | "EXTERNAL";

export type JobOpportunity = {
  id: number;
  title: string;
  companyName: string;
  businessId?: number | null;
  createdByUserId?: number | null;
  location: string;
  workplaceType: WorkplaceType;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  description: string;
  responsibilities?: string | null;
  requirements: string;
  benefits?: string | null;
  applyUrl?: string | null;
  contactEmail?: string | null;
  applicationType: JobApplicationType;
  status: JobOpportunityStatus;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
  closedAt?: string | null;
};

export type CreateJobOpportunityPayload = {
  title: string;
  companyName: string;
  location: string;
  workplaceType: WorkplaceType;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  description: string;
  responsibilities?: string;
  requirements: string;
  benefits?: string;
  applyUrl?: string;
  contactEmail?: string;
  applicationType: JobApplicationType;
};

export type JobApplication = {
  id: number;
  jobOpportunityId?: number;
  jobTitle?: string;
  companyName?: string;
  applicantUserId?: number;
  applicantName: string;
  applicantEmail: string;
  phoneNumber?: string | null;
  coverMessage?: string | null;
  cvUrl?: string | null;
  status: JobApplicationStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type ApplyForJobPayload = {
  applicantName: string;
  applicantEmail: string;
  phoneNumber?: string;
  coverMessage?: string;
  cvUrl?: string;
};

// ─── Subscriber Import ─────────────────────────────────────────────────────────

export type SubscriberType =
  | "KINGSPARKON_SUBSCRIBER"
  | "CLIENT"
  | "FREE_USER"
  | "BUSINESS_OWNER"
  | "AFFILIATE"
  | "DEV_HUB_CLIENT";

export type SubscriberImportError = {
  row: number;
  contact: string;
  message: string;
};

export type SubscriberImportResponse = {
  filename: string;
  totalRows: number;
  processedRows: number;
  created: number;
  reactivated: number;
  duplicates: number;
  failed: number;
  errors: SubscriberImportError[];
};

// ─── Artist & Worker dashboards (mall + tickets) ─────────────────────────────

export type ArtistDashboardStats = {
  upcomingBookings: number;
  pendingRequests: number;
  thisMonthPerformances: number;
  minimumFee: number;
  mallProductsAvailable: number;
  mallMyPurchases: number;
  ticketsUpcomingEvents: number;
  ticketsMyTickets: number;
};

export type WorkerDashboardStats = {
  workerId: number;
  username: string;
  jobTitle?: string | null;
  businessId?: number | null;
  businessName?: string | null;
  staffDiscountPercentage: number;
  staffPriceEnabled: boolean;
  mallProductsAvailable: number;
  mallMyPurchases: number;
  ticketsUpcomingEvents: number;
  ticketsMyTickets: number;
  transactionsHandled: number;
  tipsReceived: number;
};

export type CreateWorkerPayload = {
  username: string;
  emailAddress: string;
  password: string;
  cellphoneNumber: string;
  jobTitle: string;
  tipQrCodeEnabled: boolean;
  profilePictureUrl?: string | null;
  staffDiscountPercentage?: number | null;
};

export type ArtistBookingStatusResponse = {
  status: string;
  eventId?: string | null;
} | null;

// ─── Artist events + hospitality rider ─────────────────────────────────────

export type BackendArtistEvent = {
  id: string;
  businessId?: number | null;
  ownerId?: string | null;
  title: string;
  description: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  location: string;
  venue: string;
  imageUrl?: string | null;
  artistType?: string | null;
  bookingFee: number;
  performanceDuration?: number | null;
  status: string;
  aboutHost?: string | null;
  businessName?: string | null;
  businessLogoUrl?: string | null;
  riderAvailable: boolean;
  riderAmount: number;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type CreateArtistEventPayload = {
  title: string;
  description: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  location: string;
  venue: string;
  imageUrl?: string | null;
  artistType?: string | null;
  bookingFee?: number | null;
  performanceDuration?: number | null;
  aboutHost?: string | null;
  riderAvailable?: boolean;
  riderAmount?: number | null;
};

export type UpdateArtistEventPayload = Partial<CreateArtistEventPayload> & {
  status?: string | null;
};

export type RiderItem = {
  id: number;
  productId?: number | null;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  transactionId?: number | null;
  createdAt?: string | null;
};

export type RiderStatus = {
  eventId: string;
  riderAvailable: boolean;
  riderAmount: number;
  spentAmount: number;
  remainingAmount: number;
  items: RiderItem[];
};

export type RiderRedemption = {
  id: number;
  eventId: string;
  productId?: number | null;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  transactionId?: number | null;
  remainingAmount: number;
  createdAt?: string | null;
};

export type ArtistRiderSpend = {
  artistId: number;
  artistName: string;
  spentAmount: number;
  itemCount: number;
};

export type EventRiderSummary = {
  eventId: string;
  riderAvailable: boolean;
  riderAmount: number;
  totalSpent: number;
  perArtist: ArtistRiderSpend[];
};

