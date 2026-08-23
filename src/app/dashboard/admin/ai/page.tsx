import type { Metadata } from "next";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { KingSparkonAIWorkspace } from "@/components/ai/KingSparkonAIWorkspace";

export const metadata: Metadata = {
  title: "King Sparkon AI | Admin Dashboard",
  description: "King Sparkon AI assistant for platform oversight.",
  robots: { index: false, follow: false },
};

export default function AdminAIPage() {
  return (
    <>
      <DashboardHeader role="Admin" title="King Sparkon AI" description="AI assistant for platform operations." />
      <main className="grid gap-6 p-5 md:p-8">
        <KingSparkonAIWorkspace />
      </main>
    </>
  );
}
