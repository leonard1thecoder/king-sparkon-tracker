import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Worker Tips, Fees & Payouts | Transparent Money Flows",
  description:
    "How tip QR flows, gross/fee/net and withdrawal status keep money transparent before the owner approves in King Sparkon.",
  path: "/articles/worker-tips-payouts",
});

export { default } from "@/app/guides/worker-tips-payouts/page";
