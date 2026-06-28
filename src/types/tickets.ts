export type TicketType = "REGULAR" | "VIP" | "VVIP";

export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";

export type TicketStatus = "ACTIVE" | "USED" | "CANCELLED" | "EXPIRED";

export type TicketRole = "USER" | "OWNER" | "WORKER" | "ADMIN";

export interface TicketEvent {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  location: string;
  eventDate: string;
  eventTime: string;
  bannerUrl?: string;
  status: EventStatus;
  ticketTypes: EventTicketType[];
  createdAt: string;
  updatedAt: string;
}

export interface EventTicketType {
  id: string;
  eventId: string;
  type: TicketType;
  price: number;
  capacity: number;
  sold: number;
  available: number;
}

export interface UserTicket {
  id: string;
  eventId: string;
  userId: string;
  buyerName: string;
  buyerEmail: string;
  ticketType: TicketType;
  pricePaid: number;
  qrCodeValue: string;
  ticketReference: string;
  status: TicketStatus;
  purchasedAt: string;
  usedAt?: string;
  scannedByWorkerId?: string;
}

export interface TicketPurchaseRequest {
  eventId: string;
  ticketType: TicketType;
  quantity: number;
  buyerName: string;
  buyerEmail: string;
}

export interface TicketVerificationResult {
  valid: boolean;
  message: string;
  ticket?: UserTicket;
  event?: TicketEvent;
}

export interface TicketSession {
  id: string;
  name: string;
  email: string;
  roles: TicketRole[];
}

export interface TicketTotals {
  totalCapacity: number;
  totalSold: number;
  totalAvailable: number;
}

export interface OwnerTicketDashboard extends TicketTotals {
  totalEvents: number;
  ticketsSold: number;
  revenue: number;
  upcomingEvents: number;
  regularSold: number;
  vipSold: number;
  vvipSold: number;
  ticketWithdrawalFeePercent?: number;
  availableWithdrawalBalance?: number;
}

export interface CreateTicketEventPayload {
  ownerId?: string;
  name: string;
  description: string;
  location: string;
  eventDate: string;
  eventTime: string;
  bannerUrl?: string;
  status: EventStatus;
  ticketTypes: Array<Pick<EventTicketType, "type" | "price" | "capacity">>;
}

export type UpdateTicketEventPayload = Partial<Omit<CreateTicketEventPayload, "ticketTypes">> & {
  ticketTypes?: Array<Partial<EventTicketType> & Pick<EventTicketType, "type">>;
};

export interface TicketCheckoutQuote {
  subtotal: number;
  serviceFee: number;
  total: number;
}

export interface StripeCheckoutResponse {
  paymentId: string;
  checkoutSessionId: string;
  checkoutUrl: string;
  publishableKey?: string;
}

export interface TicketEventComment {
  id: string;
  eventId: string;
  userId: string;
  displayName: string;
  comment: string;
  createdAt: string;
}

export interface BusinessCatalogItem {
  businessId: string;
  businessName: string;
  imagePath?: string | null;
  following: boolean;
  eventCount: number;
}

export interface FollowResponse {
  businessId: string;
  userId: string;
  following: boolean;
}
