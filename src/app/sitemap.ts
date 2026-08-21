import type { MetadataRoute } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://king-sparkon-tracker.com").replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: siteUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/how-it-works`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/features`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/guides`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/guides/barcode-inventory-guide`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/guides/qr-ticket-operations`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/guides/worker-tips-payouts`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/guides/affiliate-referrals`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/jobs`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/dev-hub`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/barcode-ai`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${siteUrl}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${siteUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
  ];
}
