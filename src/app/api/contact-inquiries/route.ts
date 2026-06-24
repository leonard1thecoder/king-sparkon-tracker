import { backendBaseUrl } from "@/lib/backend-auth";

function responseBodyFromText(text: string) {
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ message: "Invalid JSON payload" }, { status: 400 });
  }

  const baseUrl = backendBaseUrl();

  try {
    const backendResponse = await fetch(`${baseUrl}/api/contact-inquiries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    const text = await backendResponse.text();

    return Response.json(responseBodyFromText(text), {
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
