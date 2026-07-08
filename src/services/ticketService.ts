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

function nowIso() {
  return new Date().toISOString();
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

const initialEvents: TicketEvent[] = [
  {
    id: "event-sparkon-summit",
    ownerId: DEFAULT_OWNER_ID,
    name: "King Sparkon Barcode Summit",
    description:
      "A premium operations night for retail owners, stock teams, and scanner workers to learn barcode verification, QR ticket entry, and audit-ready event workflows.",
    location: "Johannesburg Expo Centre, Nasrec",
    eventDate: futureDate(21),
    eventTime: "18:00",
    bannerUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1400&q=80",
    status: "PUBLISHED",
    ticketTypes: [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: "event-scanfest-cape-town",
    ownerId: DEFAULT_OWNER_ID,
    name: "ScanFest Cape Town",
    description:
      "A QR-first product showcase with live ticket verification, staff access control demos, owner dashboards, and VIP networking for tech-enabled businesses.",
    location: "Cape Town International Convention Centre",
    eventDate: futureDate(42),
    eventTime: "15:30",
    bannerUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1400&q=80",
    status: "PUBLISHED",
    ticketTypes: [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
  {
    id: "event-worker-gate-masterclass",
    ownerId: DEFAULT_OWNER_ID,
    name: "Worker Gate Verification Masterclass",
    description:
      "A serious worker/staff training session focused on fast QR scanning, manual ticket lookup, fraud prevention, and clean entry reporting.",
    location: "Durban ICC Gate B",
    eventDate: futureDate(63),
    eventTime: "10:00",
    bannerUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=80",
    status: "DRAFT",
    ticketTypes: [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  },
];

initialEvents[0].ticketTypes = [
  createTicketType(initialEvents[0].id, "REGULAR", 180, 400, 186),
  createTicketType(initialEvents[0].id, "VIP", 450, 120, 54),
  createTicketType(initialEvents[0].id, "VVIP", 980, 40, 17),
];

initialEvents[1].ticketTypes = [
  createTicketType(initialEvents[1].id, "REGULAR", 150, 350, 91),
  createTicketType(initialEvents[1].id, "VIP", 380, 90, 22),
  createTicketType(initialEvents[1].id, "VVIP", 760, 30, 8),
];

initialEvents[2].ticketTypes = [
  createTicketType(initialEvents[2].id, "REGULAR", 90, 220, 0),
  createTicketType(initialEvents[2].id, "VIP", 220, 70, 0),
  createTicketType(initialEvents[2].id, "VVIP", 520, 20, 0),
];

const initialTickets: UserTicket[] = [
  buildTicket({
    id: "ticket-demo-active-001",
    eventId: initialEvents[0].id,
    userId: DEFAULT_USER_ID,
    buyerName: "Sizolwakhe Ticket Buyer",
    buyerEmail: "buyer@kingsparkon.co.za",
    ticketType: "VIP",
    pricePaid: 450,
    ticketReference: "KST-EVENT-DEMO-001",
    status: "ACTIVE",
    purchasedAt: nowIso(),
  }),
  buildTicket({
    id: "ticket-demo-used-001",
    eventId: initialEvents[0].id,
    userId: DEFAULT_USER_ID,
    buyerName: "Sizolwakhe Ticket Buyer",
    buyerEmail: "buyer@kingsparkon.co.za",
    ticketType: "REGULAR",
    pricePaid: 180,
    ticketReference: "KST-EVENT-DEMO-USED",
    status: "USED",
    purchasedAt: nowIso(),
    usedAt: nowIso(),
    scannedByWorkerId: DEFAULT_WORKER_ID,
  }),
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
  if (typeof window === "undefined") {
    return getMockUpcomingEvents();
  }

  try {
    const { data } = await apiClient.get<TicketEvent[]>("/v1/tickets/events");
    return normalizeTicketEvents(Array.isArray(data) ? data : []);
  } catch {
    await delay();
    return getMockUpcomingEvents();
  }
}

export async function getEventById(eventId: string) {
  if (typeof window === "undefined") {
    return getMockEventById(eventId);
  }

  try {
    const { data } = await apiClient.get<TicketEvent>(`/v1/tickets/events/${eventId}`);
    return data ? normalizeTicketEvent(data) : null;
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
