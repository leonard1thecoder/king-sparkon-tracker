import type { Product } from "@/lib/types/backend";
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

const TUCK_SHOP_CART_KEY = "king-sparkon-tuck-shop-cart";

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

  return Array.from(groups.values()).sort((left, right) => left.businessName.localeCompare(right.businessName));
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

function normalizeCartLine(line: Partial<TuckShopCartLine>): TuckShopCartLine | null {
  const quantity = Math.max(Number(line.quantity ?? 0), 1);

  if (line.kind === "TICKET" && line.event?.id && line.ticketType) {
    return { ...line, quantity } as TuckShopCartTicketLine;
  }

  if ((line.kind === "PRODUCT" || !line.kind) && "product" in line && line.product?.id) {
    return { kind: "PRODUCT", product: line.product, quantity } as TuckShopCartProductLine;
  }

  return null;
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

export function writeTuckShopCart(cart: TuckShopCartLine[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TUCK_SHOP_CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent("king-sparkon:tuck-shop-cart", { detail: { cart } }));
}

export function addTuckShopProductToCart(product: Product) {
  const current = readTuckShopCart();
  const nextCart = current.some((line) => isProductLine(line) && line.product.id === product.id)
    ? current.map((line) =>
        isProductLine(line) && line.product.id === product.id
          ? { ...line, product, quantity: Math.min(line.quantity + 1, Math.max(product.stockQuantity, 1)) }
          : line,
      )
    : [...current, { kind: "PRODUCT" as const, product, quantity: 1 }];

  writeTuckShopCart(nextCart);
  return nextCart;
}

export function addTicketToCart(line: TuckShopCartTicketLine) {
  const current = readTuckShopCart();
  const nextCart = current.some((cartLine) => isTicketLine(cartLine) && cartLine.event.id === line.event.id && cartLine.ticketType === line.ticketType)
    ? current.map((cartLine) =>
        isTicketLine(cartLine) && cartLine.event.id === line.event.id && cartLine.ticketType === line.ticketType
          ? { ...cartLine, ...line, quantity: cartLine.quantity + line.quantity }
          : cartLine,
      )
    : [...current, line];

  writeTuckShopCart(nextCart);
  return nextCart;
}

export function updateTuckShopCartQuantity(kind: TuckShopCartLine["kind"], id: string | number, quantity: number, ticketType?: TicketType) {
  const current = readTuckShopCart();
  const nextCart = current.map((line) => {
    if (isProductLine(line) && kind === "PRODUCT" && line.product.id === id) {
      return { ...line, quantity: Math.min(Math.max(quantity, 1), Math.max(line.product.stockQuantity, 1)) };
    }

    if (isTicketLine(line) && kind === "TICKET" && line.event.id === id && line.ticketType === ticketType) {
      const selectedType = line.event.ticketTypes.find((candidate) => candidate.type === line.ticketType);
      const maxQuantity = Math.max(selectedType?.available ?? quantity, 1);
      return { ...line, quantity: Math.min(Math.max(quantity, 1), maxQuantity) };
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
