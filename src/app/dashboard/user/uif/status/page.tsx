import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { UifIdForm } from "@/components/uif/UifIdForm";

export const metadata: Metadata = {
  title: "Check UIF Status | User Dashboard",
  description: "Blank page for checking UIF status from the profile menu.",
  robots: { index: false, follow: false },
};

export default function UifStatusPage() {
  return (
    <div className="mx-auto grid max-w-4xl gap-6">
      <Link href="/dashboard/user" className="inline-flex w-fit items-center gap-2 text-sm font-bold text-[var(--steel)] hover:text-[var(--signal-strong)]">
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>
      <Card>
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[var(--signal)]" /> Check UIF Status
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-sm leading-6 text-[var(--steel)]">Enter your 13-digit ID to check UIF status. Input blocks non-digits and enforces 13-digit length.</p>
          <UifIdForm actionLabel="Check UIF Status" placeholderStatus="Checked UIF status" />
        </CardContent>
      </Card>
    </div>
  );
}
