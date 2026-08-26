import type { Metadata } from "next";
import { BusinessWorkspace } from "@/components/business/BusinessWorkspace";

export const metadata: Metadata = {
  title: "Business | User Dashboard",
  description: "Business overview with products, tickets and job posts.",
};

export default async function BusinessPage({ params }: { params: Promise<{ businessKey: string }> }) {
  const { businessKey } = await params;
  return (
    <main className="min-h-dvh bg-[var(--surface)] p-5 md:p-8">
      <div className="mx-auto w-full max-w-6xl">
        <BusinessWorkspace businessKeyParam={businessKey} />
      </div>
    </main>
  );
}
