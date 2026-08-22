import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Landmark } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Update UIF Password | User Dashboard",
  description: "Blank page for updating UIF online status password.",
  robots: { index: false, follow: false },
};

export default function UifPasswordPage() {
  return (
    <div className="mx-auto grid max-w-4xl gap-6">
      <Link href="/dashboard/user" className="inline-flex w-fit items-center gap-2 text-sm font-bold text-[var(--steel)] hover:text-[var(--signal-strong)]">
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>
      <Card>
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2">
            <Landmark className="h-5 w-5 text-[var(--signal)]" /> Update UIF Password
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-sm leading-6 text-[var(--steel)]">Blank placeholder for updating UIF online status password. Add form here when ready.</p>
          <div className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--surface)] p-8 text-center">
            <p className="text-sm font-black text-[var(--ink)]">Blank page — no redirect</p>
            <p className="mt-1 text-xs leading-5 text-[var(--muted)]">Password update form will appear here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
