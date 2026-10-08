# King Sparkon Frontend

King Sparkon is a Bun-powered Next.js 16 frontend for a barcode and QR operations platform. It supports product verification, stock movement, worker scan flows, website payments, worker tips, withdrawals, affiliate referrals, promotions, billing, reports, and audit trails.

This frontend is aligned to the Spring Boot backend in `leonard1thecoder/king-sparkon-tracker-backend`.

## Product purpose

This is not a crypto product. The interface is designed around precision instrumentation: barcode scanners, QR codes, label printers, stock rooms, verification stamps, scan terminals, industrial ledgers, payout records, and audit trails.

## Architecture

```text
src/
  app/
    api/auth                local auth proxy and httpOnly cookie session routes
    api/backend/[...path]   authenticated backend proxy
    api/contact-inquiries   public contact proxy
    api/subscribers         public subscriber proxy
    dashboard/admin         admin workspace
    dashboard/owner         owner workspace
    dashboard/worker        worker workspace
    dashboard/affiliate     affiliate workspace
  components/
    hero                    scan animation
    layout                  dashboard frame/header/page template
    nav                     role-specific nav components
    scanner                 ZXing scanner components
    ui                      shared UI primitives
  lib/
    api                     centralized Axios domain modules
    auth                    session, role, and guard helpers
    types                   backend-aligned TypeScript contracts
    utils                   money, dates, errors, rate-limit, cn helpers
  styles/tokens.css         design tokens
```

## Tech stack

- Next.js 16
- React 19
- TypeScript
- Bun only
- Axios for the frontend API layer
- `@zxing/browser` for camera barcode and QR scan flows
- Tailwind CSS 4
- Inter for body UI
- JetBrains Mono for display headings, IDs, codes, money, and status tags

## Design rule

The product has two visual systems. Each one is scoped so the other is never affected.

### 1. Public site (white-led, playful, motion-driven)

Applies to `/`, `/events`, `/events/[slug]`, `/mall`, `/mall/products/[slug]`, `/jobs`, and `/jobs/unemployment-insurance-fund`. Tokens live in `src/app/public-site.css` and are only active inside the `.ks-public` wrapper.

```css
.ks-public {
  --ks-white: #FFFFFF;
  --ks-light-green: #BFE8C7;
  --ks-green: #76C893;
  --ks-yellow: #F8E16C;
  --ks-gold: #E6B84A;
  --ks-sky: #A9DDF5;
  --ks-ink: #17231D;
  --ks-muted: #647168;
}
```

- The canvas is predominantly white. Accents are punctuation: roughly 10–15% light green, 5–8% sky blue, 3–5% yellow, and 1–3% gold for selected states and micro-details.
- Every animated section must explain what it represents. Decorative motion is not allowed.
- Motion uses SVG and CSS transforms. Three.js and Blender assets are deferred and must be lazy-loaded when added.
- Everything respects `prefers-reduced-motion`. Content stays visible and readable with motion off.
- Global dark rules: `globals.css` force-darkens any element with a Tailwind `bg-white` (or `bg-slate-50`, `bg-gray-50`, and similar) class with `!important`, and paints every `<section>` black. Public markup must use the `ks-surface` class instead of `bg-white`. Public scope resets live at the top of `src/app/public-site.css`. Do not remove them.
- Never invent data. Testimonials, counts, logos, ratings, and revenue render only when verified backend data exists. Otherwise the page shows a designed empty state.

### 2. Authenticated application (instrument palette)

Applies to `/dashboard/*`, login, register, and account flows. These keep the palette below:

```css
:root {
  --ink: #14161A;
  --paper: #F1EFE6;
  --signal: #FF4D2E;
  --confirm: #1C7C54;
  --steel: #5B6470;
  --line: #D8D3C4;
}
```

Use `--signal` only for scan and action accents, and `--confirm` for verified, paid, approved, and success states.

### Still banned everywhere

No purple SaaS gradients, generic crypto grids, stock 3D icons, fake glass panels, or fake data where backend data exists.

## Environment

Create `.env.local` from `.env.example`:

```bash
BACKEND_URL=http://localhost:8080
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`BACKEND_URL` is used only by Next.js route handlers. Browser-side code calls local Next routes such as `/api/backend/...` and never needs backend secrets.

## Local setup

```bash
bun install
bun run dev
```

Validation commands:

```bash
bun run lint
bun run typecheck
bun run test
bun run build
```

## Auth and session flow

- Public auth screens call local `/api/auth/...` routes.
- Login stores backend access and refresh tokens in httpOnly cookies.
- Browser API modules call `/api/backend/...`.
- The backend proxy attaches the Bearer token server-side.
- Axios normalizes backend error payloads from `message`, `error`, `detail`, and `title`.
- `401` attempts refresh once through `/api/auth/refresh`.
- Failed refresh clears session and redirects to `/login`.
- `429` surfaces retry/cooldown data from `retryAfterSeconds` or `Retry-After`.
- `403 EMAIL_NOT_VERIFIED` is treated as a verification-required UI state by consumers.

## Role dashboards

- `/dashboard/admin` - users, businesses, platform promotions, scan logs, settings.
- `/dashboard/owner` - products, workers, transactions, tips, withdrawals, promotions, reports, audit, billing, settings.
- `/dashboard/worker` - scan terminal, barcodes, transactions, tips, claims, profile.
- `/dashboard/affiliate` - onboarding, referrals, commissions, tips, payouts, marketing assets, performance.

Each role has its own layout and nav component: `AdminNav`, `OwnerNav`, `WorkerNav`, and `AffiliateNav`. The old monolithic dashboard shell has been reduced to a small compatibility entry.

## Backend endpoints wired in API modules

- Auth: `POST /api/auth/register`, `POST /api/auth/register-affiliate`, `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`, forgot/reset/resend/verify routes.
- Public: `POST /api/subscribers`, `DELETE /api/subscribers?contact=...`, `POST /api/contact-inquiries`.
- Products/barcodes: `GET/POST /api/products`, `GET /api/products/{id}`, `GET /api/products/barcode/{barcode}`, `PATCH /api/products/{id}/quantity`, `POST /api/products/{id}/barcodes`, `POST /api/products/{id}/submit-approval`.
- Transactions: `GET/POST /api/transactions`, `POST /api/transactions/withdrawals`.
- Tips: `GET/POST /api/tips`, `PATCH /api/tips/{id}/paid`, `POST /api/tips/withdrawals`.
- Promotions: `GET /api/promotions/quote`, `GET/POST /api/promotions`, `POST /api/admin/promotions/registered-subscribers`.
- Billing: `GET /api/billing/plans`, `GET /api/billing/me`, `GET /api/billing/dashboard`, `POST /api/billing/subscriptions/{subscriptionId}/activate`.
- Payments (PayFast redirect + ITN): `POST /api/payments/payfast` (cart), `POST /api/payments/payfast/itn` (PayFast server notification), `GET /api/payments/status/{merchantPaymentId}`, `GET /api/payments/payfast/form/{merchantPaymentId}` (public form for emailed/QR payments).
- Reports/audit: `GET /api/reports/inventory-summary`, `GET /api/reports/alcohol`, `GET /api/reports/product-movement`, `GET /api/audit-logs`.
- Affiliate: `GET /api/affiliate/referrals`, `GET /api/affiliate/commissions`, `GET /api/affiliate/payouts`, `POST /api/affiliate/onboarding`.

## Transaction rules

The transaction API module supports multi-line checkout:

- `SELL` sends item barcodes and requires barcode count to match total quantity.
- `BUY` does not send item barcodes.
- `paymentType` supports `CASH`, `SWIPE_MACHINE`, and `WEBSITE_PAYMENT`.
- Website payments expose `paymentUrl`, `paymentStatus`, `paymentReference`, `paymentEmail`, and `paymentContact` when backend returns them.
- Cash and swipe-machine flows must not subscribe customers.
- Website payment contact can become a backend `CLIENT` subscriber.

## Feature locks

Backend remains the source of truth. UI may show these locked states:

- `FREE_TRIAL`: max 2 workers.
- `PLUS`: max 5 workers.
- `PRO`: unlimited workers.
- `WORKER_TIPS_PLATFORM`, `BUSINESS_ANALYSIS_AI`, and `WORKER_CLOCKER` are Pro features.

## CI## CI


`.github/workflows/frontend-ci.yml` runs on pull requests and push to `main`:

```bash
bun install --frozen-lockfile
bun run lint
bun run typecheck
bun run test
bun run build
```

## Vercel deployment

`.github/workflows/vercel-deploy.yml` deploys previews on pull requests and production on push to `main` after install, lint, typecheck, test, and build.

Required GitHub secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Required Vercel env vars:

```bash
BACKEND_URL=https://your-production-backend-url.com
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
```

## Known backend assumptions and TODOs

- Confirm exact admin registration route availability. The backend contract documents `POST /api/auth/register-admin`, but the frontend branch currently has owner and affiliate public registration proxies.
- Confirm exact affiliate payout and platform scan-log controller paths; API modules are wired from backend README naming and may need small endpoint-name adjustments if controllers differ.
- Refresh-token storage assumes backend login/refresh returns `refreshToken` and expiry fields.
- `referenceEmail` is the frontend name. Legacy `referencee` should only remain as backend compatibility.
- Regenerate `bun.lock` after dependency updates before relying on `bun install --frozen-lockfile` in CI.
