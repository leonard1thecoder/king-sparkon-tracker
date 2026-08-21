import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
export const metadata: Metadata = pageMetadata({ title: "Worker Tips & Payouts", description: "Worker tips guide.", path: "/articles/worker-tips-payouts" });
export default function Page(){ redirect("/guides/worker-tips-payouts"); }
