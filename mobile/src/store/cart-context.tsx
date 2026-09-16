import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type CartLine = { productId: number; name: string; price: number; quantity: number };

type CartState = {
  lines: CartLine[];
  count: number;
  total: number;
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  remove: (productId: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  const value = useMemo<CartState>(() => {
    const count = lines.reduce((sum, line) => sum + line.quantity, 0);
    const total = lines.reduce((sum, line) => sum + line.quantity * line.price, 0);
    return {
      lines,
      count,
      total,
      add: (line, quantity = 1) =>
        setLines((prev) => {
          const existing = prev.find((entry) => entry.productId === line.productId);
          if (!existing) return [...prev, { ...line, quantity }];
          return prev.map((entry) =>
            entry.productId === line.productId ? { ...entry, quantity: entry.quantity + quantity } : entry,
          );
        }),
      remove: (productId) => setLines((prev) => prev.filter((entry) => entry.productId !== productId)),
      setQuantity: (productId, quantity) =>
        setLines((prev) =>
          quantity <= 0
            ? prev.filter((entry) => entry.productId !== productId)
            : prev.map((entry) => (entry.productId === productId ? { ...entry, quantity } : entry)),
        ),
      clear: () => setLines([]),
    };
  }, [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
