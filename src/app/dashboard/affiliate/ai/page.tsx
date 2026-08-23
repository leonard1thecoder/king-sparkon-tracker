import type { Metadata } from "next";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { KingSparkonAIWorkspace } from "@/components/ai/KingSparkonAIWorkspace";

export const metadata: Metadata = {
  title: "King Sparkon AI | Affiliate Dashboard",
  description: "King Sparkon AI assistant for affiliate growth.",
  robots: { index: false, follow: false },
};

export default function AffiliateAIPage() {
  return (
    <>
      <DashboardHeader role="Affiliate" title="King Sparkon AI" description="AI assistant for referrals and campaigns." />
      <main className="grid gap-6 p-5 md:p-8">
        <KingSparkonAIWorkspace />
      </main>
    </>
  );
}
