import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Tip cart (tray) — mirrors web `src/lib/tips/cart.ts`.
// Same flow: scan worker QR → set amount → submit stores an intent here →
// the cart pays all intents through the shared PayFast cart payout.

export type TipTrayLine = {
  workerId: number;
  workerLabel: string;
  tipAmount: number;
  createdAt: string;
};

const STORAGE_KEY = "king-sparkon-tip-tray";

type TipTrayState = {
  lines: TipTrayLine[];
  count: number;
  total: number;
  loading: boolean;
  refresh: () => Promise<void>;
  add: (line: Omit<TipTrayLine, "createdAt">) => Promise<void>;
  remove: (workerId: number, tipAmount?: number) => Promise<void>;
  clear: () => Promise<void>;
};

const TipTrayContext = createContext<TipTrayState | null>(null);

async function readStored(): Promise<TipTrayLine[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as TipTrayLine[];
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (line) => Number.isFinite(Number(line?.workerId)) && Number(line?.tipAmount) > 0,
        );
      }
    }
  } catch {
    // Corrupt cache — fall through to empty.
  }
  return [];
}

async function writeStored(lines: TipTrayLine[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
}

export function TipTrayProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<TipTrayLine[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    // Intents pay through the shared cart payout; a fulfilled cart clears
    // the tray, so refresh just reloads valid lines.
    setLines(await readStored());
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const add = useCallback(async (line: Omit<TipTrayLine, "createdAt">) => {
    const stored = await readStored();
    const next = [
      { ...line, createdAt: new Date().toISOString() },
      ...stored.filter(
        (entry) => !(entry.workerId === line.workerId && Number(entry.tipAmount) === Number(line.tipAmount)),
      ),
    ];
    await writeStored(next);
    setLines(next);
  }, []);

  const remove = useCallback(async (workerId: number, tipAmount?: number) => {
    const stored = await readStored();
    const next = stored.filter((entry) =>
      tipAmount === undefined
        ? entry.workerId !== workerId
        : !(entry.workerId === workerId && Number(entry.tipAmount) === Number(tipAmount)),
    );
    await writeStored(next);
    setLines(next);
  }, []);

  const clear = useCallback(async () => {
    await writeStored([]);
    setLines([]);
  }, []);

  const value = useMemo<TipTrayState>(() => ({
    lines,
    count: lines.length,
    total: lines.reduce((sum, line) => sum + Number(line.tipAmount ?? 0), 0),
    loading,
    refresh,
    add,
    remove,
    clear,
  }), [lines, loading, refresh, add, remove, clear]);

  return <TipTrayContext.Provider value={value}>{children}</TipTrayContext.Provider>;
}

export function useTipTray(): TipTrayState {
  const ctx = useContext(TipTrayContext);
  if (!ctx) throw new Error("useTipTray must be used inside TipTrayProvider");
  return ctx;
}
