import type { OpenApiClientPathTemplate } from "@/lib/api/generated/openapi-paths";

function contractPath<T extends OpenApiClientPathTemplate>(path: T) {
  return path;
}

function bindPath(template: string, parameters: Record<string, string | number>) {
  return Object.entries(parameters).reduce(
    (path, [name, value]) => path.replace(`{${name}}`, encodeURIComponent(String(value))),
    template,
  );
}

export const apiContract = {
  tips: {
    root: contractPath("/tips"),
    owner: contractPath("/tips/owner"),
    withdrawals: contractPath("/tips/withdrawals"),
    status: (tipId: number) => bindPath(contractPath("/tips/{tipId}/status"), { tipId }),
  },
  ownerFinance: {
    wallet: contractPath("/business-account/wallet"),
    ledger: contractPath("/business-account/ledger"),
    withdrawals: contractPath("/business-account/withdrawals"),
  },
  tuckShop: {
    products: contractPath("/v1/tuck-shop/products"),
    purchases: contractPath("/v1/tuck-shop/purchases"),
    paymentIntents: contractPath("/v1/tuck-shop/cart-payments/payment-intents"),
    paymentIntent: (paymentIntentId: string) =>
      bindPath(contractPath("/v1/tuck-shop/cart-payments/payment-intents/{paymentIntentId}"), {
        paymentIntentId,
      }),
  },
} as const;

export function createIdempotencyKey(scope: string) {
  const normalizedScope = scope.trim().replace(/[^a-zA-Z0-9_-]+/g, "-") || "operation";
  const randomValue = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${normalizedScope}:${randomValue}`;
}
