# Phase 1 production-readiness changes

## Findings

| Severity | Domain | Finding | Phase 1 fix |
| --- | --- | --- | --- |
| Critical | Authenticated commerce | Product and purchase APIs silently replaced backend failures and legitimate empty responses with mock records. | Production now renders real empty/error states. Mock fallback requires non-production mode and `NEXT_PUBLIC_ENABLE_DEVELOPMENT_MOCKS=true`. |
| High | API contract | Endpoint strings were distributed across feature files and could drift from backend controllers. | Add a checked-in typed OpenAPI path contract plus a dependency-free generator from `/v3/api-docs`. |
| High | Payments | High-risk POST requests did not consistently attach an idempotency key. | Add a shared idempotent POST helper and use it for tips, withdrawals, Tuck Shop checkout and embedded cart payment intents. |
| High | Navigation | Role routes existed, but route ownership and mutually exclusive active states had no automated contract test. | Export the navigation contract and test role boundaries, duplicate destinations and active-state exclusivity. |
| Medium | Pagination | Tip query parameters accepted page and size but did not send them. | Forward page and size to the server-side endpoint. |

## API contract workflow

Generate from a running backend:

```bash
OPENAPI_URL=http://localhost:8080/v3/api-docs bun run api:contract:generate
```

Generate from a checked-in or downloaded document:

```bash
OPENAPI_FILE=./openapi.json bun run api:contract:generate
```

Check for drift:

```bash
OPENAPI_URL=http://localhost:8080/v3/api-docs bun run api:contract:check
```

The generator removes the backend `/api` prefix because browser requests use the existing Next.js `/api/backend` proxy.

## Backward compatibility

- Existing pages and URLs are preserved.
- Existing API functions keep their original required arguments; idempotency keys are optional additions.
- Dashboard `noindex` metadata and the yellow design system are unchanged.
- Development-only mock data remains available only when explicitly enabled.

## Remaining phases

1. Generate the full DTO schema and operation types from OpenAPI, then remove duplicate hand-maintained response types.
2. Add Playwright role-by-role page traversal and mobile navigation tests at 320px, 375px, 768px and desktop.
3. Replace remaining generic data workspaces with domain-specific loading, empty, forbidden, error, retry and paginated states.
4. Add stable operation-scoped idempotency keys in UI forms so double-clicks and browser retries reuse the same key.
