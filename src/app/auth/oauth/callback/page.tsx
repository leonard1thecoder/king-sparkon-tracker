import type { Metadata } from "next";
import { OAuthCallback } from "@/components/auth/OAuthCallback";

export const metadata: Metadata = {
  title: "Completing sign in | King Sparkon",
  description: "Completing the secure provider sign-in for King Sparkon.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function OAuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string }>;
}) {
  const { code = "", error = "" } = await searchParams;

  return <OAuthCallback code={code || undefined} errorCode={error || undefined} />;
}
