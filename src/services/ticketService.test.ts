import { describe, expect, it } from "vitest";
import {
  calculateCheckoutQuote,
  calculateTicketAvailability,
  getEventStatusLabel,
  getEventTotals,
  getTicketTypeLabel,
} from "./ticketService";

describe("ticketService pure helpers", () => {
  it("calculates available tickets from capacity minus sold", () => {
    expect(calculateTicketAvailability(10, 3)).toBe(7);
    expect(calculateTicketAvailability(5, 8)).toBe(0);
  });

  it("labels ticket types and statuses", () => {
    expect(getTicketTypeLabel("REGULAR")).toBe("Regular");
    expect(getTicketTypeLabel("VIP")).toBe("VIP");
    expect(getTicketTypeLabel("VVIP")).toBe("VVIP");
    expect(getEventStatusLabel("PUBLISHED")).toBe("Published");
    expect(getEventStatusLabel("CANCELLED")).toBe("Cancelled");
  });

  it("totals event capacity, sold and availability", () => {
    const totals = getEventTotals({
      id: "event-1",
      ownerId: "owner-1",
      name: "Event",
      description: "Description",
      location: "Location",
      eventDate: "2026-10-01",
      eventTime: "18:00",
      status: "PUBLISHED",
      ticketTypes: [
        { id: "event-1-regular", eventId: "event-1", type: "REGULAR", price: 100, capacity: 10, sold: 7, available: 3 },
        { id: "event-1-vip", eventId: "event-1", type: "VIP", price: 200, capacity: 5, sold: 5, available: 0 },
      ],
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    expect(totals).toEqual({ totalCapacity: 15, totalSold: 12, totalAvailable: 3 });
  });

  it("quotes checkout totals with the platform fee", () => {
    expect(calculateCheckoutQuote(100, 2)).toEqual({ subtotal: 200, serviceFee: 8, total: 208 });
  });
});
