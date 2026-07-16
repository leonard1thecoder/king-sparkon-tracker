import type { Metadata } from "next";
import { AuthShell } from "../auth-shell";

export const metadata: Metadata = {
  title: "Login | Business, User and Affiliate Dashboard Access",
  description:
    "Login to King Sparkon Tracker for secure Business Owner, User, Worker, Affiliate, or Admin access to barcode inventory, QR tickets, jobs, tips, payments, promotions, and reports.",
  keywords: [
    "King Sparkon Tracker login",
    "barcode inventory login",
    "QR scanner dashboard login",
    "inventory tracking account",
    "business barcode software access",
    "job opportunities login",
    "business owner dashboard login",
    "affiliate dashboard login",
  ],
  alternates: {
    canonical: "/login",
  },
  openGraph: {
    title: "Login to King Sparkon Tracker",
    description:
      "Secure access for Business Owners, Users, Workers, Affiliates, and Admins using King Sparkon Tracker commerce software.",
    type: "website",
    siteName: "King Sparkon Tracker",
    images: [{ url: "/king-sparkon-logo.png", width: 512, height: 512, alt: "King Sparkon Tracker login page" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "King Sparkon Tracker Login",
    description:
      "Access barcode scanning, job opportunities, product tracking, tips, payouts, affiliates, and dashboard reporting.",
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
      title="Sign in to your King Sparkon workspace"
      description="Use your Business Owner, User, Worker, Affiliate, or Admin account. After login, King Sparkon Tracker opens the dashboard that matches your role."
      submitLabel="Sign in securely"
      footerText="New to King Sparkon Tracker?"
      footerHref="/register"
      footerLink="Register account"
      visualTitle="Secure access for barcode inventory teams."
      visualText="One clean entry point for tickets, job opportunities, product stock, barcode scanning, returnable claims, reports, payouts, promotions, affiliate visibility, and billing."
      fields={[
        {
          name: "username",
          label: "Username",
          type: "text",
          placeholder: "Example: owner_admin",
          autoComplete: "username",
          icon: "user",
          helper: "Required. This is the account username created for the workspace.",
        },
        {
          name: "password",
          label: "Password",
          type: "password",
          placeholder: "Account password",
          autoComplete: "current-password",
          icon: "lock",
          helper: "Required. Use the account password for this workspace.",
        },
      ]}
    />
  );
}
