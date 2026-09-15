import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Barcode Inventory Guide | Products, Unit Codes & Stock Audits",
  description:
    "Learn how to create products, assign barcodes or unit codes, manage stock quantity and remaining slots, and use night-shift pricing in King Sparkon Tracker.",
  path: "/articles/barcode-inventory-guide",
});

export { default } from "@/app/guides/barcode-inventory-guide/page";
