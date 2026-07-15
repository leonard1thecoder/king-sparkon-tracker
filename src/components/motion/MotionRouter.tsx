"use client";

import { usePathname } from "next/navigation";
import { motionControllerForPath } from "@/lib/motion/motion-route";
import { LandingDirectionalMotion } from "@/components/motion/LandingDirectionalMotion";
import { MotionDirector } from "@/components/motion/MotionDirector";

export function MotionRouter() {
  const pathname = usePathname();
  const controller = motionControllerForPath(pathname);

  return controller === "landing" ? <LandingDirectionalMotion /> : <MotionDirector />;
}
