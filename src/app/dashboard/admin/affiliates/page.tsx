import type { Metadata } from "next";
import { AdminAffiliatePosterWorkspace } from "@/components/admin/AdminAffiliatePosterWorkspace";

export const metadata: Metadata = {
  title: "Admin Affiliate Posters | King Sparkon Tracker",
  description: "Upload and manage affiliate campaign posters for Tickets, Products, Tips and Job Opportunities.",
};

export default function AdminAffiliatesPage() {
  return <AdminAffiliatePosterWorkspace />;
}
