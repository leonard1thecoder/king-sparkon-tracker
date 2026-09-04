import type { TicketEventComment } from "@/types/tickets";

// API MISSING: there is currently no backend endpoint for event comments
// (no src/app/api route, no src/lib/api helper). These helpers throw so the UI
// renders an honest empty/error state instead of demo data.

export async function getEventComments(_eventId: string): Promise<TicketEventComment[]> {
  throw new Error("API MISSING: GET event comments is not exposed by the backend yet.");
}

export async function addEventComment(
  _eventId: string,
  _displayName: string,
  _comment: string,
): Promise<TicketEventComment> {
  throw new Error("API MISSING: POST event comments is not exposed by the backend yet.");
}
