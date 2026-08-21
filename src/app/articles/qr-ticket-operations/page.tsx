import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
export const metadata: Metadata = pageMetadata({ title: "QR Ticket Operations", description: "QR ticket operations guide.", path: "/articles/qr-ticket-operations" });
export default function Page(){ redirect("/guides/qr-ticket-operations"); }
