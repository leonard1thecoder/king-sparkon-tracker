import type { Metadata } from "next";
import { AuthShell } from "../auth-shell";

export const metadata: Metadata = {
  title: "Login | Barcode Inventory Dashboard Access",
  description:
    "Login to King Sparkon Tracker for barcode inventory scanning, QR verification, product stock movement, worker tips, job opportunities, affiliate reports, payments, promotions, and audit-ready dashboards.",
  keywords: [
    "King Sparkon Tracker login",
    "barcode inventory login",
    "QR scanner dashboard login",
    "inventory tracking account",
    "business barcode software access",
    "job opportunities login",
  ],
  alternates: {
    canonical: "/login",
  },
  openGraph: {
    title: "Login to King Sparkon Tracker",
    description: "Secure access for users, owners, workers, affiliates, and admins using King Sparkon Tracker barcode operations software.",
    type: "website",
    siteName: "King Sparkon Tracker",
    images: [{ url: "/king-sparkon-logo.png", width: 512, height: 512, alt: "King Sparkon Tracker login page" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "King Sparkon Tracker Login",
    description: "Access barcode scanning, job opportunities, product tracking, tips, payouts, affiliates, and dashboard reporting.",
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
      description="Use your user, owner, worker, affiliate, or admin account. After login, King Sparkon Tracker opens the dashboard that matches your backend role."
      submitLabel="Sign in securely"
      footerText="New to King Sparkon Tracker?"
      footerHref="/register"
      footerLink="Create a business account"
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
