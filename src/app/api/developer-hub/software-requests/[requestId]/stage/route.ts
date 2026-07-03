import { AUTH_COOKIE_NAME, backendBaseUrl, responseBodyFromText } from "@/lib/backend-auth";
import { DEVELOPER_HUB_BACKEND_ENDPOINTS, SOFTWARE_DEVELOPMENT_STAGE_FLOW, statusForStage, type SoftwareDevelopmentStageUpdatePayload } from "@/lib/developer-hub";

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

function validatePayload(payload: Partial<SoftwareDevelopmentStageUpdatePayload>) {
  const stage = payload.stage;
  if (!stage || !SOFTWARE_DEVELOPMENT_STAGE_FLOW.includes(stage)) {
    return { error: "A valid Developer Hub stage is required." };
  }

  return {
    payload: {
      stage,
      status: payload.status ?? statusForStage(stage),
      adminNote: typeof payload.adminNote === "string" ? payload.adminNote.trim() : undefined,
    } satisfies SoftwareDevelopmentStageUpdatePayload,
  };
}

export async function PATCH(request: Request, { params }: { params: Promise<{ requestId: string }> }) {
  const { requestId } = await params;

  if (!requestId) {
    return Response.json({ message: "Software development request id is required." }, { status: 400 });
  }

  let rawPayload: Partial<SoftwareDevelopmentStageUpdatePayload>;

  try {
    rawPayload = (await request.json()) as Partial<SoftwareDevelopmentStageUpdatePayload>;
  } catch {
    return Response.json({ message: "Invalid JSON payload" }, { status: 400 });
  }

  const validation = validatePayload(rawPayload);
  if ("error" in validation) {
    return Response.json({ message: validation.error }, { status: 400 });
  }

  const baseUrl = backendBaseUrl();
  const endpoint = DEVELOPER_HUB_BACKEND_ENDPOINTS.adminStage(requestId);

  try {
    const backendResponse = await fetch(`${baseUrl}${endpoint}`, {
      method: "PATCH",
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
        message: `Backend API is unavailable at ${baseUrl}. Implement ${endpoint} for Admin Developer Hub stage updates.`,
      },
      { status: 502 },
    );
  }
}
