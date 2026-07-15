import { describe, expect, it } from "vitest";
import {
  landingActiveIndex,
  landingEnterOffset,
  landingExitOffset,
  landingNavigationTargetReached,
  landingSectionMotionDecision,
  landingSectionSide,
} from "@/lib/motion/landing-flow";

const viewport = {
  revealTop: 180,
  revealBottom: 820,
  hideTop: 80,
  hideBottom: 980,
};

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

  it("hands navigation from a tall Features section to Jobs as soon as Jobs crosses the marker", () => {
    const marker = 220;
    const sectionTops = [-1800, -900, 180, 1400];
    expect(landingActiveIndex(sectionTops, marker)).toBe(2);
  });

  it("keeps a clicked navigation target active until its section reaches the viewport marker", () => {
    expect(landingNavigationTargetReached(700, 1700, 220)).toBe(false);
    expect(landingNavigationTargetReached(210, 1210, 220)).toBe(true);
  });

  it("shows a section whenever it enters the reveal zone", () => {
    expect(
      landingSectionMotionDecision({ top: 760, bottom: 1460 }, viewport),
    ).toBe("show");
  });

  it("hides sections only after they fully leave the buffered viewport", () => {
    expect(
      landingSectionMotionDecision({ top: -900, bottom: 70 }, viewport),
    ).toBe("hide");
    expect(
      landingSectionMotionDecision({ top: 990, bottom: 1690 }, viewport),
    ).toBe("hide");
  });

  it("keeps the current state inside the hysteresis buffer", () => {
    expect(
      landingSectionMotionDecision({ top: 850, bottom: 1550 }, viewport),
    ).toBe("keep");
  });

  it("forces the active section visible even outside normal reveal bounds", () => {
    expect(
      landingSectionMotionDecision({ top: 1400, bottom: 2100 }, viewport, true),
    ).toBe("show");
  });
});
