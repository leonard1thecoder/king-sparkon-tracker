import type { Metadata } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://king-sparkon-tracker.com").replace(/\/$/, "");

export function canonical(path: string) {
  return `${siteUrl}${path}`;
}

export function pageMetadata({
  title,
  description,
  path,
  keywords,
  noIndex = false,
  image,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  noIndex?: boolean;
  image?: string;
}): Metadata {
  const url = canonical(path);
  return {
    title,
    description,
    keywords,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url,
      siteName: "King Sparkon Tracker",
      type: "website",
      locale: "en_ZA",
      images: [{ url: image ?? "/king-sparkon-logo.png", width: 512, height: 512, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image ?? "/king-sparkon-logo.png"],
    },
    robots: noIndex ? { index: false, follow: false, noarchive: true } : { index: true, follow: true },
  };
}

export const siteConfig = {
  url: siteUrl,
  name: "King Sparkon Tracker",
  title: "King Sparkon Tracker™ | Barcode, QR Tickets & Business Operations",
  description:
    "King Sparkon Tracker is a trademark platform of Sizolwakhe Leonard Mthimunye for barcode inventory, QR ticket verification, cart checkout, job opportunities, worker tips, affiliate marketing and role-safe dashboards.",
};
