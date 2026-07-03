import { backendBaseUrl, responseBodyFromText } from "@/lib/backend-auth";

type SubscriptionPayload = {
  email?: unknown;
  name?: unknown;
  subscribeAs?: unknown;
  interest?: unknown;
};

function stringField(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizePayload(payload: SubscriptionPayload) {
  const email = stringField(payload.email);
  const name = stringField(payload.name);
  const subscribeAs = stringField(payload.subscribeAs);
  const interest = stringField(payload.interest);

  return {
    email,
    name,
    subscribeAs,
    interest,
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
