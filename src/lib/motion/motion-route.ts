export type MotionController = "landing" | "director" | "none";

// Public-site routes carry their own motion inside each scene component. The
// global director manipulates arbitrary DOM (main > section, header, clicks),
// which would fight those scenes, so it is switched off on these routes only.
const PUBLIC_SITE_PREFIXES = ["/events", "/mall", "/jobs", "/uif", "/about", "/contact", "/privacy", "/terms"] as const;

export function isPublicSitePath(pathname: string | null | undefined) {
  if (!pathname) return false;
  if (pathname === "/") return true;
  return PUBLIC_SITE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function motionControllerForPath(pathname: string): MotionController {
  if (isPublicSitePath(pathname)) return "none";
  return "director";
}
