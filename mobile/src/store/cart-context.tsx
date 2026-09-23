import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { ServiceLineKind } from "@/lib/api";

export type ProductCartLine = { productId: number; name: string; price: number; quantity: number };

export type ServiceCartLine = {
  kind: "SERVICE";
  key: string;
  serviceKind: ServiceLineKind;
  referenceId: string;
  label: string;
  price: number;
  quantity: number;
};

export type CartLine = ProductCartLine | ServiceCartLine;

export function isServiceLine(line: CartLine): line is ServiceCartLine {
  return (line as ServiceCartLine).kind === "SERVICE";
}

type CartState = {
  lines: CartLine[];
  count: number;
  total: number;
  add: (line: Omit<ProductCartLine, "quantity">, quantity?: number) => void;
  addService: (input: { serviceKind: ServiceLineKind; referenceId: string; label: string; price: number }) => void;
  remove: (productId: number | string) => void;
  setQuantity: (productId: number | string, quantity: number) => void;
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
          const existing = prev.find((entry) => !isServiceLine(entry) && entry.productId === line.productId);
          if (!existing) return [...prev, { ...line, quantity }];
          return prev.map((entry) =>
            !isServiceLine(entry) && entry.productId === line.productId
              ? { ...entry, quantity: entry.quantity + quantity }
              : entry,
          );
        }),
      addService: (input) =>
        setLines((prev) => {
          const key = `${input.serviceKind}:${input.referenceId}`;
          const next: ServiceCartLine = {
            kind: "SERVICE",
            key,
            serviceKind: input.serviceKind,
            referenceId: input.referenceId,
            label: input.label,
            price: input.price,
            quantity: 1,
          };
          const existing = prev.some((entry) => isServiceLine(entry) && entry.key === key);
          if (!existing) return [...prev, next];
          return prev.map((entry) => (isServiceLine(entry) && entry.key === key ? next : entry));
        }),
      remove: (id) =>
        setLines((prev) =>
          prev.filter((entry) => (isServiceLine(entry) ? entry.key !== id : entry.productId !== id)),
        ),
      setQuantity: (id, quantity) =>
        setLines((prev) =>
          quantity <= 0
            ? prev.filter((entry) => (isServiceLine(entry) ? entry.key !== id : entry.productId !== id))
            : prev.map((entry) => {
                if (isServiceLine(entry)) return entry.key === id ? { ...entry, quantity: 1 } : entry;
                return entry.productId === id ? { ...entry, quantity } : entry;
              }),
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
