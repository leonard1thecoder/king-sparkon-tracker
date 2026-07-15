import { describe, expect, it } from "vitest";
import { motionControllerForPath } from "@/lib/motion/motion-route";

describe("motion controller routing", () => {
  it("uses only the landing controller on the landing page", () => {
    expect(motionControllerForPath("/")).toBe("landing");
  });

  it("keeps the existing director for dashboards and other pages", () => {
    expect(motionControllerForPath("/dashboard/user")).toBe("director");
    expect(motionControllerForPath("/login")).toBe("director");
  });
});
