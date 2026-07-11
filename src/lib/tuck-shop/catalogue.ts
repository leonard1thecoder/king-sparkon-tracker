import type { Product } from "@/lib/types/backend";

export type ProductBusinessGroup = {
  key: string;
  businessId?: number | null;
  businessName: string;
  products: Product[];
};

export function productBusinessName(product: Product) {
  return product.businessName?.trim() || `Business #${product.businessId ?? "-"}`;
}

export function productBusinessKey(product: Product) {
  return `${product.businessId ?? "unknown"}-${productBusinessName(product).toLowerCase()}`;
}

export function groupAllProductsByBusiness(products: Product[]): ProductBusinessGroup[] {
  const groups = new Map<string, ProductBusinessGroup>();

  products.forEach((product) => {
    const key = productBusinessKey(product);
    const existing = groups.get(key);

    if (existing) {
      existing.products.push(product);
      return;
    }

    groups.set(key, {
      key,
      businessId: product.businessId,
      businessName: productBusinessName(product),
      products: [product],
    });
  });

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      products: [...group.products].sort((left, right) => left.name.localeCompare(right.name)),
    }))
    .sort((left, right) => left.businessName.localeCompare(right.businessName));
}
