import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";

export default function PartnerDashboardPage() {
  return (
    <>
      <DashboardHeader role="PARTNER" title="Referral ledger" description="Referral code, promotion link, QR preview, onboarding, commissions, payouts, marketing assets, and performance." />
      <main className="grid gap-5 p-5 md:p-8">
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard label="Referral" value="Code/link" detail="Copy and QR preview" />
          <MetricCard label="Commission" value="Summary" detail="Backend payout source of truth" />
          <MetricCard label="Assets" value="Campaign" detail="Marketing materials and tracking" />
        </div>
        <Card>
          <CardHeader><CardTitle>Referral tools</CardTitle></CardHeader>
          <CardContent><p className="text-sm leading-6 text-[var(--steel)]">Use the left navigation for onboarding, referrals, commissions, payouts, marketing assets, and performance.</p></CardContent>
        </Card>
      </main>
    </>
  );
}
