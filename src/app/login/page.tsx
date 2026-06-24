import type { Metadata } from "next";
import { AuthShell } from "../auth-shell";

export const metadata: Metadata = {
  title: "Login to Barcode Inventory Software",
  description:
    "Sign in to King Sparkon Tracker to manage barcode inventory, product stock, worker scans, returnable claims, reports, audit logs, transactions, and billing.",
};

export default function LoginPage() {
  return (
    <AuthShell
      mode="login"
      endpoint="/api/auth/login"
      eyebrow="Welcome back"
      title="Sign in to your workspace"
      description="Access barcode inventory tracking, product stock movement, worker scanning, returnable claims, reports, audit logs, transactions, and billing."
      submitLabel="Sign in"
      footerText="New to King Sparkon Tracker?"
      footerHref="/register"
      footerLink="Create an account"
      visualTitle="Secure access for barcode inventory teams."
      visualText="Owners and workers enter one business-scoped workspace for product stock, barcode scanning, claims, reports, and billing."
      fields={[
        {
          name: "username",
          label: "Username",
          type: "text",
          placeholder: "owner",
          autoComplete: "username",
          icon: "user",
        },
        {
          name: "password",
          label: "Password",
          type: "password",
          placeholder: "Enter your password",
          autoComplete: "current-password",
          icon: "lock",
        },
      ]}
    />
  );
}
