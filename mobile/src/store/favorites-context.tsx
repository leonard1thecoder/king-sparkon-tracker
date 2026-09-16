import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { followFavorite, listFavoriteKeys, unfollowFavorite } from "@/lib/api";

const STORAGE_KEY = "king-sparkon-favorite-businesses";

type FavoritesState = {
  keys: string[];
  count: number;
  loading: boolean;
  refresh: () => Promise<void>;
  toggle: (businessKey: string) => Promise<void>;
  isFavorite: (businessKey: string) => boolean;
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

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [keys, setKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const cached = await readCached();
    setKeys(Array.from(cached));
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

  const value = useMemo<FavoritesState>(() => ({
    keys,
    count: keys.length,
    loading,
    refresh,
    toggle,
    isFavorite: (businessKey: string) => keys.includes(businessKey),
  }), [keys, loading, refresh, toggle]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesState {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used inside FavoritesProvider");
  return ctx;
}
