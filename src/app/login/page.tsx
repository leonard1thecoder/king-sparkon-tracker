import type { Metadata } from "next";
import { AuthFrame } from "@/components/auth/AuthFrame";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your King Sparkon account.",
  alternates: { canonical: "/login" },
  robots: { index: false, follow: true },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error = "" } = await searchParams;

  return (
    <AuthFrame>
      <LoginForm oauthErrorCode={error || undefined} />
    </AuthFrame>
  );
}
