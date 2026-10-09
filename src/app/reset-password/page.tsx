import type { Metadata } from "next";
import { AuthFrame } from "@/components/auth/AuthFrame";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Barcode Inventory Password",
  description:
    "Reset your King Sparkon password and restore secure access to barcode inventory, product tracking, claims, reports, and billing.",
  robots: { index: false, follow: true },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;

  return (
    <AuthFrame>
      <ResetPasswordForm token={token} />
    </AuthFrame>
  );
}
