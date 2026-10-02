import type { ReactNode } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { DomainDataWorkspace } from "@/components/dashboard/DomainDataWorkspace";

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
      <main className="ops-main grid gap-4 p-4 md:p-5">
        <div className="grid gap-1.5">
          <h1 className="text-[1.25rem] font-bold leading-tight tracking-[-0.02em] text-[var(--ink)]">{title}</h1>
          <p className="max-w-3xl text-[0.8125rem] leading-5 text-[var(--steel)]">{description}</p>
        </div>
        {children ? children : null}
        {endpoint ? <DomainDataWorkspace endpoint={endpoint} title={title} /> : null}
      </main>
    </>
  );
}
