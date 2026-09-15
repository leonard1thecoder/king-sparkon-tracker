import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Affiliate Referrals & Campaigns | Codes, Quotes & Commissions",
  description:
    "Referral codes, promotion quotes, audience targeting and commission visibility — no guesswork on earnings with King Sparkon Tracker.",
  path: "/articles/affiliate-referrals",
});

export { default } from "@/app/guides/affiliate-referrals/page";
