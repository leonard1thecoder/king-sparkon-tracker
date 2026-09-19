import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "QR Ticket Operations Manual | Capacity, Sales & Gate Verification",
  description:
    "Create events, set capacity, sell tickets, and verify QR codes at the gate with correct checked-in totals in King Sparkon.",
  path: "/articles/qr-ticket-operations",
});

export { default } from "@/app/guides/qr-ticket-operations/page";
