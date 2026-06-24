# King Sparkon Tracker

King Sparkon Tracker is a Bun-powered Next.js 16 frontend for the King Sparkon Tracker Spring Boot API. It covers secure account access, business-scoped product inventory, owner and worker dashboards, worker barcode registration, returnable claims, audit logs, reports, billing, and stock transactions.

This README states what the frontend currently has and how it maps to the newer `king-sparkon-tracker-backend` flow.

## What This Frontend Has

- Public Crypgo-inspired landing page for the King Sparkon Tracker product.
- Owner registration, login, forgot password, reset password, email verification, and resend-verification screens.
- Next.js route-handler auth proxy that stores the backend JWT in the `king_sparkon_tracker_access_token` httpOnly cookie.
- Authenticated `/api/backend/[...path]` proxy that attaches the Bearer token server-side for protected backend calls.
- Role-aware `/dashboard` redirect into owner or worker workspaces.
- Owner dashboard for business profile, inventory summary, alcohol/category reporting, product movement, product creation, stock quantity updates, transactions, workers, audit logs, returnable claims, and billing.
- Worker dashboard for product barcode registration, completed-product approval submission, barcode registry review, returnable claim lookup, and barcode-backed SELL movement entry.
- Product forms for category, price, stock quantity, returnable price, night-shift surcharge, night-shift start time, and night-shift end time.
- Barcode scanner flows using `@zxing/browser` for assigning item barcodes and for worker sale entry.
- Billing view that reads plan, current billing, and dashboard state from the backend, then opens Stripe Checkout through the backend.
- King Sparkon branding from `docs/logo 2.png`, served in the app as `public/king-sparkon-logo.png`.
- Contact inquiry route that proxies landing-page contact requests to the backend.

## Routes

- `/` - public landing page
- `/login` - login
- `/register` - owner account and business tenant registration
- `/forgot-password` - password recovery
- `/reset-password` - password reset
- `/verify-email` - email verification result
- `/resend-verification` - resend verification email
- `/dashboard` - saved-session role redirect
- `/dashboard/owner` - owner dashboard
- `/dashboard/worker` - worker dashboard
- `/api/auth/login` - login proxy route
- `/api/auth/register` - registration proxy route
- `/api/auth/forgot-password` - password recovery proxy route
- `/api/auth/reset-password` - password reset proxy route
- `/api/auth/verify-email` - email verification proxy route
- `/api/auth/resend-verification` - verification resend proxy route
- `/api/auth/logout` - clears the httpOnly session cookie
- `/api/backend/[...path]` - authenticated backend proxy route
- `/api/contact-inquiries` - contact inquiry proxy route

## Environment

Create `.env.local` from `.env.example`:

```bash
BACKEND_URL=http://localhost:8080
NEXT_PUBLIC_KING_SPARKON_OWNER_ID=1
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_replace_with_your_publishable_key
```

`NEXT_PUBLIC_KING_SPARKON_OWNER_ID` is still used by the worker sale form because the current transaction payload includes `ownerId`. Most other dashboard data is scoped by the authenticated user's business.

## Backend Flow Checked

The current backend flow works like this:

- An owner registers with `username`, `emailAddress`, `password`, `businessName`, and `localizationCountry`.
- Registration creates the owner, creates the business tenant, links the owner to the business, and assigns the `Owner` role.
- New businesses begin on a 14 day `FREE_TRIAL`; Plus and Pro billing is handled by backend billing endpoints.
- Owners create products with stock quantity but no physical barcode values.
- Workers assign one physical item barcode per stocked unit using `POST /api/products/{id}/barcodes`.
- Returnable barcode references are email based. The backend response field is `referenceEmail`; the backend still accepts the legacy request alias `referencee`.
- Workers submit a product for approval once assigned barcode count equals stock quantity.
- `BUY` transactions increase stock and must not send item barcodes.
- `SELL` transactions require item barcodes, and the number of scanned barcodes must match quantity.
- The newer checkout flow supports one transaction with multiple line items and one transaction-level payment type: `CASH`, `SWIPE_MACHINE`, or `WEBSITE_PAYMENT`.
- `WEBSITE_PAYMENT` requires `paymentEmail`, creates a Stripe payment link for the full transaction total, and returns payment fields such as `paymentStatus`, `paymentReference`, and `paymentUrl`.
- Cash and swipe-machine sales are offline payment records and must not create Stripe payment links.
- Backend billing now exposes Stripe checkout session creation at `/api/billing/stripe/checkout-sessions`.
- The backend also exposes tips, PayPal payout onboarding, transaction withdrawals, affiliate onboarding, affiliate tips, affiliate commissions, and webhook callbacks. This frontend does not yet have dedicated UI screens for those newer backend areas.

## Current API Coverage

Authentication through local Next.js routes:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/verify-email?token=...`
- `POST /api/auth/resend-verification`

Dashboard backend calls through `/api/backend/...`:

- `GET /api/users/me`
- `GET /api/reports/inventory-summary`
- `GET /api/reports/alcohol`
- `GET /api/reports/product-movement`
- `GET /api/products`
- `GET /api/products/{id}`
- `GET /api/products/barcode/{barcode}`
- `POST /api/products`
- `PATCH /api/products/{id}/quantity`
- `POST /api/products/{id}/barcodes`
- `POST /api/products/{id}/submit-approval`
- `GET /api/barcodes/reference/{reference}`
- `POST /api/barcodes/reference/{reference}/claim`
- `POST /api/barcodes/{id}/claim`
- `GET /api/transactions`
- `POST /api/transactions`
- `GET /api/users`
- `POST /api/users/workers`
- `DELETE /api/users/workers/{id}`
- `GET /api/audit-logs`
- `GET /api/billing/plans`
- `GET /api/billing/me`
- `GET /api/billing/dashboard`
- `POST /api/billing/stripe/checkout-sessions`
- `POST /api/billing/subscriptions/{subscriptionId}/activate`

Public contact inquiry:

- `POST /api/contact-inquiries`

## Known Backend Alignment Gaps

- The current transaction form submits one product line per transaction. The backend now supports multi-product checkout in a single transaction.
- The current transaction form does not send `paymentType`, `paymentEmail`, or transaction payment display fields. The newer backend requires `paymentType` for `SELL` and supports Stripe payment links for `WEBSITE_PAYMENT`.
- The barcode assignment and claim UI still uses the legacy `referencee` naming in frontend types and form state. The backend now exposes `referenceEmail` and only keeps `referencee` as a compatibility alias.
- The frontend has no dedicated screens yet for customer tips, worker PayPal payout onboarding, transaction withdrawals, affiliate onboarding, affiliate commissions, or affiliate withdrawals.
- The worker sale form still needs `NEXT_PUBLIC_KING_SPARKON_OWNER_ID` until the UI no longer has to supply `ownerId` manually.

## Getting Started

Install dependencies:

```bash
bun install
```

Start the development server:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Local Commands

```bash
bun run lint
bun run build
```
