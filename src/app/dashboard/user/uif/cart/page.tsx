import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { UifCartWorkspace } from "@/components/uif/UifCartWorkspace";

export const metadata: Metadata = {
  title: "UIF Cart | User Dashboard",
  description: "UIF password reset cart — pay R14.28 to trigger update.",
  robots: { index: false, follow: false },
};

export default function UifCartPage() {
  return (
    <div className="mx-auto grid max-w-4xl gap-6">
      <Link href="/dashboard/user/uif/password" className="inline-flex w-fit items-center gap-2 text-sm font-bold text-[var(--steel)] hover:text-[var(--signal-strong)]">
        <ArrowLeft className="h-4 w-4" /> Back to UIF password
      </Link>
      <Card>
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-[var(--signal)]" /> UIF Cart — R14.28
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UifCartWorkspace />
        </CardContent>
      </Card>
    </div>
  );
}
