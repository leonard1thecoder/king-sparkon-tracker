# King Sparkon Dev Hub backend contract

The frontend now exposes Developer Hub dashboards for business owners and admins:

- Owner page: `/dashboard/owner/developer`
- Admin page: `/dashboard/admin/developer`
- Owner API proxy: `/api/developer-hub/software-requests`
- Admin stage API proxy: `/api/developer-hub/software-requests/{requestId}/stage`

## Owner flow

A business owner requests software development from the Owner Developer Hub page.

Frontend sends:

```json
{
  "softwareName": "Worker QR tip payout portal",
  "softwareDescription": "Explain how users, dashboards, payments, reports, QR/barcode flows, admin controls, integrations, and support should work.",
  "requiresCloudMaintenance": true,
  "requiresQualityAssuranceRegression": true
}
```

Backend endpoint:

```http
POST /api/v1/developer-hub/software-requests
```

Backend must derive `ownerId`, `businessId`, owner email, and business name from the authenticated JWT/session. Do not trust owner or business identifiers from the request body.

Owner list endpoint:

```http
GET /api/v1/developer-hub/software-requests
```

Returns only the authenticated owner's business requests.

## Admin flow

Admin views all software development requests:

```http
GET /api/v1/admin/developer-hub/software-requests
```

Admin starts or advances delivery:

```http
PATCH /api/v1/admin/developer-hub/software-requests/{requestId}/stage
```

Payload:

```json
{
  "stage": "DISCOVERY",
  "status": "IN_PROGRESS",
  "adminNote": "Moved to Discovery from Admin Developer Hub."
}
```

Only `ADMIN` can use admin endpoints.

## Suggested entity fields

```java
Long id;
Long ownerId;
Long businessId;
String businessName;
String ownerName;
String ownerEmail;
String softwareName;
String softwareDescription;
boolean requiresCloudMaintenance;
boolean requiresQualityAssuranceRegression;
SoftwareDevelopmentStage stage;
SoftwareDevelopmentStatus status;
String adminNote;
LocalDateTime requestedAt;
LocalDateTime updatedAt;
LocalDateTime startedAt;
LocalDateTime quoteSentAt;
```

## Stages

```text
REQUESTED
DISCOVERY
QUOTE_SENT
APPROVED
DESIGN
DEVELOPMENT
CI_CD
QA_REGRESSION
CLOUD_MAINTENANCE
UAT
LIVE_SUPPORT
```

## Statuses

```text
REQUESTED
IN_PROGRESS
QUOTE_SENT
APPROVED
ON_HOLD
COMPLETED
```

## Response shape

The frontend accepts any of these list response shapes:

```json
[
  { "id": 1, "softwareName": "..." }
]
```

```json
{
  "content": [{ "id": 1, "softwareName": "..." }]
}
```

```json
{
  "requests": [{ "id": 1, "softwareName": "..." }]
}
```

For create and stage update, the frontend accepts either the object directly or wrapped as `request` / `data`.
