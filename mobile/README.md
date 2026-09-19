# King Sparkon — Mobile (Expo)

Native React + Expo app for the **User + Worker dashboards**. Mobile view builds for Android and iOS via EAS, plus Expo web export for CI parity with the Next.js web app.

## Scope (v1)

User workspace (mirrors `src/app/dashboard/user`):
- `/(tabs)/shop` — browse `GET /api/v1/tuck-shop/products`, add to cart
- `/(tabs)/cart` — `POST /api/v1/tuck-shop/purchases` with idempotency key
- `/(tabs)/tickets` — `GET /api/v1/tickets/events` + my tickets
- `/(tabs)/jobs` + `/job/[id]` — browse opportunities and apply (`/opportunities/jobs`)
- `/(tabs)/applications` — my job applications (`/opportunities/applications`)
- `/(tabs)/tips` — scan worker QR, set amount, submit to tip cart
- `/tip-cart` — tip intents paid through the shared PayFast cart payout (`POST /payments/payfast`, same as products/tickets)
- `/product/[id]` — product details

Worker workspace (mirrors `src/app/dashboard/worker`):
- `/(tabs)/scan` — `expo-camera` barcode scan → `GET /api/products/barcode/{barcode}` → `POST /api/v1/tuck-shop/workers/automatic-purchases`
- `/(tabs)/orders` — `GET /api/v1/tuck-shop/workers/online-purchases`, assign barcodes

Tabs are role-gated: pure buyers see Shop/Cart/Tickets/Tip/Profile; Worker/Owner/Admin also see Checkout/Orders (`isWorkerLike`).

## Auth — direct to backend

Unlike web (httpOnly cookie proxy at `/api/backend`), mobile talks **directly** to the Spring Boot backend:

```text
EXPO_PUBLIC_BACKEND_URL=http://localhost:8080
client baseURL = {BACKEND}/api
login  POST {BACKEND}/api/auth/login
refresh POST {BACKEND}/api/auth/refresh
```

Tokens are stored in `expo-secure-store` (`SecureStore` on native, in-memory fallback on web). Axios attaches `Authorization: Bearer` and retries once on 401.

Design tokens match web `src/styles/tokens.css`: `--ink #14161A`, `--paper #F1EFE6`, `--signal #FF4D2E`, `--confirm #1C7C54`.

## Local setup

```bash
cd mobile
npm install
cp .env.example .env
npx expo start
# press a (android), i (ios), w (web)
```

Validation:

```bash
npm run lint
npm run typecheck
npm run test
npm run build:web
```

## EAS builds (Android + iOS)

```bash
npm install -g eas-cli
eas login
eas init  # replaces placeholder projectId in app.json
eas build --platform android --profile preview
eas build --platform ios --profile preview
eas build --platform all --profile production
```

Before store submission add real `./assets/icon.png`, splash and adaptive icons and re-add them to `app.json`.

## CI

- `mobile-ci.yml` — install, lint, typecheck, test, Expo web export.
- `cross-platform-ci.yml` — unified web + mobile matrix (this is the required cross-platform pipeline).
- `mobile-eas.yml` — manual/tag EAS Android + iOS builds (`workflow_dispatch`, needs `EXPO_TOKEN` secret).
