import type { ReactNode } from "react";
import { DashboardFrame } from "@/components/layout/DashboardFrame";
import { ArtistNav } from "@/components/nav/ArtistNav";

export default function ArtistLayout({ children }: { children: ReactNode }) {
  return <DashboardFrame role="ARTIST STUDIO" nav={<ArtistNav />}>{children}</DashboardFrame>;
}
