import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Register Affiliate | King Sparkon Referral Program",
  description:
    "Join the King Sparkon affiliate program to promote barcode inventory software with profile-based social links, QR-ready referrals, commission visibility, and payout tracking.",
  keywords: [
    "King Sparkon affiliate registration",
    "barcode software affiliate program",
    "inventory software referral program",
    "QR referral links",
    "business software affiliate South Africa",
  ],
  alternates: {
    canonical: "/register-affiliate",
  },
  openGraph: {
    title: "Join the King Sparkon Affiliate Program",
    description: "Register as an affiliate and promote barcode inventory software with referral links, QR previews, and payout visibility.",
    type: "website",
    siteName: "King Sparkon",
    images: [{ url: "/king-sparkon-logo.png", width: 2720, height: 1200, alt: "King Sparkon affiliate registration" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "King Sparkon Affiliate Registration",
    description: "Create an affiliate profile for QR-ready referrals and commission visibility.",
    images: ["/king-sparkon-logo.png"],
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterAffiliatePage() {
  redirect("/register?plan=FREE_AFFILIATE&privilege=AFFILIATE&service=FREE_AFFILIATE_ACCESS");
}
