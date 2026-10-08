import type { MetadataRoute } from "next";
import { getPublicJobs, getPublicProducts, getPublishedEvents } from "@/lib/public/data";
import { buildSlug } from "@/lib/public/slug";

const siteUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://king-sparkon-tracker.com").replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/events`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/mall`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/jobs`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/jobs/unemployment-insurance-fund`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/features`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/guides`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/articles`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/dev-hub`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${siteUrl}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  // Dynamic entries come only from real backend data. If a read fails, the
  // helpers return empty arrays and the static entries are still produced.
  const [events, products, jobs] = await Promise.all([
    getPublishedEvents(),
    getPublicProducts(500),
    getPublicJobs(500),
  ]);

  return [
    ...staticEntries,
    ...events.map((event) => ({
      url: `${siteUrl}/events/${buildSlug(event.name, event.id)}`,
      lastModified: event.updatedAt ? new Date(event.updatedAt) : now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...products.map((product) => ({
      url: `${siteUrl}/mall/products/${buildSlug(product.name, product.id)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...jobs.map((job) => ({
      url: `${siteUrl}/jobs/${job.id}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
  ];
}
