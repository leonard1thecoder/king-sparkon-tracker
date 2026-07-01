import type { ReactNode } from "react";
import { ArrowRight, PlugZap } from "lucide-react";
import { DashboardHeader } from "./DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";

export function RouteSectionPage({
  role,
  title,
  description,
  endpoint,
  children,
}: {
  role: string;
  title: string;
  description: string;
  endpoint?: string;
  children?: ReactNode;
}) {
  return (
    <>
      <DashboardHeader role={role} title={title} description={description} />
      <main className="grid gap-5 p-5 md:p-8">
        {children ? children : null}
        <Card>
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Backend integration</CardTitle>
              <p className="mt-2 text-sm leading-6 text-[var(--steel)]">This route is ready for live data from the matching domain API module.</p>
            </div>
            <StatusPill label={endpoint ? "API READY" : "UI READY"} tone={endpoint ? "confirm" : "neutral"} />
          </CardHeader>
          <CardContent className="grid gap-4">
            {endpoint ? (
              <div className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] p-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-[var(--radius-md)] bg-white text-[var(--signal)]">
                    <PlugZap className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--steel)]">Endpoint contract</p>
                    <p className="code mt-2 break-all text-sm font-semibold text-[var(--ink)]">{endpoint}</p>
                  </div>
                </div>
              </div>
            ) : null}
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--steel)]">
              <ArrowRight className="h-4 w-4 text-[var(--signal)]" /> Replace mock blocks only when backend response shape is confirmed.
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
