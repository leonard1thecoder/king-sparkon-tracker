// Mobile backend contracts — mirrors web `src/lib/types/backend.ts`.
// Backend remains source of truth. Keep field names identical.

export type UserRole = "Owner" | "Worker" | "Affiliate" | "Admin" | "User" | "Artist";
export type PaymentType = "CASH" | "SWIPE_MACHINE" | "WEBSITE_PAYMENT";
export type TransactionType = "BUY" | "SELL";

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
};

export type Product = {
  id: number;
  businessId?: number | null;
  businessName?: string | null;
  name: string;
  productBarcode?: string | null;
  category: string;
  status?: string;
  price: number;
  salePrice?: number;
  stockQuantity: number;
  productImageUrl?: string | null;
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
  items: TransactionItemPayload[];
};

export type TuckShopPurchaseItem = {
  productId: number;
  productName: string;
  productImageUrl?: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type TuckShopPurchase = {
  transactionId: number;
  businessName?: string | null;
  productTotal: number;
  paymentStatus?: string | null;
  paymentReference?: string | null;
  paymentUrl?: string | null;
  fulfilmentStatus?: string | null;
  collectionQrCodeValue?: string | null;
  items: TuckShopPurchaseItem[];
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
  paymentReference?: string | null;
  paymentUrl?: string | null;
};

export type TicketTypeEntry = {
  type: string;
  price: number;
  capacity: number;
  sold: number;
  available: number;
};

export type TicketEvent = {
  id: string;
  name: string;
  venue?: string | null;
  eventDate: string;
  eventTime: string;
  status: string;
  ticketTypes: TicketTypeEntry[];
};

export type UserTicket = {
  id: string;
  eventId: string;
  eventName?: string | null;
  ticketType: string;
  pricePaid: number;
  purchasedAt: string;
  usedAt?: string;
};

export function getUserRoles(user: TrackerUser | null): string[] {
  if (!user) return [];
  const roles = [...(user.roles ?? [])];
  if (user.privilege && !roles.includes(user.privilege)) roles.push(user.privilege);
  return roles;
}

export function isWorkerLike(user: TrackerUser | null): boolean {
  return getUserRoles(user).some((r) => ["Worker", "Owner", "Admin"].includes(r));
}

export function normalizeList<T>(value: PageResponse<T> | T[] | null | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : (value.content ?? []);
}
