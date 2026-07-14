import type { MetadataRoute } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://king-sparkon-tracker.com").replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: siteUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/jobs`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/dev-hub`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/barcode-ai`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/register`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
  ];
}
