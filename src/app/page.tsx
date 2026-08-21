import type { Metadata } from "next";
import { PremiumHeader } from "@/components/marketing/PremiumHeader";
import { PremiumLanding } from "@/components/marketing/PremiumLanding";

const landingDescription =
  "King Sparkon Tracker™ is the trademark platform of Sizolwakhe Leonard Mthimunye for barcode inventory, QR ticket verification, cart checkout, job opportunities, worker tips, affiliate growth and role-safe business operations in South Africa.";

const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "King Sparkon Tracker",
  alternateName: "King Sparkon",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description: landingDescription,
  creator: {
    "@type": "Person",
    name: "Sizolwakhe Leonard Mthimunye",
    alternateName: "King Sparkon",
    sameAs: ["https://github.com/leonard1thecoder"],
  },
  brand: {
    "@type": "Brand",
    name: "King Sparkon Tracker",
    slogan: "Scan it. Sell it. Track it. Prove it.",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "ZAR",
    description: "Free access for users, affiliates, and business owners. Plus and Pro for extended worker limits.",
  },
  featureList: [
    "Barcode inventory tracking with unit-level audit",
    "QR ticket capacity and gate verification",
    "Cart checkout and collection QR",
    "Job opportunities and applications",
    "Affiliate referrals and promotions with quote",
    "Worker tips with transparent fees",
    "Role-safe dashboards (Owner, Worker, Affiliate, User, Admin)",
    "Capacity dashboards and audit trails",
    "Billing with Stripe and plan limits",
  ],
};

export const metadata: Metadata = {
  title: "King Sparkon Tracker™ | Barcode, QR Tickets & Operations Platform",
  description: landingDescription,
  keywords: [
    "King Sparkon Tracker",
    "Sizolwakhe Leonard Mthimunye",
    "barcode inventory software South Africa",
    "QR ticket verification",
    "business operations platform",
    "worker tips platform",
    "affiliate marketing platform",
    "job opportunities platform",
    "King Sparkon trademark",
  ],
  authors: [{ name: "Sizolwakhe Leonard Mthimunye", url: "https://github.com/leonard1thecoder" }],
  creator: "Sizolwakhe Leonard Mthimunye, known as King Sparkon",
  publisher: "King Sparkon Tracker",
  openGraph: {
    title: "King Sparkon Tracker™ — Scan it. Sell it. Track it. Prove it.",
    description: landingDescription,
    type: "website",
    siteName: "King Sparkon Tracker",
    locale: "en_ZA",
    images: [{ url: "/king-sparkon-logo.png", width: 512, height: 512, alt: "King Sparkon Tracker trademark barcode logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "King Sparkon Tracker™ | Barcode, QR Tickets & Business Operations",
    description: landingDescription,
    images: ["/king-sparkon-logo.png"],
  },
  alternates: { canonical: "/" },
};

export default function MarketingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd) }} />
      <PremiumHeader />
      <PremiumLanding />
    </>
  );
}
