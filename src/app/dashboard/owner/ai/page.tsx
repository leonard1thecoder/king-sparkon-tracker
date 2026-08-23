import type { Metadata } from "next";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { KingSparkonAIWorkspace } from "@/components/ai/KingSparkonAIWorkspace";

export const metadata: Metadata = {
  title: "King Sparkon AI | Owner Dashboard",
  description: "King Sparkon AI assistant for owner workspace.",
  robots: { index: false, follow: false },
};

export default function OwnerAIPage() {
  return (
    <>
      <DashboardHeader role="Owner" title="King Sparkon AI" description="AI assistant for products, workers, tickets and operations." />
      <main className="grid gap-6 p-5 md:p-8">
        <KingSparkonAIWorkspace />
      </main>
    </>
  );
}
