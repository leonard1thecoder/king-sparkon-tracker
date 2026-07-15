export type LandingScrollDirection = "down" | "up";
export type LandingSectionSide = -1 | 1;
export type LandingSectionMotionDecision = "show" | "hide" | "keep";

export type LandingSectionBounds = {
  top: number;
  bottom: number;
};

export type LandingMotionViewport = {
  revealTop: number;
  revealBottom: number;
  hideTop: number;
  hideBottom: number;
};

const LANDING_SECTION_SIDES: Record<string, LandingSectionSide> = {
  vision: -1,
  sponsor: -1,
  features: 1,
  jobs: -1,
  affiliate: 1,
  "dev-hub": -1,
  roles: 1,
  capacity: -1,
  complaints: 1,
  pricing: -1,
  contact: 1,
  subscribe: -1,
};

export function landingSectionSide(sectionId: string, index: number): LandingSectionSide {
  return LANDING_SECTION_SIDES[sectionId] ?? (index % 2 === 0 ? -1 : 1);
}

export function landingEnterOffset(side: LandingSectionSide, direction: LandingScrollDirection) {
  return side * (direction === "down" ? 1 : -1) * 92;
}

export function landingExitOffset(side: LandingSectionSide, direction: LandingScrollDirection) {
  return side * (direction === "up" ? 1 : -1) * 76;
}

export function landingActiveIndex(sectionTops: readonly number[], marker: number) {
  let activeIndex = 0;

  for (let index = 0; index < sectionTops.length; index += 1) {
    if (sectionTops[index] > marker) break;
    activeIndex = index;
  }

  return activeIndex;
}

export function landingNavigationTargetReached(
  top: number,
  bottom: number,
  marker: number,
  tolerance = 24,
) {
  return top <= marker + tolerance && bottom >= marker - tolerance;
}

export function landingSectionMotionDecision(
  bounds: LandingSectionBounds,
  viewport: LandingMotionViewport,
  forceVisible = false,
): LandingSectionMotionDecision {
  if (forceVisible) return "show";

  const intersectsRevealZone =
    bounds.top <= viewport.revealBottom && bounds.bottom >= viewport.revealTop;
  if (intersectsRevealZone) return "show";

  const isOutsideHideZone =
    bounds.bottom < viewport.hideTop || bounds.top > viewport.hideBottom;
  if (isOutsideHideZone) return "hide";

  return "keep";
}
