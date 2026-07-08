import { apiClient } from "@/lib/api/client";
import type {
  CreateTicketEventPayload,
  EventStatus,
  EventTicketType,
  OwnerTicketDashboard,
  TicketCheckoutQuote,
  TicketEvent,
  TicketPurchaseRequest,
  TicketType,
  TicketVerificationResult,
  UpdateTicketEventPayload,
  UserTicket,
} from "@/types/tickets";

const DEFAULT_OWNER_ID = "owner-demo-001";
const DEFAULT_USER_ID = "user-demo-001";
const DEFAULT_WORKER_ID = "worker-demo-001";
const PLATFORM_FEE_RATE = 0.04;

// Temporary UI preview switch. Keep true while reviewing bulk ticket/event screens.
// Change to false when you want the live backend API to drive dashboard ticket data again.
const USE_TICKET_PREVIEW_MOCK = true;

type TicketTypeSeed = { type: TicketType; price: number; capacity: number; sold: number };
type PreviewEventSeed = {
  id: string;
  name: string;
  description: string;
  location: string;
  daysFromNow: number;
  eventTime: string;
  bannerUrl: string;
  status: EventStatus;
  createdDaysAgo: number;
  ownerId?: string;
  ticketTypes: TicketTypeSeed[];
};

function nowIso() {
  return new Date().toISOString();
}

function pastIso(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}

function futureDate(daysFromNow: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().slice(0, 10);
}

function createTicketType(eventId: string, type: TicketType, price: number, capacity: number, sold: number): EventTicketType {
  return {
    id: `${eventId}-${type.toLowerCase()}`,
    eventId,
    type,
    price,
    capacity,
    sold,
    available: calculateTicketAvailability(capacity, sold),
  };
}

function createPreviewEvent(seed: PreviewEventSeed): TicketEvent {
  return {
    id: seed.id,
    ownerId: seed.ownerId ?? DEFAULT_OWNER_ID,
    name: seed.name,
    description: seed.description,
    location: seed.location,
    eventDate: futureDate(seed.daysFromNow),
    eventTime: seed.eventTime,
    bannerUrl: seed.bannerUrl,
    status: seed.status,
    ticketTypes: seed.ticketTypes.map((ticketType) => createTicketType(seed.id, ticketType.type, ticketType.price, ticketType.capacity, ticketType.sold)),
    createdAt: pastIso(seed.createdDaysAgo),
    updatedAt: nowIso(),
  };
}

const previewEventSeeds: PreviewEventSeed[] = [
  {
    id: "event-sparkon-summit-bulk",
    name: "King Sparkon Barcode Summit 2026",
    description: "A premium operations night for retail owners, stock teams, scanner workers, and ticket crews to learn barcode verification, QR entry, and audit-ready event workflows.",
    location: "Johannesburg Expo Centre, Nasrec",
    daysFromNow: 14,
    eventTime: "18:00",
    bannerUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1400&q=80",
    status: "PUBLISHED",
    createdDaysAgo: 9,
    ticketTypes: [
      { type: "REGULAR", price: 180, capacity: 1200, sold: 843 },
      { type: "VIP", price: 450, capacity: 300, sold: 214 },
      { type: "VVIP", price: 980, capacity: 80, sold: 67 },
    ],
  },
  {
    id: "event-soweto-night-market",
    name: "Soweto Night Market Tickets",
    description: "Food stalls, live DJs, tuck shop promos, worker scan gates, and QR ticket access for a high-volume township night market preview.",
    location: "Soweto Theatre Precinct",
    daysFromNow: 7,
    eventTime: "19:30",
    bannerUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=80",
    status: "PUBLISHED",
    createdDaysAgo: 12,
    ticketTypes: [
      { type: "REGULAR", price: 75, capacity: 2400, sold: 1888 },
      { type: "VIP", price: 180, capacity: 480, sold: 301 },
      { type: "VVIP", price: 420, capacity: 120, sold: 87 },
    ],
  },
  {
    id: "event-cape-town-scanfest",
    name: "ScanFest Cape Town",
    description: "A QR-first product showcase with live ticket verification, staff access control demos, owner dashboards, and VIP networking for tech-enabled businesses.",
    location: "Cape Town International Convention Centre",
    daysFromNow: 30,
    eventTime: "15:30",
    bannerUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1400&q=80",
    status: "PUBLISHED",
    createdDaysAgo: 18,
    ticketTypes: [
      { type: "REGULAR", price: 150, capacity: 900, sold: 412 },
      { type: "VIP", price: 380, capacity: 200, sold: 106 },
      { type: "VVIP", price: 760, capacity: 60, sold: 21 },
    ],
  },
  {
    id: "event-durban-gate-masterclass",
    name: "Worker Gate Verification Masterclass",
    description: "A serious worker and staff training session focused on fast QR scanning, manual ticket lookup, fraud prevention, and clean entry reporting.",
    location: "Durban ICC Gate B",
    daysFromNow: 45,
    eventTime: "10:00",
    bannerUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=80",
    status: "PUBLISHED",
    createdDaysAgo: 4,
    ticketTypes: [
      { type: "REGULAR", price: 90, capacity: 650, sold: 128 },
      { type: "VIP", price: 220, capacity: 160, sold: 54 },
      { type: "VVIP", price: 520, capacity: 40, sold: 12 },
    ],
  },
  {
    id: "event-pretoria-business-expo",
    name: "Pretoria Business Owner Expo",
    description: "Owner-focused ticketing expo for product stock, QR payments, dashboard control, promotions, and customer entry analytics.",
    location: "Time Square Pretoria",
    daysFromNow: 21,
    eventTime: "12:00",
    bannerUrl: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=80",
    status: "PUBLISHED",
    createdDaysAgo: 6,
    ticketTypes: [
      { type: "REGULAR", price: 120, capacity: 1400, sold: 977 },
      { type: "VIP", price: 320, capacity: 360, sold: 198 },
      { type: "VVIP", price: 690, capacity: 90, sold: 63 },
    ],
  },
  {
    id: "event-mamelodi-tuckshop-festival",
    name: "Mamelodi Tuck Shop Festival",
    description: "A community trading event showing how products, barcodes, tickets, workers, and owner revenue can run together in one dashboard.",
    location: "Mamelodi West Stadium",
    daysFromNow: 18,
    eventTime: "13:00",
    bannerUrl: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1400&q=80",
    status: "PUBLISHED",
    createdDaysAgo: 11,
    ticketTypes: [
      { type: "REGULAR", price: 60, capacity: 3200, sold: 2410 },
      { type: "VIP", price: 150, capacity: 520, sold: 384 },
      { type: "VVIP", price: 350, capacity: 100, sold: 91 },
    ],
  },
  {
    id: "event-sandton-founder-night",
    name: "Sandton Founder Night",
    description: "Premium invite-style event with bulk ticket pressure, executive seating, sponsor access, and VVIP ticket scarcity.",
    location: "Sandton Convention Centre",
    daysFromNow: 36,
    eventTime: "20:00",
    bannerUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1400&q=80",
    status: "PUBLISHED",
    createdDaysAgo: 20,
    ticketTypes: [
      { type: "REGULAR", price: 260, capacity: 700, sold: 529 },
      { type: "VIP", price: 850, capacity: 160, sold: 141 },
      { type: "VVIP", price: 1800, capacity: 35, sold: 31 },
    ],
  },
  {
    id: "event-limpopo-scanner-roadshow",
    name: "Limpopo Scanner Roadshow",
    description: "Regional QR ticket roadshow for businesses that want entry scanning, simple product inventory, and reliable worker operations.",
    location: "Polokwane Civic Centre",
    daysFromNow: 52,
    eventTime: "09:30",
    bannerUrl: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1400&q=80",
    status: "DRAFT",
    createdDaysAgo: 2,
    ticketTypes: [
      { type: "REGULAR", price: 80, capacity: 500, sold: 0 },
      { type: "VIP", price: 190, capacity: 120, sold: 0 },
      { type: "VVIP", price: 430, capacity: 25, sold: 0 },
    ],
  },
  {
    id: "event-bloemfontein-qa-conference",
    name: "Bloemfontein QA & Scanner Conference",
    description: "Technical conference for testers, developers, and operations owners reviewing scan errors, fraud checks, and payment workflow quality.",
    location: "Bloemfontein Civic Theatre",
    daysFromNow: 60,
    eventTime: "11:00",
    bannerUrl: "https://images.unsplash.com/photo-1515169067865-5387ec356754?auto=format&fit=crop&w=1400&q=80",
    status: "PUBLISHED",
    createdDaysAgo: 16,
    ticketTypes: [
      { type: "REGULAR", price: 140, capacity: 750, sold: 268 },
      { type: "VIP", price: 360, capacity: 180, sold: 73 },
      { type: "VVIP", price: 740, capacity: 45, sold: 18 },
    ],
  },
  {
    id: "event-east-london-cloud-night",
    name: "East London Cloud Night",
    description: "A compact event for cloud deployment, payment links, QR ticket delivery, and operational support packages.",
    location: "East London ICC",
    daysFromNow: 27,
    eventTime: "17:00",
    bannerUrl: "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1400&q=80",
    status: "PUBLISHED",
    createdDaysAgo: 7,
    ticketTypes: [
      { type: "REGULAR", price: 110, capacity: 420, sold: 184 },
      { type: "VIP", price: 260, capacity: 100, sold: 66 },
      { type: "VVIP", price: 580, capacity: 20, sold: 14 },
    ],
  },
  {
    id: "event-sold-out-vvip-preview",
    name: "Sold-Out VVIP Preview Night",
    description: "Deliberate mock event to test sold-out visual states, high demand, disabled purchase actions, and owner capacity numbers.",
    location: "Rosebank Rooftop Venue",
    daysFromNow: 10,
    eventTime: "21:00",
    bannerUrl: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1400&q=80",
    status: "PUBLISHED",
    createdDaysAgo: 30,
    ticketTypes: [
      { type: "REGULAR", price: 300, capacity: 300, sold: 300 },
      { type: "VIP", price: 700, capacity: 80, sold: 80 },
      { type: "VVIP", price: 1500, capacity: 25, sold: 25 },
    ],
  },
  {
    id: "event-completed-history-preview",
    name: "Completed Ticket History Preview",
    description: "Mock completed event used to check how owner tables and filters behave when historical ticket sales are included.",
    location: "Midrand Demo Hall",
    daysFromNow: -14,
    eventTime: "16:00",
    bannerUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1400&q=80",
    status: "COMPLETED",
    createdDaysAgo: 60,
    ticketTypes: [
      { type: "REGULAR", price: 95, capacity: 600, sold: 512 },
      { type: "VIP", price: 240, capacity: 140, sold: 117 },
      { type: "VVIP", price: 500, capacity: 35, sold: 28 },
    ],
  },
  {
    id: "event-cancelled-weather-preview",
    name: "Cancelled Weather Preview",
    description: "Mock cancelled event used to check cancellation badges, table filtering, and event states without touching backend data.",
    location: "Outdoor Park, Centurion",
    daysFromNow: 25,
    eventTime: "14:00",
    bannerUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
    status: "CANCELLED",
    createdDaysAgo: 22,
    ticketTypes: [
      { type: "REGULAR", price: 70, capacity: 900, sold: 244 },
      { type: "VIP", price: 160, capacity: 180, sold: 71 },
      { type: "VVIP", price: 360, capacity: 35, sold: 9 },
    ],
  },
];

const initialEvents: TicketEvent[] = previewEventSeeds.map(createPreviewEvent);

const initialTickets: UserTicket[] = [
  ...buildBulkTickets(initialEvents[0], "VIP", 8, "ACTIVE", "KST-BULK-VIP"),
  ...buildBulkTickets(initialEvents[0], "REGULAR", 12, "USED", "KST-BULK-REG"),
  ...buildBulkTickets(initialEvents[1], "REGULAR", 6, "ACTIVE", "KST-SOWETO-REG"),
  ...buildBulkTickets(initialEvents[1], "VIP", 4, "ACTIVE", "KST-SOWETO-VIP"),
  ...buildBulkTickets(initialEvents[4], "VVIP", 3, "ACTIVE", "KST-PTA-VVIP"),
  ...buildBulkTickets(initialEvents[6], "VVIP", 2, "USED", "KST-SANDTON-VVIP"),
  ...buildBulkTickets(initialEvents[10], "REGULAR", 2, "CANCELLED", "KST-SOLDOUT-CAN"),
];

let events = cloneEvents(initialEvents);
let tickets = cloneTickets(initialTickets);

function delay() {
  return new Promise<void>((resolve) => windowSafeTimeout(() => resolve(), 220));
}

function windowSafeTimeout(callback: () => void, milliseconds: number) {
  if (typeof window === "undefined") {
    callback();
    return 0;
  }
  return window.setTimeout(callback, milliseconds);
}

function cloneEvents(source: TicketEvent[]) {
  return source.map((event) => ({ ...event, ticketTypes: (event.ticketTypes ?? []).map((ticketType) => ({ ...ticketType })) }));
}

function cloneTickets(source: UserTicket[]) {
  return source.map((ticket) => ({ ...ticket }));
}

function cloneEvent(event: TicketEvent) {
  return cloneEvents([event])[0];
}

function normalizeTicketEvent(event: TicketEvent): TicketEvent {
  return {
    ...event,
    ticketTypes: (event.ticketTypes ?? []).map((ticketType) => ({ ...ticketType })),
  };
}

function normalizeTicketEvents(nextEvents: TicketEvent[]) {
  return nextEvents.map(normalizeTicketEvent);
}

function getMockUpcomingEvents() {
  return cloneEvents(events)
    .filter((event) => event.status !== "CANCELLED")
    .sort((left, right) => `${left.eventDate}T${left.eventTime}`.localeCompare(`${right.eventDate}T${right.eventTime}`));
}

function getMockEventById(eventId: string) {
  const event = events.find((candidate) => candidate.id === eventId);
  return event ? cloneEvent(event) : null;
}

function normalizeReference(value: string) {
  return value.trim().toUpperCase();
}

function buildQrCodeValue(ticketId: string, eventId: string, ticketReference: string, userId: string) {
  const payload = { ticketId, eventId, ticketReference, userId };
  return `KST-TICKET:${encodeURIComponent(JSON.stringify(payload))}`;
}

function buildTicket(input: Omit<UserTicket, "qrCodeValue">): UserTicket {
  return {
    ...input,
    qrCodeValue: buildQrCodeValue(input.id, input.eventId, input.ticketReference, input.userId),
  };
}

function buildBulkTickets(event: TicketEvent, ticketType: TicketType, count: number, status: UserTicket["status"], prefix: string): UserTicket[] {
  const match = event.ticketTypes.find((candidate) => candidate.type === ticketType);
  const pricePaid = match?.price ?? 0;

  return Array.from({ length: count }, (_, index) => {
    const ticketNumber = index + 1;
    return buildTicket({
      id: `${prefix.toLowerCase()}-${ticketNumber.toString().padStart(3, "0")}`,
      eventId: event.id,
      userId: DEFAULT_USER_ID,
      buyerName: ticketNumber % 2 === 0 ? "Sizolwakhe Ticket Buyer" : "King Sparkon Guest",
      buyerEmail: ticketNumber % 2 === 0 ? "buyer@kingsparkon.co.za" : "guest@kingsparkon.co.za",
      ticketType,
      pricePaid,
      ticketReference: `${prefix}-${ticketNumber.toString().padStart(5, "0")}`,
      status,
      purchasedAt: pastIso(ticketNumber),
      usedAt: status === "USED" ? pastIso(ticketNumber - 1) : undefined,
      scannedByWorkerId: status === "USED" ? DEFAULT_WORKER_ID : undefined,
    });
  });
}

function ticketTypeOrder(type: TicketType) {
  const order: Record<TicketType, number> = { REGULAR: 1, VIP: 2, VVIP: 3 };
  return order[type];
}

function isUpcomingPublished(event: TicketEvent) {
  const eventStartsAt = new Date(`${event.eventDate}T${event.eventTime || "00:00"}`);
  return event.status === "PUBLISHED" && eventStartsAt >= new Date();
}

function getSoldByType(type: TicketType) {
  return events.reduce((sum, event) => {
    const match = event.ticketTypes.find((ticketType) => ticketType.type === type);
    return sum + (match?.sold ?? 0);
  }, 0);
}

function validateEventPayload(payload: CreateTicketEventPayload) {
  if (!payload.name.trim()) throw new Error("Event name is required.");
  if (!payload.description.trim()) throw new Error("Event description is required.");
  if (!payload.location.trim()) throw new Error("Event location is required.");
  if (!payload.eventDate) throw new Error("Event date is required.");
  if (!payload.eventTime) throw new Error("Event time is required.");

  const eventDateTime = new Date(`${payload.eventDate}T${payload.eventTime}`);
  if (Number.isNaN(eventDateTime.getTime())) throw new Error("Enter a valid event date and time.");
  if (eventDateTime < new Date()) throw new Error("Event date must not be in the past.");

  payload.ticketTypes.forEach((ticketType) => {
    if (ticketType.capacity <= 0) throw new Error(`${ticketType.type} capacity must be positive.`);
    if (ticketType.price < 0) throw new Error(`${ticketType.type} price must be zero or positive.`);
  });
}

export function calculateTicketAvailability(capacity: number, sold: number) {
  return Math.max(capacity - sold, 0);
}

export function getTicketTypeLabel(type: TicketType) {
  const labels: Record<TicketType, string> = {
    REGULAR: "Regular",
    VIP: "VIP",
    VVIP: "VVIP",
  };
  return labels[type];
}

export function getEventTotals(event: TicketEvent) {
  return (event.ticketTypes ?? []).reduce(
    (totals, ticketType) => ({
      totalCapacity: totals.totalCapacity + ticketType.capacity,
      totalSold: totals.totalSold + ticketType.sold,
      totalAvailable: totals.totalAvailable + calculateTicketAvailability(ticketType.capacity, ticketType.sold),
    }),
    { totalCapacity: 0, totalSold: 0, totalAvailable: 0 },
  );
}

export function getEventStatusLabel(status: EventStatus) {
  const labels: Record<EventStatus, string> = {
    DRAFT: "Draft",
    PUBLISHED: "Published",
    CANCELLED: "Cancelled",
    COMPLETED: "Completed",
  };
  return labels[status];
}

export function calculateCheckoutQuote(price: number, quantity: number): TicketCheckoutQuote {
  const subtotal = price * quantity;
  const serviceFee = Math.round(subtotal * PLATFORM_FEE_RATE * 100) / 100;
  return { subtotal, serviceFee, total: subtotal + serviceFee };
}

export async function getUpcomingEvents() {
  if (USE_TICKET_PREVIEW_MOCK || typeof window === "undefined") {
    await delay();
    return getMockUpcomingEvents();
  }

  try {
    const { data } = await apiClient.get<TicketEvent[]>("/v1/tickets/events");
    const nextEvents = normalizeTicketEvents(Array.isArray(data) ? data : []);
    return nextEvents.length ? nextEvents : getMockUpcomingEvents();
  } catch {
    await delay();
    return getMockUpcomingEvents();
  }
}

export async function getEventById(eventId: string) {
  if (USE_TICKET_PREVIEW_MOCK || typeof window === "undefined") {
    await delay();
    return getMockEventById(eventId);
  }

  try {
    const { data } = await apiClient.get<TicketEvent>(`/v1/tickets/events/${eventId}`);
    return data ? normalizeTicketEvent(data) : getMockEventById(eventId);
  } catch {
    await delay();
    return getMockEventById(eventId);
  }
}

export async function purchaseTickets(request: TicketPurchaseRequest) {
  await delay();
  if (request.quantity <= 0) throw new Error("Select at least one ticket.");
  if (!request.buyerName.trim()) throw new Error("Buyer name is required.");
  if (!request.buyerEmail.trim() || !request.buyerEmail.includes("@")) throw new Error("Enter a valid buyer email address.");

  const event = requireEvent(request.eventId);
  if (event.status !== "PUBLISHED") throw new Error("This event is not available for ticket purchases.");

  const selectedTicketType = requireTicketType(event, request.ticketType);
  syncAvailability(selectedTicketType);

  if (selectedTicketType.sold >= selectedTicketType.capacity || selectedTicketType.available < request.quantity) {
    throw new Error(`${getTicketTypeLabel(request.ticketType)} tickets are sold out.`);
  }

  const quote = calculateCheckoutQuote(selectedTicketType.price, request.quantity);
  const createdTickets = Array.from({ length: request.quantity }, (_, index) => {
    const ticketNumber = tickets.length + index + 1;
    const ticketId = `ticket-${Date.now()}-${ticketNumber}`;
    const ticketReference = `KST-${event.id.slice(0, 8).toUpperCase()}-${ticketNumber.toString().padStart(5, "0")}`;

    return buildTicket({
      id: ticketId,
      eventId: request.eventId,
      userId: DEFAULT_USER_ID,
      buyerName: request.buyerName.trim(),
      buyerEmail: request.buyerEmail.trim().toLowerCase(),
      ticketType: request.ticketType,
      pricePaid: Math.round((quote.total / request.quantity) * 100) / 100,
      ticketReference,
      status: "ACTIVE",
      purchasedAt: nowIso(),
    });
  });

  selectedTicketType.sold += request.quantity;
  syncAvailability(selectedTicketType);
  event.updatedAt = nowIso();
  tickets = [...tickets, ...createdTickets];

  return cloneTickets(createdTickets);
}

export async function getMyTickets() {
  await delay();
  return cloneTickets(tickets.filter((ticket) => ticket.userId === DEFAULT_USER_ID)).sort((left, right) => right.purchasedAt.localeCompare(left.purchasedAt));
}

export async function verifyTicketByQr(qrValue: string): Promise<TicketVerificationResult> {
  await delay();
  const normalizedValue = qrValue.trim();
  const ticket = tickets.find((candidate) => candidate.qrCodeValue === normalizedValue);
  if (!ticket) return { valid: false, message: "Invalid ticket." };
  return verifyTicket(ticket);
}

export async function verifyTicketByReference(reference: string): Promise<TicketVerificationResult> {
  await delay();
  const normalizedReference = normalizeReference(reference);
  const ticket = tickets.find((candidate) => normalizeReference(candidate.ticketReference) === normalizedReference);
  if (!ticket) return { valid: false, message: "Invalid ticket." };
  return verifyTicket(ticket);
}

function verifyTicket(ticket: UserTicket): TicketVerificationResult {
  const event = events.find((candidate) => candidate.id === ticket.eventId);
  if (!event) return { valid: false, message: "Invalid ticket." };

  if (ticket.status === "USED") return { valid: false, message: "Ticket already used.", ticket: { ...ticket }, event: cloneEvent(event) };
  if (ticket.status === "CANCELLED") return { valid: false, message: "Ticket cancelled.", ticket: { ...ticket }, event: cloneEvent(event) };
  if (ticket.status === "EXPIRED") return { valid: false, message: "Ticket expired.", ticket: { ...ticket }, event: cloneEvent(event) };

  ticket.status = "USED";
  ticket.usedAt = nowIso();
  ticket.scannedByWorkerId = DEFAULT_WORKER_ID;

  return { valid: true, message: "Valid ticket. Entry approved.", ticket: { ...ticket }, event: cloneEvent(event) };
}

export async function createEvent(payload: CreateTicketEventPayload) {
  await delay();
  validateEventPayload(payload);

  const eventId = `event-${payload.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || Date.now()}`;
  const event: TicketEvent = {
    id: eventId,
    ownerId: payload.ownerId ?? DEFAULT_OWNER_ID,
    name: payload.name.trim(),
    description: payload.description.trim(),
    location: payload.location.trim(),
    eventDate: payload.eventDate,
    eventTime: payload.eventTime,
    bannerUrl: payload.bannerUrl?.trim() || undefined,
    status: payload.status,
    ticketTypes: payload.ticketTypes
      .slice()
      .sort((left, right) => ticketTypeOrder(left.type) - ticketTypeOrder(right.type))
      .map((ticketType) => createTicketType(eventId, ticketType.type, ticketType.price, ticketType.capacity, 0)),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  events = [event, ...events];
  return cloneEvent(event);
}

export async function updateEvent(eventId: string, payload: UpdateTicketEventPayload) {
  await delay();
  const event = requireEvent(eventId);
  if (payload.name !== undefined) event.name = payload.name.trim();
  if (payload.description !== undefined) event.description = payload.description.trim();
  if (payload.location !== undefined) event.location = payload.location.trim();
  if (payload.eventDate !== undefined) event.eventDate = payload.eventDate;
  if (payload.eventTime !== undefined) event.eventTime = payload.eventTime;
  if (payload.bannerUrl !== undefined) event.bannerUrl = payload.bannerUrl.trim() || undefined;
  if (payload.status !== undefined) event.status = payload.status;
  event.updatedAt = nowIso();
  return cloneEvent(event);
}

export async function getOwnerEvents() {
  await delay();
  return cloneEvents(events).sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function getOwnerTicketDashboard(): Promise<OwnerTicketDashboard> {
  await delay();
  const totals = events.reduce(
    (summary, event) => {
      const eventTotals = getEventTotals(event);
      return {
        totalEvents: summary.totalEvents + 1,
        publishedEvents: summary.publishedEvents + (event.status === "PUBLISHED" ? 1 : 0),
        upcomingEvents: summary.upcomingEvents + (isUpcomingPublished(event) ? 1 : 0),
        totalCapacity: summary.totalCapacity + eventTotals.totalCapacity,
        totalSold: summary.totalSold + eventTotals.totalSold,
        totalAvailable: summary.totalAvailable + eventTotals.totalAvailable,
        revenue: summary.revenue + event.ticketTypes.reduce((sum, ticketType) => sum + ticketType.sold * ticketType.price, 0),
      };
    },
    { totalEvents: 0, publishedEvents: 0, upcomingEvents: 0, totalCapacity: 0, totalSold: 0, totalAvailable: 0, revenue: 0 },
  );

  return {
    ...totals,
    ticketsSold: totals.totalSold,
    regularSold: getSoldByType("REGULAR"),
    vipSold: getSoldByType("VIP"),
    vvipSold: getSoldByType("VVIP"),
  };
}

export function __resetTicketMockDataForTests() {
  events = cloneEvents(initialEvents);
  tickets = cloneTickets(initialTickets);
}

export function __setTicketTypeInventoryForTests(eventId: string, type: TicketType, capacity: number, sold: number) {
  const event = requireEvent(eventId);
  const ticketType = requireTicketType(event, type);
  ticketType.capacity = capacity;
  ticketType.sold = sold;
  syncAvailability(ticketType);
  event.updatedAt = nowIso();
}

function requireEvent(eventId: string) {
  const event = events.find((candidate) => candidate.id === eventId);
  if (!event) throw new Error("Event not found.");
  return event;
}

function requireTicketType(event: TicketEvent, type: TicketType) {
  const ticketType = event.ticketTypes.find((candidate) => candidate.type === type);
  if (!ticketType) throw new Error(`${getTicketTypeLabel(type)} ticket type is not available.`);
  return ticketType;
}

function syncAvailability(ticketType: EventTicketType) {
  ticketType.available = calculateTicketAvailability(ticketType.capacity, ticketType.sold);
}
