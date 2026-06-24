import type { ReactNode } from "react";
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
        <Card>
          <CardHeader>
            <CardTitle>Backend wiring</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <StatusPill label={endpoint ? "API READY" : "UI READY"} tone={endpoint ? "confirm" : "neutral"} />
            {endpoint ? <p className="code break-all text-sm">{endpoint}</p> : null}
            <p className="text-sm leading-6 text-[var(--steel)]">
              This page is separated from the dashboard shell and must use the domain API module for live data. Empty states are intentional until backend data returns.
            </p>
          </CardContent>
        </Card>
        {children}
      </main>
    </>
  );
}
