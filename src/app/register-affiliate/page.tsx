import type { Metadata } from "next";
import { AuthPage } from "@/components/auth/AuthPage";

export const metadata: Metadata = {
  title: "Register Affiliate | King Sparkon Tracker Referral Program",
  description:
    "Join the King Sparkon Tracker affiliate program to promote barcode inventory software with profile-based social links, QR-ready referrals, commission visibility, and payout tracking.",
  keywords: [
    "King Sparkon Tracker affiliate registration",
    "barcode software affiliate program",
    "inventory software referral program",
    "QR referral links",
    "business software affiliate South Africa",
  ],
  alternates: {
    canonical: "/register-affiliate",
  },
  openGraph: {
    title: "Join the King Sparkon Tracker Affiliate Program",
    description: "Register as an affiliate and promote barcode inventory software with referral links, QR previews, and payout visibility.",
    type: "website",
    siteName: "King Sparkon Tracker",
    images: [{ url: "/king-sparkon-logo.png", width: 512, height: 512, alt: "King Sparkon Tracker affiliate registration" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "King Sparkon Tracker Affiliate Registration",
    description: "Create an affiliate profile for QR-ready referrals and commission visibility.",
    images: ["/king-sparkon-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RegisterAffiliatePage() {
  return <AuthPage mode="affiliate" />;
}
