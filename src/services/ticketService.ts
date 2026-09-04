import { apiClient, normalizeApiError } from "@/lib/api/client";
import type {
  CreateTicketEventPayload,
  EventStatus,
  OwnerTicketDashboard,
  TicketCheckoutQuote,
  TicketEvent,
  TicketType,
  UpdateTicketEventPayload,
} from "@/types/tickets";

const PLATFORM_FEE_RATE = 0.04;

function normalizeTicketEvent(event: TicketEvent): TicketEvent {
  return {
    ...event,
    ticketTypes: (event.ticketTypes ?? []).map((ticketType) => ({ ...ticketType })),
  };
}

function normalizeTicketEvents(nextEvents: TicketEvent[]) {
  return nextEvents.map(normalizeTicketEvent);
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
  const { data } = await apiClient.get<TicketEvent[]>("/v1/tickets/events");
  return normalizeTicketEvents(Array.isArray(data) ? data : []);
}

export async function getEventById(eventId: string) {
  try {
    const { data } = await apiClient.get<TicketEvent>(`/v1/tickets/events/${eventId}`);
    return data ? normalizeTicketEvent(data) : null;
  } catch (exception) {
    if (normalizeApiError(exception).status === 404) return null;
    throw exception;
  }
}

export async function createEvent(payload: CreateTicketEventPayload) {
  validateEventPayload(payload);
  const { data } = await apiClient.post<TicketEvent>("/v1/tickets/events", {
    ...payload,
    ownerId: payload.ownerId ?? "current-owner",
  });
  return normalizeTicketEvent(data);
}

export async function uploadEventBanner(eventId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.patch<TicketEvent>(`/v1/tickets/events/${eventId}/banner-file`, formData);
  return normalizeTicketEvent(data);
}

export async function updateEvent(eventId: string, payload: UpdateTicketEventPayload) {
  const { data } = await apiClient.patch<TicketEvent>(`/v1/tickets/events/${eventId}`, payload);
  return normalizeTicketEvent(data);
}

export async function getOwnerEvents() {
  const { data } = await apiClient.get<TicketEvent[]>("/v1/tickets/owner/events");
  return normalizeTicketEvents(Array.isArray(data) ? data : []);
}

export async function getOwnerTicketDashboard(): Promise<OwnerTicketDashboard> {
  const { data } = await apiClient.get<OwnerTicketDashboard>("/v1/tickets/owner/dashboard");
  return data;
}
