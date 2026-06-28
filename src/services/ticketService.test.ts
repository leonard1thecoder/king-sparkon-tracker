import { beforeEach, describe, expect, it } from "vitest";
import {
  __resetTicketMockDataForTests,
  __setTicketTypeInventoryForTests,
  calculateTicketAvailability,
  getEventById,
  purchaseTickets,
  verifyTicketByReference,
} from "./ticketService";

describe("ticketService business rules", () => {
  beforeEach(() => {
    __resetTicketMockDataForTests();
  });

  it("does not allow buying a sold out ticket type", async () => {
    __setTicketTypeInventoryForTests("event-sparkon-summit", "REGULAR", 2, 2);

    await expect(
      purchaseTickets({
        eventId: "event-sparkon-summit",
        ticketType: "REGULAR",
        quantity: 1,
        buyerName: "Test Buyer",
        buyerEmail: "buyer@example.com",
      }),
    ).rejects.toThrow("sold out");
  });

  it("marks an active ticket as used after verification", async () => {
    const result = await verifyTicketByReference("KST-EVENT-DEMO-001");

    expect(result.valid).toBe(true);
    expect(result.message).toContain("Entry approved");
    expect(result.ticket?.status).toBe("USED");
    expect(result.ticket?.usedAt).toBeDefined();
  });

  it("does not allow a used ticket to be reused", async () => {
    await verifyTicketByReference("KST-EVENT-DEMO-001");

    const secondScan = await verifyTicketByReference("KST-EVENT-DEMO-001");

    expect(secondScan.valid).toBe(false);
    expect(secondScan.message).toBe("Ticket already used.");
  });

  it("calculates available tickets from capacity minus sold", async () => {
    expect(calculateTicketAvailability(10, 3)).toBe(7);
    expect(calculateTicketAvailability(5, 8)).toBe(0);

    __setTicketTypeInventoryForTests("event-sparkon-summit", "VIP", 10, 7);
    const event = await getEventById("event-sparkon-summit");
    const vip = event?.ticketTypes.find((ticketType) => ticketType.type === "VIP");

    expect(vip?.available).toBe(3);
  });
});
