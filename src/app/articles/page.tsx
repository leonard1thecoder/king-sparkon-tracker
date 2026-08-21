import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Articles | King Sparkon Tracker Guides & Resources",
  description:
    "Browse all King Sparkon Tracker articles and guides — barcode inventory, QR tickets, worker tips, affiliate referrals, how-it-works and feature explainers.",
  path: "/articles",
});

export default function ArticlesPage() {
  redirect("/guides");
}
