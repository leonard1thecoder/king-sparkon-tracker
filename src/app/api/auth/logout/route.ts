import { clearAuthCookie } from "@/lib/backend-auth";
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Signed out." });
  clearAuthCookie(response);
  return response;
}
