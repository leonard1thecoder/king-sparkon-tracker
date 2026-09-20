import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { followFavorite, listFavoriteKeys, unfollowFavorite } from "@/lib/api";
import { workerFavoriteKey, type FavoriteWorker } from "@/lib/types";

const STORAGE_KEY = "king-sparkon-favorite-businesses";
const WORKER_STORAGE_KEY = "king-sparkon-favorite-workers";

type FavoritesState = {
  keys: string[];
  count: number;
  loading: boolean;
  refresh: () => Promise<void>;
  toggle: (businessKey: string) => Promise<void>;
  isFavorite: (businessKey: string) => boolean;
  workerFavorites: FavoriteWorker[];
  toggleWorkerFavorite: (worker: FavoriteWorker) => Promise<void>;
  isWorkerFavorite: (workerId: number, businessId?: number | null) => boolean;
};

const FavoritesContext = createContext<FavoritesState | null>(null);

async function readCached(): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as string[];
      if (Array.isArray(parsed)) return new Set(parsed);
    }
  } catch {
    // Corrupt cache — fall through to empty set.
  }
  return new Set<string>();
}

async function readCachedWorkers(): Promise<FavoriteWorker[]> {
  try {
    const raw = await AsyncStorage.getItem(WORKER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as FavoriteWorker[];
      if (Array.isArray(parsed)) {
        return parsed.filter((entry) => typeof entry?.workerId === "number" && typeof entry?.username === "string");
      }
    }
  } catch {
    // Corrupt cache — fall through to empty list.
  }
  return [];
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [keys, setKeys] = useState<string[]>([]);
  const [workerFavorites, setWorkerFavorites] = useState<FavoriteWorker[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const cached = await readCached();
    setKeys(Array.from(cached));
    setWorkerFavorites(await readCachedWorkers());
    try {
      const remote = await listFavoriteKeys();
      if (Array.isArray(remote)) {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
        setKeys(remote);
      }
    } catch {
      // Offline or unauthenticated — cached keys stand in (web parity).
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const toggle = useCallback(async (businessKey: string) => {
    const next = new Set(keys);
    if (next.has(businessKey)) {
      next.delete(businessKey);
      setKeys(Array.from(next));
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      await unfollowFavorite(businessKey).catch(() => undefined);
    } else {
      next.add(businessKey);
      setKeys(Array.from(next));
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      await followFavorite(businessKey).catch(() => undefined);
    }
  }, [keys]);

  const toggleWorkerFavorite = useCallback(async (worker: FavoriteWorker) => {
    const key = workerFavoriteKey(worker.workerId, worker.businessId);
    const cached = await readCachedWorkers();
    const next = cached.some((entry) => workerFavoriteKey(entry.workerId, entry.businessId) === key)
      ? cached.filter((entry) => workerFavoriteKey(entry.workerId, entry.businessId) !== key)
      : [...cached, worker];
    setWorkerFavorites(next);
    await AsyncStorage.setItem(WORKER_STORAGE_KEY, JSON.stringify(next));
  }, []);

  const isWorkerFavorite = useCallback(
    (workerId: number, businessId?: number | null) =>
      workerFavorites.some((entry) => workerFavoriteKey(entry.workerId, entry.businessId) === workerFavoriteKey(workerId, businessId)),
    [workerFavorites],
  );

  const value = useMemo<FavoritesState>(() => ({
    keys,
    count: keys.length,
    loading,
    refresh,
    toggle,
    isFavorite: (businessKey: string) => keys.includes(businessKey),
    workerFavorites,
    toggleWorkerFavorite,
    isWorkerFavorite,
  }), [keys, loading, refresh, toggle, workerFavorites, toggleWorkerFavorite, isWorkerFavorite]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesState {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used inside FavoritesProvider");
  return ctx;
}
