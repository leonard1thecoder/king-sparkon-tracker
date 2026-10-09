import type { Metadata } from "next";
import { AuthFrame } from "@/components/auth/AuthFrame";
import { ResendVerificationForm } from "@/components/auth/ResendVerificationForm";

export const metadata: Metadata = {
  title: "Verify Barcode Inventory Account",
  description:
    "Request a new King Sparkon verification email for secure barcode inventory tracking and business-scoped product operations.",
  robots: { index: false, follow: true },
};

export default function ResendVerificationPage() {
  return (
    <AuthFrame>
      <ResendVerificationForm />
    </AuthFrame>
  );
}
