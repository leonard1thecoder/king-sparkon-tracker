import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
export const metadata: Metadata = pageMetadata({ title: "Barcode Inventory Guide", description: "Barcode inventory guide.", path: "/articles/barcode-inventory-guide" });
export default function Page(){ redirect("/guides/barcode-inventory-guide"); }
