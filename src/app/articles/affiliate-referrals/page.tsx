import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
export const metadata: Metadata = pageMetadata({ title: "Affiliate Referrals", description: "Affiliate referrals guide.", path: "/articles/affiliate-referrals" });
export default function Page(){ redirect("/guides/affiliate-referrals"); }
