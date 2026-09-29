import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { ServiceLineKind } from "@/lib/api";

export type ProductCartLine = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  returnableEnabled?: boolean;
  returnablePrice?: number;
  emptiesReturned?: number;
};

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

export function lineDeposit(line: ProductCartLine) {
  if (!line.returnableEnabled) return 0;
  const deposit = Number(line.returnablePrice ?? 0);
  return Number.isFinite(deposit) && deposit > 0 ? deposit : 0;
}

export function clampLineEmpties(line: ProductCartLine, empties: number) {
  if (!line.returnableEnabled || lineDeposit(line) <= 0) return 0;
  const safe = Math.floor(Number(empties ?? 0));
  if (!Number.isFinite(safe)) return 0;
  return Math.min(Math.max(safe, 0), Math.max(Math.floor(Number(line.quantity ?? 0)), 0));
}

export function lineEmpties(line: ProductCartLine) {
  return clampLineEmpties(line, line.emptiesReturned ?? 0);
}

export function lineCredit(line: ProductCartLine) {
  return lineDeposit(line) * lineEmpties(line);
}

export function lineGross(line: ProductCartLine) {
  return Number(line.price ?? 0) * Math.max(Math.floor(Number(line.quantity ?? 0)), 0);
}

export function lineNet(line: ProductCartLine) {
  return lineGross(line) - lineCredit(line);
}

type CartState = {
  lines: CartLine[];
  count: number;
  total: number;
  depositTotal: number;
  creditTotal: number;
  netTotal: number;
  returnableUnitCount: number;
  emptiesCount: number;
  add: (line: Omit<ProductCartLine, "quantity" | "emptiesReturned">, quantity?: number) => void;
  addService: (input: { serviceKind: ServiceLineKind; referenceId: string; label: string; price: number }) => void;
  remove: (productId: number | string) => void;
  setQuantity: (productId: number | string, quantity: number) => void;
  setEmpties: (productId: number | string, empties: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  const value = useMemo<CartState>(() => {
    const products = lines.filter((entry): entry is ProductCartLine => !isServiceLine(entry));
    const count = lines.reduce((sum, line) => sum + line.quantity, 0);
    const total = lines.reduce((sum, line) => sum + line.quantity * line.price, 0);
    const depositTotal = products.reduce((sum, line) => sum + lineDeposit(line) * line.quantity, 0);
    const creditTotal = products.reduce((sum, line) => sum + lineCredit(line), 0);
    const returnableUnitCount = products.reduce((sum, line) => sum + (line.returnableEnabled ? line.quantity : 0), 0);
    const emptiesCount = products.reduce((sum, line) => sum + lineEmpties(line), 0);
    return {
      lines,
      count,
      total,
      depositTotal,
      creditTotal,
      netTotal: total - creditTotal,
      returnableUnitCount,
      emptiesCount,
      add: (line, quantity = 1) =>
        setLines((prev) => {
          const existing = prev.find((entry) => !isServiceLine(entry) && entry.productId === line.productId);
          if (!existing) return [...prev, { ...line, quantity, emptiesReturned: 0 }];
          return prev.map((entry) => {
            if (isServiceLine(entry) || entry.productId !== line.productId) return entry;
            const next: ProductCartLine = {
              ...entry,
              ...line,
              quantity: entry.quantity + quantity,
              emptiesReturned: entry.emptiesReturned ?? 0,
            };
            return { ...next, emptiesReturned: clampLineEmpties(next, next.emptiesReturned ?? 0) };
          });
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
                if (entry.productId !== id) return entry;
                const next: ProductCartLine = { ...entry, quantity };
                return { ...next, emptiesReturned: clampLineEmpties(next, next.emptiesReturned ?? 0) };
              }),
        ),
      setEmpties: (id, empties) =>
        setLines((prev) =>
          prev.map((entry) => {
            if (isServiceLine(entry) || entry.productId !== id) return entry;
            return { ...entry, emptiesReturned: clampLineEmpties(entry, empties) };
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
