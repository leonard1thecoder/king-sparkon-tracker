import type { Metadata } from "next";
import { AuthFrame } from "@/components/auth/AuthFrame";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Recover Barcode Inventory Account",
  description:
    "Recover access to King Sparkon barcode inventory software for product stock, worker scans, reports, claims, and billing.",
  robots: { index: false, follow: true },
};

export default function ForgotPasswordPage() {
  return (
    <AuthFrame>
      <ForgotPasswordForm />
    </AuthFrame>
  );
}
