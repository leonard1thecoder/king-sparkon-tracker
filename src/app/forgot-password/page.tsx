import type { Metadata } from "next";
import { AuthShell } from "../auth-shell";

export const metadata: Metadata = {
  title: "Recover Barcode Inventory Account",
  description:
    "Recover access to King Sparkon Tracker barcode inventory software for product stock, worker scans, reports, claims, and billing.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      mode="forgot"
      endpoint="/api/auth/forgot-password"
      eyebrow="Password recovery"
      title="Reset access safely"
      description="Enter the email tied to your barcode inventory account and prepare a secure reset step for your business workspace."
      submitLabel="Send reset link"
      footerText="Remembered your password?"
      footerHref="/login"
      footerLink="Back to sign in"
      visualTitle="Recover access without losing operational focus."
      visualText="The reset flow keeps barcode inventory teams moving while protecting product, worker, transaction, report, and billing access."
      fields={[
        {
          name: "emailAddress",
          label: "Email address",
          type: "email",
          placeholder: "you@example.com",
          autoComplete: "email",
          icon: "email",
        },
      ]}
    />
  );
}
