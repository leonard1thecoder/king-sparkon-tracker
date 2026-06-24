import { postToBackendAuth } from "@/lib/backend-auth";

export async function POST(request: Request) {
  return postToBackendAuth(request, "/api/auth/register-affiliate");
}
