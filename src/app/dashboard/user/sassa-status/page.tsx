import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Landmark } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { SassaStatusForm } from "@/components/sassa/SassaStatusForm";

export const metadata: Metadata = {
  title: "SASSA 370 Status | User Dashboard",
  description: "Check SASSA SRD 370 status from your King Sparkon user dashboard.",
  robots: { index: false, follow: false },
};

export default function SassaStatusPage() {
  return (
    <div className="mx-auto grid max-w-4xl gap-6">
      <Link href="/dashboard/user" className="inline-flex w-fit items-center gap-2 text-sm font-bold text-[var(--steel)] hover:text-[var(--signal-strong)]">
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>
      <Card>
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2">
            <Landmark className="h-5 w-5 text-[var(--signal)]" /> SASSA 370 Status
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-sm leading-6 text-[var(--steel)]">Enter your 13-digit ID and 10-digit cellphone (e.g. 0824557712) to check SASSA 370 status. Inputs block non-digits and enforce length.</p>
          <SassaStatusForm />
        </CardContent>
      </Card>
    </div>
  );
}
