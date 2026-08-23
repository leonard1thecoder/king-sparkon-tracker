import type { Metadata } from "next";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { KingSparkonAIWorkspace } from "@/components/ai/KingSparkonAIWorkspace";

export const metadata: Metadata = {
  title: "King Sparkon AI | User Dashboard",
  description: "King Sparkon AI assistant in your dashboard — no floating overlay, always visible in the left sidebar.",
  robots: { index: false, follow: false },
};

export default function UserAIPage() {
  return (
    <>
      <DashboardHeader role="User" title="King Sparkon AI" description="Dashboard AI assistant — now in the left sidebar so it never hides information." />
      <main className="grid gap-6 p-5 md:p-8">
        <KingSparkonAIWorkspace />
      </main>
    </>
  );
}
