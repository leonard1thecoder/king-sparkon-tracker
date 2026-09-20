// Worker favorites — localStorage only. The backend favorites API
// (/api/v1/favorites) is business-scoped, so favorited workers are kept
// on-device as snapshots (username, job title, business) for instant cards.

export type FavoriteWorker = {
  workerId: number;
  username: string;
  jobTitle?: string | null;
  businessId?: number | null;
  businessName?: string | null;
  profilePictureUrl?: string | null;
};

export const FAVORITE_WORKERS_STORAGE_KEY = "king-sparkon-favorite-workers";
export const WORKER_FAVORITES_EVENT = "king-sparkon:worker-favorites";

export function workerFavoriteKey(workerId: number, businessId?: number | null): string {
  return `${businessId ?? "any"}:${workerId}`;
}

function keyOf(favorite: FavoriteWorker): string {
  return workerFavoriteKey(favorite.workerId, favorite.businessId);
}

export function readFavoriteWorkers(): FavoriteWorker[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FAVORITE_WORKERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FavoriteWorker[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry) => typeof entry?.workerId === "number" && typeof entry?.username === "string");
  } catch {
    return [];
  }
}

export function writeFavoriteWorkers(favorites: FavoriteWorker[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FAVORITE_WORKERS_STORAGE_KEY, JSON.stringify(favorites));
  window.dispatchEvent(new CustomEvent(WORKER_FAVORITES_EVENT, { detail: favorites }));
  window.dispatchEvent(new Event("storage")); // for same-tab listeners
}

export function isWorkerFavorited(workerId: number, businessId?: number | null): boolean {
  const key = workerFavoriteKey(workerId, businessId);
  return readFavoriteWorkers().some((entry) => keyOf(entry) === key);
}

/** Toggles a worker favorite. Returns the next favorites list. */
export function toggleFavoriteWorker(favorite: FavoriteWorker): FavoriteWorker[] {
  const current = readFavoriteWorkers();
  const key = keyOf(favorite);
  const next = current.some((entry) => keyOf(entry) === key)
    ? current.filter((entry) => keyOf(entry) !== key)
    : [...current, favorite];
  writeFavoriteWorkers(next);
  return next;
}
