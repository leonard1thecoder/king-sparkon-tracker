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

function subscriberType(value: string) {
  const normalized = value.trim().toUpperCase().replaceAll(" ", "_").replaceAll("-", "_");
  if (normalized.includes("AFFILIATE")) return "AFFILIATE";
  if (normalized.includes("CLIENT")) return "CLIENT";
  return "KINGSPARKON_SUBSCRIBER";
}

function normalizePayload(payload: SubscriptionPayload) {
  const email = stringField(payload.email);
  const name = stringField(payload.name);
  const subscribeAs = stringField(payload.subscribeAs);
  const interest = stringField(payload.interest);

  return {
    contact: email,
    email,
    name,
    subscriberType: subscriberType(subscribeAs),
    preferredChannel: "EMAIL",
    affiliateRegistered: false,
    interest,
  };
}

async function forwardSubscription(baseUrl: string, path: string, body: string) {
  return fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    cache: "no-store",
  });
}

export async function POST(request: Request) {
  let rawPayload: SubscriptionPayload;

  try {
    rawPayload = (await request.json()) as SubscriptionPayload;
  } catch {
    return Response.json({ message: "Invalid JSON payload" }, { status: 400 });
  }

  const payload = normalizePayload(rawPayload);

  if (!payload.contact || !payload.contact.includes("@")) {
    return Response.json({ message: "A valid email address is required." }, { status: 400 });
  }

  const baseUrl = backendBaseUrl();
  const body = JSON.stringify(payload);

  try {
    let backendResponse = await forwardSubscription(baseUrl, "/api/subscribers", body);

    if (backendResponse.status === 404 || backendResponse.status === 405) {
      backendResponse = await forwardSubscription(baseUrl, "/api/v1/subscriptions", body);
    }

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
