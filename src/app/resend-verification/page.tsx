import type { Metadata } from "next";
import { AuthShell } from "../auth-shell";

export const metadata: Metadata = {
  title: "Verify Barcode Inventory Account",
  description:
    "Request a new King Sparkon Tracker verification email for secure barcode inventory tracking and business-scoped product operations.",
};

export default function ResendVerificationPage() {
  return (
    <AuthShell
      mode="resend"
      endpoint="/api/auth/resend-verification"
      eyebrow="Email verification"
      title="Send a new verification link"
      description="Use the same email address you registered with and request a fresh verification email for your barcode inventory workspace."
      submitLabel="Send verification"
      footerText="Already verified?"
      footerHref="/login"
      footerLink="Back to sign in"
      visualTitle="Verified access for barcode operations."
      visualText="Owners can register with normal email addresses and complete verification before managing products, workers, reports, claims, and billing."
      fields={[
        {
          name: "emailAddress",
          label: "Email address",
          type: "email",
          placeholder: "owner@outlook.com",
          autoComplete: "email",
          icon: "email",
        },
      ]}
    />
  );
}
