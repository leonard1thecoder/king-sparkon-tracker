import type { Metadata } from "next";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { KingSparkonAIWorkspace } from "@/components/ai/KingSparkonAIWorkspace";

export const metadata: Metadata = {
  title: "King Sparkon AI | Worker Dashboard",
  description: "King Sparkon AI assistant for worker tasks.",
  robots: { index: false, follow: false },
};

export default function WorkerAIPage() {
  return (
    <>
      <DashboardHeader role="Worker" title="King Sparkon AI" description="AI assistant for scanning and operations." />
      <main className="grid gap-6 p-5 md:p-8">
        <KingSparkonAIWorkspace />
      </main>
    </>
  );
}
