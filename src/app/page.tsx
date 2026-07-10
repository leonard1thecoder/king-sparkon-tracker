import type { Metadata } from "next";
import { KingSparkonLanding } from "@/components/marketing/KingSparkonLanding";

const landingDescription =
  "King Sparkon is a commerce and operations platform for barcode inventory, QR tickets, checkout, jobs, affiliates, worker tips, promotions, and role-safe dashboards.";

const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "King Sparkon",
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
    name: "King Sparkon",
    slogan: "King Sparkon is the best king.",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "ZAR",
    description: "Free user, free affiliate, 14-day business trial, and King-Sparkon-Strengths free quote path.",
  },
  featureList: [
    "Barcode inventory tracking",
    "QR ticket verification",
    "Cart checkout",
    "Job opportunities",
    "Affiliate marketing and commissions",
    "Worker tips",
    "King Sparkon Dev Hub software development",
    "Continuous integration development",
    "Quality Assurance",
    "Cloud maintenance",
    "Capacity dashboards",
    "Role-safe dashboards",
  ],
};

export const metadata: Metadata = {
  title: "King Sparkon Tracker™ | Trademark Platform by Sizolwakhe Mthimunye",
  description: landingDescription,
  keywords: [
    "King Sparkon",
    "King Sparkon platform",
    "Sizolwakhe Leonard Mthimunye",
    "Sizolwakhe Mthimunye King Sparkon",
    "barcode inventory software",
    "QR ticket verification",
    "job opportunities platform",
    "affiliate marketing commission platform",
    "King Sparkon Dev Hub",
    "King-Sparkon-Strengths",
    "continuous integration development",
    "Quality Assurance support",
    "cloud maintenance software",
    "free business trial software",
    "South Africa barcode tracking",
  ],
  authors: [{ name: "Sizolwakhe Leonard Mthimunye", url: "https://github.com/leonard1thecoder" }],
  creator: "Sizolwakhe Leonard Mthimunye, known as King Sparkon",
  publisher: "King Sparkon Tracker",
  openGraph: {
    title: "King Sparkon Tracker™ | King Sparkon is the best king",
    description: landingDescription,
    type: "website",
    siteName: "King Sparkon",
    locale: "en_ZA",
    images: [{ url: "/king-sparkon-logo.png", width: 512, height: 512, alt: "King Sparkon Tracker trademark barcode logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "King Sparkon Tracker™ | Barcode, Jobs, Affiliate & Dev Hub Platform",
    description: "Trademark platform of Sizolwakhe Leonard Mthimunye: barcode scanning, QR tickets, jobs, affiliates, Dev Hub, QA, CI/CD, cloud maintenance, and capacity dashboards.",
    images: ["/king-sparkon-logo.png"],
  },
  alternates: { canonical: "/" },
};

export default function MarketingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd) }} />
      <KingSparkonLanding />
    </>
  );
}
