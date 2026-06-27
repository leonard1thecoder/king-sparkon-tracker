import type { Metadata } from "next";
import { AuthShell } from "../auth-shell";

export const metadata: Metadata = {
  title: "Login | Barcode Inventory Dashboard Access",
  description:
    "Login to King Sparkon Tracker for barcode inventory scanning, QR verification, product stock movement, worker tips, affiliate reports, payments, promotions, and audit-ready dashboards.",
  keywords: [
    "King Sparkon Tracker login",
    "barcode inventory login",
    "QR scanner dashboard login",
    "inventory tracking account",
    "business barcode software access",
  ],
  alternates: {
    canonical: "/login",
  },
  openGraph: {
    title: "Login to King Sparkon Tracker",
    description: "Secure access for owners, workers, affiliates, and admins using King Sparkon Tracker barcode operations software.",
    type: "website",
    siteName: "King Sparkon Tracker",
    images: [{ url: "/king-sparkon-logo.png", width: 512, height: 512, alt: "King Sparkon Tracker login page" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "King Sparkon Tracker Login",
    description: "Access barcode scanning, product tracking, tips, payouts, affiliates, and dashboard reporting.",
    images: ["/king-sparkon-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function LoginPage() {
  return (
    <AuthShell
      mode="login"
      endpoint="/api/auth/login"
      eyebrow="Welcome back"
      title="Login to your scan terminal"
      description="Access barcode inventory tracking, product stock movement, worker scanning, returnable claims, reports, audit logs, transactions, billing, tips, and affiliate visibility."
      submitLabel="Sign in securely"
      footerText="New to King Sparkon Tracker?"
      footerHref="/register"
      footerLink="Create a business account"
      visualTitle="Secure access for barcode inventory teams."
      visualText="Owners, workers, affiliates, and admins enter one business-scoped workspace for product stock, barcode scanning, claims, reports, payouts, and billing."
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
