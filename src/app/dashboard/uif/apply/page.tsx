import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RegionGate } from "@/components/region/RegionGate";
import { UIFBenefitsApplyClient } from "@/components/uif/UIFBenefitsApplyClient";

export const metadata: Metadata = {
  title: "Apply for UIF Benefits",
  description: "Upload UI-19, Salary Schedule and UIF 2.8 documents to continue with your UIF benefit application.",
  robots: { index: false, follow: false },
};

export default function UifApplyGenericPage() {
  return (
    <div className="page-main mx-auto max-w-4xl">
      <Link href="/dashboard" className="inline-flex w-fit items-center gap-1.5 text-[0.8125rem] font-bold text-[var(--steel)] hover:text-[var(--signal-strong)]">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
      </Link>
      <div className="rounded-[var(--radius-xl)] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-soft)]">
        <RegionGate serviceName="UIF services">
          <UIFBenefitsApplyClient />
        </RegionGate>
      </div>
    </div>
  );
}
