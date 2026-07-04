import type { ReactNode } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { ContractDataWorkspace } from "@/components/dashboard/ContractDataWorkspace";

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
        {endpoint ? <ContractDataWorkspace endpoint={endpoint} title={title} /> : null}
      </main>
    </>
  );
}
