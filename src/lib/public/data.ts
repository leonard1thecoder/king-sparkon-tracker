import { backendBaseUrl } from "@/lib/backend-auth";
export { buildSlug, idFromSlug, slugify } from "@/lib/public/slug";
import type { TicketEvent } from "@/types/tickets";
import type { PageResponse, Product } from "@/lib/types/backend";

/*
 * Server-side reads for public pages.
 *
 * The browser API client goes through /api/backend, which requires an auth
 * cookie. Public pages must not depend on that, so they call the backend
 * directly from the server. Every helper returns null or an empty array when
 * the backend is unreachable or refuses anonymous access. Pages render a
 * designed empty state in that case. Nothing is ever faked.
 */

const REVALIDATE_SECONDS = 300;

async function publicGet<T>(path: string): Promise<T | null> {
  try {
    const url = new URL(`/api${path}`, backendBaseUrl());
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function unwrapList<T>(payload: PageResponse<T> | T[] | null): T[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload.content) ? payload.content : [];
}

export async function getPublishedEvents(): Promise<TicketEvent[]> {
  const payload = await publicGet<PageResponse<TicketEvent> | TicketEvent[]>("/v1/tickets/events");
  return unwrapList(payload).filter((event) => event.status === "PUBLISHED");
}

export async function getPublishedEventById(id: string): Promise<TicketEvent | null> {
  const event = await publicGet<TicketEvent>(`/v1/tickets/events/${encodeURIComponent(id)}`);
  return event && event.status === "PUBLISHED" ? event : null;
}

export async function getPublicProducts(size = 24): Promise<Product[]> {
  const payload = await publicGet<PageResponse<Product> | Product[]>(`/v1/tuck-shop/products?page=0&size=${size}`);
  return unwrapList(payload);
}

export async function getPublicProductById(id: number): Promise<Product | null> {
  const products = await getPublicProducts(100);
  return products.find((product) => product.id === id) ?? null;
}

export type PublicJob = {
  id: number;
  title: string;
  companyName: string;
  location: string;
  description: string;
  status: string;
};

export async function getPublicJobs(size = 12): Promise<PublicJob[]> {
  const payload = await publicGet<PageResponse<PublicJob> | PublicJob[]>(`/opportunities/jobs?page=0&size=${size}`);
  return unwrapList(payload).filter((job) => job.status === "OPEN");
}
