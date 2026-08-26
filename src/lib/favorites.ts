// Business favorites — localStorage primary with backend sync.
// Backend now connected: spring-boot at /api/v1/favorites and /api/v1/businesses
// Endpoints implemented in king-sparkon-tracker-backend:
// - GET    /api/v1/favorites                -> string[] businessKeys for current user (authenticated)
// - GET    /api/v1/favorites/detailed       -> FollowResponse[]
// - POST   /api/v1/favorites/{businessKey}  -> follow
// - DELETE /api/v1/favorites/{businessKey}  -> unfollow
// - POST   /api/v1/favorites/{businessKey}/follow and /unfollow aliases
// - GET    /api/v1/businesses/{businessKey} and /{businessKey}/overview and /{businessKey}/products

import { apiDelete, apiGet, apiPost } from "@/lib/api/client";

export const FAVORITE_BUSINESSES_STORAGE_KEY = "king-sparkon-favorite-businesses";
// Legacy key — Job alert was renamed to Favorite. Migrate automatically.
const LEGACY_JOB_ALERTS_STORAGE_KEY = "king-sparkon-job-alert-businesses";

export function businessKey(businessId?: number | null, businessName?: string): string {
  return String(businessId ?? businessName ?? "unknown");
}

export function readFavoriteBusinessKeys(): Set<string> {
  if (typeof window === "undefined") return new Set<string>();
  try {
    const rawFavorite = window.localStorage.getItem(FAVORITE_BUSINESSES_STORAGE_KEY);
    if (rawFavorite) {
      const parsed = JSON.parse(rawFavorite) as string[];
      if (Array.isArray(parsed)) return new Set(parsed);
    }
    // Migrate legacy job alerts if favorites empty
    const rawLegacy = window.localStorage.getItem(LEGACY_JOB_ALERTS_STORAGE_KEY);
    if (rawLegacy) {
      const parsedLegacy = JSON.parse(rawLegacy) as string[];
      if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
        window.localStorage.setItem(FAVORITE_BUSINESSES_STORAGE_KEY, JSON.stringify(parsedLegacy));
        return new Set(parsedLegacy);
      }
    }
    return new Set<string>();
  } catch {
    return new Set<string>();
  }
}

export function writeFavoriteBusinessKeys(keys: Set<string>): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FAVORITE_BUSINESSES_STORAGE_KEY, JSON.stringify(Array.from(keys)));
  window.dispatchEvent(new CustomEvent("king-sparkon:favorites", { detail: Array.from(keys) }));
  window.dispatchEvent(new Event("storage")); // for same-tab listeners
}

// Backend sync — keep localStorage in sync with server. UI calls these; fallback to localStorage if offline/unauthenticated.
export async function fetchFavoriteKeysFromBackend(): Promise<Set<string>> {
  try {
    const keys = await apiGet<string[]>("/v1/favorites");
    if (Array.isArray(keys)) {
      // Sync to localStorage for offline fallback
      if (typeof window !== "undefined") {
        window.localStorage.setItem(FAVORITE_BUSINESSES_STORAGE_KEY, JSON.stringify(keys));
      }
      return new Set(keys);
    }
  } catch {
    // Fallback to localStorage — user may be offline or backend unavailable
  }
  return readFavoriteBusinessKeys();
}

export async function addFavoriteToBackend(businessKeyValue: string): Promise<void> {
  try {
    await apiPost(`/v1/favorites/${encodeURIComponent(businessKeyValue)}`);
  } catch {
    // LocalStorage already updated; backend sync will retry on next load
  }
}

export async function removeFavoriteFromBackend(businessKeyValue: string): Promise<void> {
  try {
    await apiDelete(`/v1/favorites/${encodeURIComponent(businessKeyValue)}`);
  } catch {
    // Fallback handled via localStorage
  }
}

// For favorites page: enrich key with display name — stored alongside? For now derive from products/events.
export type FavoriteBusiness = { key: string; businessName: string; businessId?: number | null };
