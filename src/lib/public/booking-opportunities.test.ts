import { describe, expect, it } from "vitest";
import {
  formatBookingPrice,
  formatPriceRange,
  groupOpenSetsByEvent,
  isEligibleSet,
  opportunityFromSetsOnly,
  priceRangeForSets,
  toBookingOpportunity,
} from "./booking-opportunities";
import type { EventSet } from "@/types/tickets";

function set(overrides: Partial<EventSet> = {}): EventSet {
  return {
    id: "set-1",
    eventId: "event-1",
    businessId: 1,
    eventName: "Summer Beats Festival",
    eventDate: "2026-11-01",
    eventTime: "12:00",
    eventEndTime: "23:00",
    name: "Opening Set",
    setType: "VOW",
    status: "OPEN",
    startTime: "12:00",
    endTime: "13:00",
    price: 500,
    applicationCount: 0,
    totalVows: 0,
    bookingCount: 0,
    topArtistName: null,
    topVowCount: 0,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("booking opportunities", () => {
  it("only treats OPEN sets as eligible", () => {
    expect(isEligibleSet(set({ status: "OPEN" }))).toBe(true);
    expect(isEligibleSet(set({ status: "BOOKED" }))).toBe(false);
    expect(isEligibleSet(set({ status: "CANCELLED" }))).toBe(false);
  });

  it("drops fully-booked events (no OPEN sets left)", () => {
    const grouped = groupOpenSetsByEvent([
      set({ id: "a", eventId: "e1", status: "BOOKED" }),
      set({ id: "b", eventId: "e1", status: "CANCELLED" }),
      set({ id: "c", eventId: "e2", status: "OPEN" }),
    ]);
    expect(grouped.has("e1")).toBe(false);
    expect(grouped.get("e2")?.length).toBe(1);
  });

  it("computes min/max from OPEN sets only", () => {
    const { min, max } = priceRangeForSets([
      set({ id: "a", price: 500 }),
      set({ id: "b", price: 2000 }),
      set({ id: "c", price: 9000, status: "BOOKED" }),
      set({ id: "d", price: 50, status: "CANCELLED" }),
    ]);
    expect(min).toBe(500);
    expect(max).toBe(2000);
  });

  it("formats ranges as R500 – R2,000", () => {
    expect(formatBookingPrice(500)).toBe("R500");
    expect(formatBookingPrice(2000)).toBe("R2,000");
    expect(formatPriceRange(500, 2000)).toBe("R500 – R2,000");
    expect(formatPriceRange(500, 500)).toBe("R500");
    expect(formatPriceRange(null, 2000)).toBeNull();
  });

  it("returns null when no sets remain available", () => {
    expect(
      toBookingOpportunity(
        { id: "e1", name: "Show", location: "JHB", eventDate: "2026-11-01", eventTime: "12:00" },
        [set({ status: "BOOKED" })],
      ),
    ).toBeNull();
    expect(opportunityFromSetsOnly("e1", [set({ status: "CANCELLED" })])).toBeNull();
  });
});
