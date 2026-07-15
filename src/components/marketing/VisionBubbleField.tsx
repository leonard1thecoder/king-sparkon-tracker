"use client";

import type { LucideIcon } from "lucide-react";
import { BouncingCircleField } from "@/components/marketing/BouncingCircleField";

type VisionBubble = {
  icon: LucideIcon;
  title: string;
  copy: string;
};

export function VisionBubbleField({ items }: { items: readonly VisionBubble[] }) {
  return <BouncingCircleField items={items} ariaLabel="King Sparkon vision principles" variant="vision" />;
}
