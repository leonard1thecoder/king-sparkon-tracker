import { apiClient } from "@/lib/api/client";
import { getOwnerEvents } from "@/services/ticketService";
import type { TicketEvent } from "@/types/tickets";

function normalizeTicketEvents(nextEvents: TicketEvent[]) {
  return nextEvents.map((event) => ({
    ...event,
    ticketTypes: event.ticketTypes ?? [],
  }));
}

export async function getAllTicketEvents() {
  try {
    const { data } = await apiClient.get<TicketEvent[]>("/v1/tickets/events/all");
    return normalizeTicketEvents(Array.isArray(data) ? data : []);
  } catch {
    return getOwnerEvents();
  }
}
