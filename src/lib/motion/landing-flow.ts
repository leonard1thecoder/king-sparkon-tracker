export type LandingScrollDirection = "down" | "up";
export type LandingSectionSide = -1 | 1;

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
