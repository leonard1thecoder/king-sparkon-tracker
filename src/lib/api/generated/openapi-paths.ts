/* eslint-disable */
// Generated from the backend OpenAPI document. Run `bun run api:contract:generate`.

export const openApiClientPathTemplates = [
  "/business-account/ledger",
  "/business-account/wallet",
  "/business-account/withdrawals",
  "/tips",
  "/tips/{tipId}/status",
  "/tips/owner",
  "/tips/withdrawals",
  "/v1/tuck-shop/cart-payments/payment-intents",
  "/v1/tuck-shop/cart-payments/payment-intents/{paymentIntentId}",
  "/v1/tuck-shop/products",
  "/v1/tuck-shop/purchases",
] as const;

export type OpenApiClientPathTemplate = (typeof openApiClientPathTemplates)[number];
