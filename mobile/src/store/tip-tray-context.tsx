import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { listSentTips } from "@/lib/api";

// Tip cart (tray) — mirrors web `src/lib/tips/cart.ts`.
// Same flow: scan worker QR → set amount → submit creates the tip
// (UNPAID) and adds it here → pay from the cart.

export type TipTrayLine = {
  tipId: number;
  workerId: number;
  workerLabel: string;
  tipAmount: number;
  paymentReference?: string | null;
  paymentUrl?: string | null;
  createdAt: string;
};

const STORAGE_KEY = "king-sparkon-tip-tray";

type TipTrayState = {
  lines: TipTrayLine[];
  count: number;
  total: number;
  loading: boolean;
  refresh: () => Promise<void>;
  add: (line: TipTrayLine) => Promise<void>;
  remove: (tipId: number) => Promise<void>;
  clear: () => Promise<void>;
};

const TipTrayContext = createContext<TipTrayState | null>(null);

async function readStored(): Promise<TipTrayLine[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as TipTrayLine[];
      if (Array.isArray(parsed)) return parsed;
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
    const stored = await readStored();
    try {
      // Reconcile: paid tips leave the cart (same as web via /tips/sent).
      const sent = await listSentTips().catch(() => []);
      const paidIds = new Set(
        sent.filter((tip) => String(tip.status ?? "").toUpperCase() === "PAID").map((tip) => tip.id),
      );
      const next = paidIds.size > 0 ? stored.filter((line) => !paidIds.has(line.tipId)) : stored;
      await writeStored(next);
      setLines(next);
    } catch {
      setLines(stored);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const add = useCallback(async (line: TipTrayLine) => {
    const stored = await readStored();
    const next = [line, ...stored.filter((entry) => entry.tipId !== line.tipId)];
    await writeStored(next);
    setLines(next);
  }, []);

  const remove = useCallback(async (tipId: number) => {
    const stored = await readStored();
    const next = stored.filter((entry) => entry.tipId !== tipId);
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
