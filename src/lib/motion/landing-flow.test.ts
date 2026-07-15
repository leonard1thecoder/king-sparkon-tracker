import { describe, expect, it } from "vitest";
import {
  landingEnterOffset,
  landingExitOffset,
  landingSectionSide,
} from "@/lib/motion/landing-flow";

describe("landing directional motion", () => {
  it("slides Vision from left to right when scrolling down", () => {
    const side = landingSectionSide("vision", 0);
    expect(side).toBe(-1);
    expect(landingEnterOffset(side, "down")).toBeLessThan(0);
  });

  it("slides Features from right to left when scrolling down", () => {
    const side = landingSectionSide("features", 2);
    expect(side).toBe(1);
    expect(landingEnterOffset(side, "down")).toBeGreaterThan(0);
  });

  it("reverses entry and removes sections toward their original side on upward scroll", () => {
    const visionSide = landingSectionSide("vision", 0);
    expect(landingEnterOffset(visionSide, "up")).toBeGreaterThan(0);
    expect(landingExitOffset(visionSide, "up")).toBeLessThan(0);
  });
});
