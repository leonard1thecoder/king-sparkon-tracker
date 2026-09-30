"use client";

import type { ReactNode } from "react";
import { MapPin } from "lucide-react";
import { useLocalization } from "@/lib/localization";

export function RegionGate({ serviceName, children }: { serviceName: string; children: ReactNode }) {
  const { localizationCountry, loading } = useLocalization();

  if (loading || localizationCountry === "SOUTH_AFRICA") {
    return <>{children}</>;
  }

  return (
    <div className="rounded-[2rem] border border-dashed border-[var(--line-strong)] bg-white p-10 text-center shadow-[var(--shadow-soft)]">
      <MapPin className="mx-auto h-10 w-10 text-[var(--signal)]" />
      <h1 className="mt-4 text-3xl font-black tracking-[-0.04em]">South Africa only</h1>
      <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-6 text-[var(--steel)]">
        {serviceName} is available for South African accounts only. Your account is registered outside South Africa, so this service is hidden and cannot be purchased.
      </p>
    </div>
  );
}
