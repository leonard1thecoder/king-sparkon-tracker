import type { MetadataRoute } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://king-sparkon-tracker.com").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/about",
          "/how-it-works",
          "/features",
          "/guides",
          "/guides/",
          "/jobs",
          "/jobs/",
          "/dev-hub",
          "/barcode-ai",
          "/contact",
          "/faq",
          "/privacy",
          "/terms",
        ],
        disallow: [
          "/api/",
          "/dashboard/",
          "/admin/",
          "/login",
          "/register",
          "/register-affiliate",
          "/register-admin",
          "/forgot-password",
          "/reset-password",
          "/verify-email",
          "/resend-verification",
          "/*?*plan=*",
          "/*?*privilege=*",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
