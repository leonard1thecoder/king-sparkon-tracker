import type { Metadata } from "next";
import { DevHubAiConsole } from "@/components/dev-hub/DevHubAiConsole";

export const metadata: Metadata = {
  title: "Dev Hub AI | King Sparkon AI Development Pricing and Plans",
  description:
    "King Sparkon AI Dev Hub creates automated development price estimates, plans, and owner accept or reject workflows for software requests.",
  alternates: { canonical: "/dev-hub" },
};

export default function DevHubPage() {
  return <DevHubAiConsole />;
}
