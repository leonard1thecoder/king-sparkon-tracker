import { expect, test, type Page } from "@playwright/test";

const cookieName = "king_sparkon_tracker_access_token";
const routesByRole = {
  Admin: [
    "/dashboard/admin", "/dashboard/admin/capacity", "/dashboard/admin/users", "/dashboard/admin/businesses",
    "/dashboard/admin/products", "/dashboard/admin/tickets", "/dashboard/admin/jobs", "/dashboard/admin/affiliates",
    "/dashboard/admin/tips", "/dashboard/admin/promotions", "/dashboard/admin/discounts", "/dashboard/admin/reports",
    "/dashboard/admin/audit", "/dashboard/admin/developer", "/dashboard/admin/settings", "/dashboard/admin/profile",
  ],
  Owner: [
    "/dashboard/owner", "/dashboard/owner/products", "/dashboard/owner/workers", "/dashboard/owner/transactions",
    "/dashboard/owner/withdrawals", "/dashboard/owner/tips", "/dashboard/owner/tickets", "/dashboard/owner/jobs",
    "/dashboard/owner/promotions", "/dashboard/owner/billing", "/dashboard/owner/settings", "/dashboard/owner/profile",
  ],
  Worker: [
    "/dashboard/worker", "/dashboard/worker/products", "/dashboard/worker/scan", "/dashboard/worker/orders",
    "/dashboard/worker/transactions", "/dashboard/worker/tickets/scan", "/dashboard/worker/tips", "/dashboard/worker/profile",
  ],
  Affiliate: [
    "/dashboard/affiliate", "/dashboard/affiliate/referrals", "/dashboard/affiliate/assets", "/dashboard/affiliate/leads",
    "/dashboard/affiliate/commissions", "/dashboard/affiliate/payouts", "/dashboard/affiliate/profile",
  ],
  User: [
    "/dashboard/user", "/dashboard/user/shop", "/dashboard/user/shop/cart", "/dashboard/user/carts",
    "/dashboard/user/tickets/buy", "/dashboard/user/tickets", "/dashboard/user/jobs", "/dashboard/user/applications",
    "/dashboard/user/tips/scan", "/dashboard/user/profile",
  ],
} as const;

type Role = keyof typeof routesByRole;

function token(role: Role) {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ sub: `${role.toLowerCase()}-e2e`, roles: [role], exp: 4_102_444_800 })).toString("base64url");
  return `${header}.${payload}.signature`;
}

async function authenticate(page: Page, role: Role) {
  await page.context().addCookies([{ name: cookieName, value: token(role), url: "http://127.0.0.1:3000", httpOnly: true, sameSite: "Lax" }]);
}

async function mockBackend(page: Page) {
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.startsWith("/_next/")) return route.continue();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 }),
    });
  });
}

for (const [role, routes] of Object.entries(routesByRole) as Array<[Role, readonly string[]]>) {
  test.describe(`${role} navigation`, () => {
    test.beforeEach(async ({ page }) => {
      await authenticate(page, role);
      await mockBackend(page);
    });

    for (const route of routes) {
      test(`${route} loads inside the correct role boundary`, async ({ page }) => {
        const response = await page.goto(route, { waitUntil: "domcontentloaded" });
        expect(response?.status()).toBeLessThan(400);
        await expect(page).toHaveURL(new RegExp(`${route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:\\?.*)?$`));
        await expect(page.getByRole("navigation").first()).toBeVisible();
        await expect(page.locator("body")).not.toContainText("404");
      });
    }
  });
}

test("unauthenticated dashboard access redirects to login with next", async ({ page }) => {
  await page.goto("/dashboard/owner/products");
  await expect(page).toHaveURL(/\/login\?next=%2Fdashboard%2Fowner%2Fproducts/);
});

test("cross-role access redirects to the authenticated role dashboard", async ({ page }) => {
  await authenticate(page, "Worker");
  await mockBackend(page);
  await page.goto("/dashboard/admin/users");
  await expect(page).toHaveURL(/\/dashboard\/worker$/);
});
