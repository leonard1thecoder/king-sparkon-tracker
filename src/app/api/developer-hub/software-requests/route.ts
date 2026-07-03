import { AUTH_COOKIE_NAME, backendBaseUrl, responseBodyFromText } from "@/lib/backend-auth";
import { DEVELOPER_HUB_BACKEND_ENDPOINTS, type DeveloperHubScope, type SoftwareDevelopmentRequestPayload } from "@/lib/developer-hub";

function tokenFromCookieHeader(cookieHeader: string | null) {
  if (!cookieHeader) return null;
  const tokenPair = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${AUTH_COOKIE_NAME}=`));

  return tokenPair ? decodeURIComponent(tokenPair.slice(AUTH_COOKIE_NAME.length + 1)) : null;
}

function backendHeaders(request: Request) {
  const cookie = request.headers.get("cookie");
  const token = tokenFromCookieHeader(cookie);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (cookie) {
    headers.Cookie = cookie;
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function normalizeScope(value: string | null): DeveloperHubScope {
  return value === "admin" ? "admin" : "owner";
}

function validatePayload(payload: Partial<SoftwareDevelopmentRequestPayload>) {
  const softwareName = typeof payload.softwareName === "string" ? payload.softwareName.trim() : "";
  const softwareDescription = typeof payload.softwareDescription === "string" ? payload.softwareDescription.trim() : "";

  if (softwareName.length < 3) {
    return { error: "Software name must be at least 3 characters." };
  }

  if (softwareDescription.length < 30) {
    return { error: "Software description must explain how it will work with at least 30 characters." };
  }

  return {
    payload: {
      softwareName,
      softwareDescription,
      requiresCloudMaintenance: Boolean(payload.requiresCloudMaintenance),
      requiresQualityAssuranceRegression: Boolean(payload.requiresQualityAssuranceRegression),
    } satisfies SoftwareDevelopmentRequestPayload,
  };
}

export async function GET(request: Request) {
  const baseUrl = backendBaseUrl();
  const url = new URL(request.url);
  const scope = normalizeScope(url.searchParams.get("scope"));
  const endpoint = scope === "admin" ? DEVELOPER_HUB_BACKEND_ENDPOINTS.adminList : DEVELOPER_HUB_BACKEND_ENDPOINTS.ownerList;

  try {
    const backendResponse = await fetch(`${baseUrl}${endpoint}`, {
      method: "GET",
      headers: backendHeaders(request),
      cache: "no-store",
    });

    return Response.json(responseBodyFromText(await backendResponse.text()), {
      status: backendResponse.status,
    });
  } catch {
    return Response.json(
      {
        message: `Backend API is unavailable at ${baseUrl}. Implement ${endpoint} for Developer Hub software requests.`,
      },
      { status: 502 },
    );
  }
}

export async function POST(request: Request) {
  let rawPayload: Partial<SoftwareDevelopmentRequestPayload>;

  try {
    rawPayload = (await request.json()) as Partial<SoftwareDevelopmentRequestPayload>;
  } catch {
    return Response.json({ message: "Invalid JSON payload" }, { status: 400 });
  }

  const validation = validatePayload(rawPayload);
  if ("error" in validation) {
    return Response.json({ message: validation.error }, { status: 400 });
  }

  const baseUrl = backendBaseUrl();

  try {
    const backendResponse = await fetch(`${baseUrl}${DEVELOPER_HUB_BACKEND_ENDPOINTS.ownerCreate}`, {
      method: "POST",
      headers: backendHeaders(request),
      body: JSON.stringify(validation.payload),
      cache: "no-store",
    });

    return Response.json(responseBodyFromText(await backendResponse.text()), {
      status: backendResponse.status,
    });
  } catch {
    return Response.json(
      {
        message: `Backend API is unavailable at ${baseUrl}. Implement ${DEVELOPER_HUB_BACKEND_ENDPOINTS.ownerCreate} for Owner software development requests.`,
      },
      { status: 502 },
    );
  }
}
