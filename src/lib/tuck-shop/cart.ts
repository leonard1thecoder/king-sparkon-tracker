import type { Product } from "@/lib/types/backend";

export type TuckShopCartLine = {
  product: Product;
  quantity: number;
};

const TUCK_SHOP_CART_KEY = "king-sparkon-tuck-shop-cart";

export function money(value?: number | null) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(Number(value ?? 0));
}

export function productPrice(product: Product) {
  return Number(product.salePrice ?? product.price ?? 0);
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
  return cart.reduce((total, line) => total + productPrice(line.product) * line.quantity, 0);
}

export function cartLineCount(cart: TuckShopCartLine[]) {
  return cart.reduce((total, line) => total + line.quantity, 0);
}

export function readTuckShopCart(): TuckShopCartLine[] {
  if (typeof window === "undefined") return [];

  try {
    const rawCart = window.localStorage.getItem(TUCK_SHOP_CART_KEY);
    if (!rawCart) return [];

    const parsed = JSON.parse(rawCart) as TuckShopCartLine[];
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((line) => line?.product?.id && Number(line.quantity) > 0);
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
  const nextCart = current.some((line) => line.product.id === product.id)
    ? current.map((line) =>
        line.product.id === product.id
          ? { ...line, product, quantity: Math.min(line.quantity + 1, Math.max(product.stockQuantity, 1)) }
          : line,
      )
    : [...current, { product, quantity: 1 }];

  writeTuckShopCart(nextCart);
  return nextCart;
}

export function updateTuckShopCartQuantity(productId: number, quantity: number) {
  const current = readTuckShopCart();
  const nextCart = current.map((line) =>
    line.product.id === productId
      ? { ...line, quantity: Math.min(Math.max(quantity, 1), Math.max(line.product.stockQuantity, 1)) }
      : line,
  );

  writeTuckShopCart(nextCart);
  return nextCart;
}

export function removeTuckShopCartLine(productId: number) {
  const nextCart = readTuckShopCart().filter((line) => line.product.id !== productId);
  writeTuckShopCart(nextCart);
  return nextCart;
}

export function clearTuckShopCart() {
  writeTuckShopCart([]);
}
