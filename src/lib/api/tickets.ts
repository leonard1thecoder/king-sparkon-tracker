import { apiGet } from "@/lib/api/client";
import type { TrackerUser } from "@/lib/types/backend";
import type { TicketEvent, UserTicket } from "@/types/tickets";

function normalizeEvent(event: TicketEvent): TicketEvent {
  return {
    ...event,
    eventDate: String(event.eventDate),
    eventTime: String(event.eventTime),
    createdAt: event.createdAt ? String(event.createdAt) : new Date().toISOString(),
    updatedAt: event.updatedAt ? String(event.updatedAt) : new Date().toISOString(),
    ticketTypes: (event.ticketTypes ?? []).map((ticketType) => ({
      ...ticketType,
      price: Number(ticketType.price ?? 0),
      capacity: Number(ticketType.capacity ?? 0),
      sold: Number(ticketType.sold ?? 0),
      available: Number(ticketType.available ?? 0),
    })),
  };
}

function normalizeTicket(ticket: UserTicket): UserTicket {
  return {
    ...ticket,
    pricePaid: Number(ticket.pricePaid ?? 0),
    purchasedAt: ticket.purchasedAt ? String(ticket.purchasedAt) : new Date().toISOString(),
    usedAt: ticket.usedAt ? String(ticket.usedAt) : undefined,
  };
}

export async function getLiveUpcomingEvents() {
  const events = await apiGet<TicketEvent[]>("/v1/tickets/events");
  return (Array.isArray(events) ? events : []).map(normalizeEvent);
}

export async function getLiveEventById(eventId: string) {
  const event = await apiGet<TicketEvent>(`/v1/tickets/events/${encodeURIComponent(eventId)}`);
  return event ? normalizeEvent(event) : null;
}

export async function getLiveMyTickets() {
  const user = await apiGet<TrackerUser>("/users/me");
  const tickets = await apiGet<UserTicket[]>(`/v1/tickets/my-tickets?userId=${encodeURIComponent(String(user.id))}`);
  return (Array.isArray(tickets) ? tickets : []).map(normalizeTicket);
}
