# Phase 2 frontend production readiness

## Domain workspaces

Generic `ContractDataWorkspace` usage is replaced by `DomainDataWorkspace`.

Read screens now preserve backend truth and expose distinct states for loading, empty results, forbidden access, backend errors and retry. Search, status filters, page number and page size are sent to the backend; production responses are never replaced with mock financial, ticket, transaction or payout records.

Write-only placeholder routes for promotions, barcode allocation and barcode claims now render accessible forms that submit real backend operations. No action is implemented as a local-only button.

## OpenAPI contract

`scripts/generate-openapi-contract.mjs` uses `openapi-typescript` to generate:

- `src/lib/api/generated/openapi-schema.ts` with DTOs, request bodies, responses and operation types
- `src/lib/api/generated/openapi-paths.ts` with normalized frontend client paths

Commands:

```bash
OPENAPI_URL=http://localhost:8080/v3/api-docs bun run api:contract:generate
OPENAPI_URL=http://localhost:8080/v3/api-docs bun run api:contract:check
```

The OpenAPI CI workflow checks the committed contract against the configured backend document.

## Playwright

Playwright covers every role navigation destination for Admin, Owner, Worker, Affiliate and User. It also verifies unauthenticated redirects and cross-role rejection.

Mobile navigation is exercised at 320px, 375px and 768px, plus a 1440px desktop viewport. Tests use role-scoped test JWT cookies and intercept backend data requests; they do not bypass the Next.js role proxy.

## Required checks

- Bun dependency installation and lockfile consistency
- ESLint
- TypeScript typecheck
- Vitest
- Next.js production build
- OpenAPI contract drift
- Playwright role and mobile navigation suite
