import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { UIFBenefitsApplyClient } from "@/components/uif/UIFBenefitsApplyClient";

export const metadata: Metadata = {
  title: "Apply for UIF Benefits",
  description: "Upload UI-19, Salary Schedule and UIF 2.8 documents to continue with your UIF benefit application.",
  robots: { index: false, follow: false },
};

export default function UifApplyGenericPage() {
  return (
    <div className="mx-auto grid max-w-4xl gap-6 p-5 md:p-8">
      <Link href="/dashboard" className="inline-flex w-fit items-center gap-2 text-sm font-bold text-[var(--steel)] hover:text-[var(--signal-strong)]">
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>
      <div className="rounded-[var(--radius-2xl)] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)] md:p-8">
        <UIFBenefitsApplyClient />
      </div>
    </div>
  );
}
