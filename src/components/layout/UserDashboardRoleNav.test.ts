import { describe, expect, it } from "vitest";
import { userProfileShortcuts } from "@/components/layout/DashboardHeaderActions";
import { navByRole } from "@/components/layout/DashboardRoleNav";

const hiddenUserSidebarRoutes = [
  "/dashboard/user/tickets",
  "/dashboard/user/jobs",
  "/dashboard/user/applications",
  "/dashboard/user/profile",
  "/dashboard/user/carts",
] as const;

describe("user dashboard sidebar contract", () => {
  it("keeps secondary destinations out of the user sidebar", () => {
    const userRoutes = navByRole.User.map((item) => item.href);

    hiddenUserSidebarRoutes.forEach((route) => {
      expect(userRoutes).not.toContain(route);
    });
  });

  it("keeps My Carts in the profile menu", () => {
    expect(userProfileShortcuts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "My Carts", href: "/dashboard/user/carts" }),
      ]),
    );
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
      "Buy Tickets",
      "Tip Worker",
    ]);
  });
});
