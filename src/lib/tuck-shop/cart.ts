import type { Product, TuckShopPurchase } from "@/lib/types/backend";
import type { TicketEvent, TicketType } from "@/types/tickets";

export type TuckShopCartProductLine = {
  kind: "PRODUCT";
  product: Product;
  quantity: number;
};

export type TuckShopCartTicketLine = {
  kind: "TICKET";
  event: TicketEvent;
  ticketType: TicketType;
  ticketTypeLabel: string;
  unitPrice: number;
  quantity: number;
};

export type TuckShopCartLine = TuckShopCartProductLine | TuckShopCartTicketLine;

export type TuckShopPurchaseHistoryItem = {
  id: string;
  transactionId?: number;
  createdAt: string;
  businessId?: number | null;
  businessName?: string | null;
  paymentStatus?: string | null;
  paymentReference?: string | null;
  productTotal: number;
  items: Array<{
    productId: number;
    productName: string;
    productImageUrl?: string | null;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
};

const TUCK_SHOP_CART_KEY = "king-sparkon-tuck-shop-cart";
const TUCK_SHOP_PURCHASE_HISTORY_KEY = "king-sparkon-user-purchase-history";
const MAX_USER_CATALOGUE_BUSINESSES = 5;

export function money(value?: number | null) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(Number(value ?? 0));
}

export function productPrice(product: Product) {
  return Number(product.salePrice ?? product.price ?? 0);
}

export function ticketLinePrice(line: TuckShopCartTicketLine) {
  return Number(line.unitPrice ?? 0);
}

export function cartLineUnitPrice(line: TuckShopCartLine) {
  return line.kind === "PRODUCT" ? productPrice(line.product) : ticketLinePrice(line);
}

export function productImage(product: Product) {
  return product.productImageUrl || "/king-sparkon-logo.png";
}

export function businessName(product: Product) {
  return product.businessName?.trim() || `Business #${product.businessId ?? "-"}`;
}

export function businessGroupKey(product: Product) {
  return `${product.businessId ?? "unknown"}-${businessName(product).toLowerCase()}`;
}

export function groupProductsByBusiness(products: Product[]) {
  const groups = new Map<string, { key: string; businessId?: number | null; businessName: string; products: Product[] }>();

  products.forEach((product) => {
    const key = businessGroupKey(product);
    const existing = groups.get(key);

    if (existing) {
      existing.products.push(product);
      return;
    }

    groups.set(key, {
      key,
      businessId: product.businessId,
      businessName: businessName(product),
      products: [product],
    });
  });

  return Array.from(groups.values())
    .sort((left, right) => left.businessName.localeCompare(right.businessName))
    .slice(0, MAX_USER_CATALOGUE_BUSINESSES);
}

export function cartTotal(cart: TuckShopCartLine[]) {
  return cart.reduce((total, line) => total + cartLineUnitPrice(line) * line.quantity, 0);
}

export function cartProductTotal(cart: TuckShopCartLine[]) {
  return cart.filter(isProductLine).reduce((total, line) => total + productPrice(line.product) * line.quantity, 0);
}

export function cartTicketTotal(cart: TuckShopCartLine[]) {
  return cart.filter(isTicketLine).reduce((total, line) => total + ticketLinePrice(line) * line.quantity, 0);
}

export function cartLineCount(cart: TuckShopCartLine[]) {
  return cart.reduce((total, line) => total + line.quantity, 0);
}

export function isProductLine(line: TuckShopCartLine): line is TuckShopCartProductLine {
  return line.kind === "PRODUCT";
}

export function isTicketLine(line: TuckShopCartLine): line is TuckShopCartTicketLine {
  return line.kind === "TICKET";
}

function productLineMaxQuantity(product: Product) {
  return Math.max(product.stockQuantity ?? 1, 1);
}

function ticketLineMaxQuantity(line: TuckShopCartTicketLine) {
  return Math.max(line.event.ticketTypes.find((candidate) => candidate.type === line.ticketType)?.available ?? line.quantity, 1);
}

function normalizeCartLine(line: Partial<TuckShopCartLine>): TuckShopCartLine | null {
  const quantity = Math.max(Number(line.quantity ?? 0), 1);

  if (line.kind === "TICKET" && line.event?.id && line.ticketType) {
    const nextLine = { ...line, quantity } as TuckShopCartTicketLine;
    return { ...nextLine, quantity: Math.min(nextLine.quantity, ticketLineMaxQuantity(nextLine)) };
  }

  if ((line.kind === "PRODUCT" || !line.kind) && "product" in line && line.product?.id) {
    return { kind: "PRODUCT", product: line.product, quantity: Math.min(quantity, productLineMaxQuantity(line.product)) } as TuckShopCartProductLine;
  }

  return null;
}

function normalizePurchaseHistoryItem(item: Partial<TuckShopPurchaseHistoryItem>): TuckShopPurchaseHistoryItem | null {
  if (!item.id || !Array.isArray(item.items)) return null;

  return {
    id: item.id,
    transactionId: item.transactionId,
    createdAt: item.createdAt || new Date().toISOString(),
    businessId: item.businessId,
    businessName: item.businessName,
    paymentStatus: item.paymentStatus,
    paymentReference: item.paymentReference,
    productTotal: Number(item.productTotal ?? 0),
    items: item.items.map((line) => ({
      productId: Number(line.productId),
      productName: String(line.productName ?? "Product"),
      productImageUrl: line.productImageUrl,
      quantity: Number(line.quantity ?? 0),
      unitPrice: Number(line.unitPrice ?? 0),
      lineTotal: Number(line.lineTotal ?? 0),
    })),
  };
}

export function readTuckShopCart(): TuckShopCartLine[] {
  if (typeof window === "undefined") return [];

  try {
    const rawCart = window.localStorage.getItem(TUCK_SHOP_CART_KEY);
    if (!rawCart) return [];

    const parsed = JSON.parse(rawCart) as Array<Partial<TuckShopCartLine>>;
    if (!Array.isArray(parsed)) return [];

    return parsed.map(normalizeCartLine).filter((line): line is TuckShopCartLine => Boolean(line));
  } catch {
    return [];
  }
}

export function readTuckShopPurchaseHistory(): TuckShopPurchaseHistoryItem[] {
  if (typeof window === "undefined") return [];

  try {
    const rawHistory = window.localStorage.getItem(TUCK_SHOP_PURCHASE_HISTORY_KEY);
    if (!rawHistory) return [];

    const parsed = JSON.parse(rawHistory) as Array<Partial<TuckShopPurchaseHistoryItem>>;
    if (!Array.isArray(parsed)) return [];

    return parsed.map(normalizePurchaseHistoryItem).filter((item): item is TuckShopPurchaseHistoryItem => Boolean(item));
  } catch {
    return [];
  }
}

export function writeTuckShopCart(cart: TuckShopCartLine[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TUCK_SHOP_CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent("king-sparkon:tuck-shop-cart", { detail: { cart } }));
}

export function saveTuckShopPurchaseHistory(purchase: TuckShopPurchase) {
  if (typeof window === "undefined") return [];

  const historyItem: TuckShopPurchaseHistoryItem = {
    id: String(purchase.transactionId ?? `${Date.now()}`),
    transactionId: purchase.transactionId,
    createdAt: purchase.createdAt ?? new Date().toISOString(),
    businessId: purchase.businessId,
    businessName: purchase.businessName,
    paymentStatus: purchase.paymentStatus,
    paymentReference: purchase.paymentReference,
    productTotal: Number(purchase.productTotal ?? 0),
    items: (purchase.items ?? []).map((item) => ({
      productId: item.productId,
      productName: item.productName,
      productImageUrl: item.productImageUrl,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
    })),
  };

  const nextHistory = [historyItem, ...readTuckShopPurchaseHistory().filter((item) => item.id !== historyItem.id)].slice(0, 30);
  window.localStorage.setItem(TUCK_SHOP_PURCHASE_HISTORY_KEY, JSON.stringify(nextHistory));
  window.dispatchEvent(new CustomEvent("king-sparkon:tuck-shop-purchase-history", { detail: { history: nextHistory } }));
  return nextHistory;
}

export function addTuckShopProductToCart(product: Product, quantity = 1) {
  const current = readTuckShopCart();
  const safeQuantity = Math.max(Number(quantity || 1), 1);
  const maxQuantity = productLineMaxQuantity(product);
  const nextCart = current.some((line) => isProductLine(line) && line.product.id === product.id)
    ? current.map((line) =>
        isProductLine(line) && line.product.id === product.id
          ? { ...line, product, quantity: Math.min(line.quantity + safeQuantity, maxQuantity) }
          : line,
      )
    : [...current, { kind: "PRODUCT" as const, product, quantity: Math.min(safeQuantity, maxQuantity) }];

  writeTuckShopCart(nextCart);
  return nextCart;
}

export function addTicketToCart(line: TuckShopCartTicketLine) {
  const current = readTuckShopCart();
  const maxQuantity = ticketLineMaxQuantity(line);
  const nextCart = current.some((cartLine) => isTicketLine(cartLine) && cartLine.event.id === line.event.id && cartLine.ticketType === line.ticketType)
    ? current.map((cartLine) =>
        isTicketLine(cartLine) && cartLine.event.id === line.event.id && cartLine.ticketType === line.ticketType
          ? { ...cartLine, ...line, quantity: Math.min(cartLine.quantity + line.quantity, maxQuantity) }
          : cartLine,
      )
    : [...current, { ...line, quantity: Math.min(line.quantity, maxQuantity) }];

  writeTuckShopCart(nextCart);
  return nextCart;
}

export function updateTuckShopCartQuantity(kind: TuckShopCartLine["kind"], id: string | number, quantity: number, ticketType?: TicketType) {
  const current = readTuckShopCart();
  const nextCart = current.map((line) => {
    if (isProductLine(line) && kind === "PRODUCT" && line.product.id === id) {
      return { ...line, quantity: Math.min(Math.max(quantity, 1), productLineMaxQuantity(line.product)) };
    }

    if (isTicketLine(line) && kind === "TICKET" && line.event.id === id && line.ticketType === ticketType) {
      return { ...line, quantity: Math.min(Math.max(quantity, 1), ticketLineMaxQuantity(line)) };
    }

    return line;
  });

  writeTuckShopCart(nextCart);
  return nextCart;
}

export function removeTuckShopCartLine(kind: TuckShopCartLine["kind"], id: string | number, ticketType?: TicketType) {
  const nextCart = readTuckShopCart().filter((line) => {
    if (isProductLine(line) && kind === "PRODUCT") return line.product.id !== id;
    if (isTicketLine(line) && kind === "TICKET") return line.event.id !== id || line.ticketType !== ticketType;
    return true;
  });

  writeTuckShopCart(nextCart);
  return nextCart;
}

export function clearTuckShopCart() {
  writeTuckShopCart([]);
}
