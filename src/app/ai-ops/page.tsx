import type { Metadata } from "next";
import { AiOpsSearch } from "@/components/ai/AiOpsSearch";

export const metadata: Metadata = {
  title: "Full King Sparkon AI | Search, Jobs, Affiliates, Products, Tips, Tickets",
  description:
    "Full King Sparkon AI searches users, job posts, CV applications, affiliates, business prospects, products, tips, and tickets with read-only AI summaries.",
  alternates: { canonical: "/ai-ops" },
};

export default function AiOpsPage() {
  return <AiOpsSearch />;
}
