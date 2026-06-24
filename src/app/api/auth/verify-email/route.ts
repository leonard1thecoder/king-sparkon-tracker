import { getFromBackendAuth } from "@/lib/backend-auth";

export async function GET(request: Request) {
  return getFromBackendAuth(request, "/api/auth/verify-email");
}
