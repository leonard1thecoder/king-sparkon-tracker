export type MotionController = "landing" | "director";

export function motionControllerForPath(pathname: string): MotionController {
  return pathname === "/" ? "landing" : "director";
}
