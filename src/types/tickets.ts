export type TicketType = "REGULAR" | "VIP" | "VVIP";

export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";

export type TicketStatus = "ACTIVE" | "USED" | "CANCELLED" | "EXPIRED";

export type TicketRole = "USER" | "OWNER" | "WORKER" | "ADMIN";

export type FaceVerificationDecision = "PENDING" | "MATCH" | "NO_MATCH";

export interface TicketEvent {
  id: string;
  ownerId: string;
  businessId?: number | null;
  name: string;
  description: string;
  location: string;
  eventDate: string;
  eventTime: string;
  eventEndTime?: string | null;
  bannerUrl?: string;
  status: EventStatus;
  ticketTypes: EventTicketType[];
  createdAt: string;
  updatedAt: string;
  earlyBirdEnabled?: boolean;
  earlyBirdPercent?: number;
  earlyBirdEndsAt?: string;
  marketplaceHubEnabled?: boolean;
  marketplaceHubPrice?: number | null;
  coolerboxFree?: boolean;
  coolerboxPrice?: number | null;
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
  verificationPhotoUrl?: string | null;
  verificationPhotoCapturedAt?: string | null;
  verificationRequired?: boolean;
  canShare?: boolean;
  canChangeVerificationPhoto?: boolean;
  transferredAt?: string | null;
  transferredFromUserId?: string | null;
  ownershipVersion?: number;
  coolerboxAdded?: boolean;
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
  requiresFaceConfirmation?: boolean;
  verificationPhotoUrl?: string | null;
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
  eventEndTime?: string | null;
  bannerUrl?: string;
  status: EventStatus;
  ticketTypes: Array<Pick<EventTicketType, "type" | "price" | "capacity">>;
  earlyBirdEnabled?: boolean;
  earlyBirdPercent?: number;
  earlyBirdEndsAt?: string;
  marketplaceHubEnabled?: boolean;
  marketplaceHubPrice?: number;
  coolerboxFree?: boolean;
  coolerboxPrice?: number;
}

export type UpdateTicketEventPayload = Partial<Omit<CreateTicketEventPayload, "ticketTypes">> & {
  ticketTypes?: Array<Partial<EventTicketType> & Pick<EventTicketType, "type">>;
};

export interface TicketCheckoutQuote {
  subtotal: number;
  serviceFee: number;
  total: number;
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

export type EventSetType = "VOW" | "MANUAL";

export type EventSetStatus = "OPEN" | "BOOKED" | "CANCELLED";

export type SetBookingStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CONFIRMED";

export interface EventSet {
  id: string;
  eventId: string;
  businessId?: number | null;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventEndTime?: string | null;
  name: string;
  setType: EventSetType;
  status: EventSetStatus;
  startTime: string;
  endTime: string;
  price?: number | null;
  applicationCount: number;
  totalVows: number;
  bookingCount: number;
  topArtistName?: string | null;
  topVowCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SetApplication {
  id: string;
  setId: string;
  artistId: number;
  artistName: string;
  status: SetBookingStatus;
  vowCount: number;
  appliedAt: string;
}

export interface EventSetBooking {
  id: string;
  setId: string;
  setName: string;
  eventId: string;
  eventName: string;
  artistId: number;
  artistName: string;
  offerAmount: number;
  status: SetBookingStatus;
  requestedAt: string;
  respondedAt?: string | null;
  paidAt?: string | null;
  paymentReference?: string | null;
}

export interface ArtistCartLine {
  kind: "ARTIST_BOOKING";
  referenceId: string;
  label: string;
  amount: number;
}

export interface CompleteDraftResult {
  eventId: string;
  status: EventStatus;
  published: boolean;
  cartLines: ArtistCartLine[];
}

export interface ArtistBusinessBalance {
  businessId: number;
  businessName?: string | null;
  available: number;
}

export interface ArtistBalance {
  totalAvailable: number;
  totalPending: number;
  minimumWithdrawal: number;
  businesses: ArtistBusinessBalance[];
}

export type ArtistWithdrawalStatus = "REQUESTED" | "APPROVED" | "REJECTED" | "PAID";

export interface ArtistWithdrawal {
  id: number;
  businessId: number;
  grossAmount: number;
  paypalEmail?: string | null;
  status: ArtistWithdrawalStatus;
  requestedAt?: string | null;
  decidedAt?: string | null;
  decidedByUsername?: string | null;
}
