import { backendBaseUrl, responseBodyFromText } from "@/lib/backend-auth";

type SubscriptionPayload = {
  email?: unknown;
  name?: unknown;
};

function normalizePayload(payload: SubscriptionPayload) {
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const name = typeof payload.name === "string" ? payload.name.trim() : "";

  return {
    email,
    name,
  };
}

export async function POST(request: Request) {
  let rawPayload: SubscriptionPayload;

  try {
    rawPayload = (await request.json()) as SubscriptionPayload;
  } catch {
    return Response.json({ message: "Invalid JSON payload" }, { status: 400 });
  }

  const payload = normalizePayload(rawPayload);

  if (!payload.email || !payload.email.includes("@")) {
    return Response.json({ message: "A valid email address is required." }, { status: 400 });
  }

  const baseUrl = backendBaseUrl();

  try {
    const backendResponse = await fetch(`${baseUrl}/api/v1/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    return Response.json(responseBodyFromText(await backendResponse.text()), {
      status: backendResponse.status,
    });
  } catch {
    return Response.json(
      {
        message: `Backend API is unavailable at ${baseUrl}. Start the Spring Boot backend or set BACKEND_URL.`,
      },
      { status: 502 },
    );
  }
}
