// Business favorites — localStorage implementation with backend stubs.
// TODO (backend): Replace localStorage with real API:
// - GET    /api/user/favorites                -> list favorited business keys
// - POST   /api/user/favorites                -> { businessKey, businessName, businessId } add
// - DELETE /api/user/favorites/{businessKey}  -> remove
// - The favorites page at /dashboard/user/favorites should be populated from server so it persists across devices.
// Keep comments for backend implementation.

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
  // Backend stub:
  // await apiClient.post("/user/favorites", { businessKeys: Array.from(keys) });
  window.dispatchEvent(new CustomEvent("king-sparkon:favorites", { detail: Array.from(keys) }));
  window.dispatchEvent(new Event("storage")); // for same-tab listeners
}

// For favorites page: enrich key with display name — stored alongside? For now derive from products/events.
export type FavoriteBusiness = { key: string; businessName: string; businessId?: number | null };
