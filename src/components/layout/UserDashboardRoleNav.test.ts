import { describe, expect, it } from "vitest";
import { navByRole } from "@/components/layout/DashboardRoleNav";

const hiddenUserSidebarRoutes = [
  "/dashboard/user/tickets",
  "/dashboard/user/jobs",
  "/dashboard/user/applications",
  "/dashboard/user/profile",
] as const;

describe("user dashboard sidebar contract", () => {
  it("keeps secondary destinations out of the user sidebar", () => {
    const userRoutes = navByRole.User.map((item) => item.href);

    hiddenUserSidebarRoutes.forEach((route) => {
      expect(userRoutes).not.toContain(route);
    });
  });

  it("uses the canonical worker tip workspace route", () => {
    const tipWorker = navByRole.User.find((item) => item.label === "Tip Worker");

    expect(tipWorker?.href).toBe("/dashboard/user/tips");
  });

  it("keeps the user sidebar focused on primary commerce actions", () => {
    expect(navByRole.User.map((item) => item.label)).toEqual([
      "Overview",
      "Buy Products",
      "Cart",
      "My Carts",
      "Buy Tickets",
      "Tip Worker",
    ]);
  });
});
