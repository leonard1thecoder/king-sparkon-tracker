import type { MetadataRoute } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://king-sparkon-tracker.com").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/jobs", "/jobs/", "/dev-hub", "/barcode-ai", "/login", "/register"],
      disallow: ["/api/", "/dashboard/", "/admin/", "/reset-password", "/verify-email"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
