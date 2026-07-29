import { describe, expect, it } from "vitest";
import { DashboardFrame, getDashboardHomeHref } from "@/components/layout/DashboardFrame";
import { isActive, navByRole } from "@/components/layout/DashboardRoleNav";
import type { UserRole } from "@/lib/types/backend";

const roleSegments: Record<UserRole, string> = {
  Admin: "admin",
  Owner: "owner",
  Worker: "worker",
  Affiliate: "affiliate",
  User: "user",
};

describe("dashboard navigation contract", () => {
  it("keeps every role destination inside its own dashboard boundary", () => {
    Object.entries(navByRole).forEach(([role, items]) => {
      const expectedPrefix = `/dashboard/${roleSegments[role as UserRole]}`;
      items.forEach((item) => expect(item.href.split("?")[0]).toMatch(new RegExp(`^${expectedPrefix}(?:/|$)`)));
    });
  });

  it("does not publish duplicate destinations within a role", () => {
    Object.values(navByRole).forEach((items) => {
      expect(new Set(items.map((item) => item.href)).size).toBe(items.length);
    });
  });

  it("keeps jobs and applications active states mutually exclusive", () => {
    const search = new URLSearchParams("tab=applications");
    expect(isActive("/dashboard/owner/jobs", search, "/dashboard/owner/jobs?tab=applications")).toBe(true);
    expect(isActive("/dashboard/owner/jobs", search, "/dashboard/owner/jobs")).toBe(false);
  });

  it("keeps the user shop and cart active states mutually exclusive", () => {
    const search = new URLSearchParams();
    expect(isActive("/dashboard/user/shop/cart", search, "/dashboard/user/shop/cart")).toBe(true);
    expect(isActive("/dashboard/user/shop/cart", search, "/dashboard/user/shop")).toBe(false);
  });

  it("keeps ticket purchase and owned-ticket states mutually exclusive", () => {
    const search = new URLSearchParams();
    expect(isActive("/dashboard/user/tickets/checkout/event-1", search, "/dashboard/user/tickets/buy")).toBe(true);
    expect(isActive("/dashboard/user/tickets/checkout/event-1", search, "/dashboard/user/tickets")).toBe(false);
  });

  it("resolves valid dashboard home hrefs for logo clicking across all role layouts", () => {
    expect(getDashboardHomeHref("ADMIN CONSOLE")).toBe("/dashboard/admin");
    expect(getDashboardHomeHref("OWNER LEDGER")).toBe("/dashboard/owner");
    expect(getDashboardHomeHref("WORKER TERMINAL")).toBe("/dashboard/worker");
    expect(getDashboardHomeHref("USER WORKSPACE")).toBe("/dashboard/user");
    expect(getDashboardHomeHref("AFFILIATE LEDGER")).toBe("/dashboard/affiliate");
  });
});
