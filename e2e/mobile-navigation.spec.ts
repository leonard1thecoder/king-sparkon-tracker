import { expect, test } from "@playwright/test";

const viewports = [
  { width: 320, height: 740 },
  { width: 375, height: 812 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
] as const;

function token() {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ sub: "owner-e2e", roles: ["Owner"], exp: 4_102_444_800 })).toString("base64url");
  return `${header}.${payload}.signature`;
}

for (const viewport of viewports) {
  test(`owner navigation works at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.context().addCookies([{
      name: "king_sparkon_tracker_access_token",
      value: token(),
      url: "http://127.0.0.1:3000",
      httpOnly: true,
      sameSite: "Lax",
    }]);
    await page.route("**/api/**", (route) => {
      const pathname = new URL(route.request().url()).pathname;
      const arrayResponse = pathname.includes("/products/barcode-automation")
        || pathname.includes("/product-promotions/");
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(arrayResponse
          ? []
          : { content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 }),
      });
    });
    await page.goto("/dashboard/owner", { waitUntil: "domcontentloaded" });

    if (viewport.width < 1024) {
      const open = page.getByRole("button", { name: "Open dashboard navigation" });
      await expect(open).toBeVisible();
      await open.click();
      await expect(page.getByRole("button", { name: "Close dashboard navigation" })).toBeVisible();
      await expect(page.getByRole("navigation").first()).toBeVisible();
      await page.getByRole("button", { name: "Close dashboard navigation" }).click();
      await expect(page.getByRole("button", { name: "Open dashboard navigation" })).toBeVisible();
    } else {
      await expect(page.getByRole("navigation").first()).toBeVisible();
      await expect(page.getByRole("button", { name: "Open dashboard navigation" })).toBeHidden();
    }
  });
}
