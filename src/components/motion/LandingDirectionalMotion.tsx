"use client";

import { useEffect } from "react";
import {
  landingActiveIndex,
  landingEnterOffset,
  landingExitOffset,
  landingNavigationTargetReached,
  landingSectionMotionDecision,
  landingSectionSide,
  type LandingScrollDirection,
  type LandingSectionMotionDecision,
} from "@/lib/motion/landing-flow";

const LANDING_SECTION_SELECTOR = "main section[id]";
const SECTION_NAV_SELECTOR = "header [aria-label='Section navigation'] a[href^='#']";
const SECTION_CHANGE_EVENT = "king-sparkon:landing-section-change";
const NAVIGATION_LOCK_TIMEOUT_MS = 5000;
const NAVIGATION_KEYS = new Set([
  "ArrowDown",
  "ArrowUp",
  "End",
  "Home",
  "PageDown",
  "PageUp",
  " ",
]);

type SectionChangeSource = "scroll" | "navigation" | "initial";
type SectionMotionState = "hidden" | "preparing" | "visible";

function targetFromAnchor(anchor: HTMLAnchorElement) {
  const href = anchor.getAttribute("href") ?? "";
  const hash = href.startsWith("#")
    ? href
    : href.startsWith("/#") && window.location.pathname === "/"
      ? href.slice(1)
      : "";

  if (hash.length < 2) return null;
  return document.getElementById(decodeURIComponent(hash.slice(1)));
}

function sectionHref(section: HTMLElement) {
  return `#${section.id}`;
}

export function LandingDirectionalMotion() {
  useEffect(() => {
    const main = document.querySelector<HTMLElement>("main");
    if (!main) return;

    const sections = Array.from(
      document.querySelectorAll<HTMLElement>(LANDING_SECTION_SELECTOR),
    );
    if (sections.length === 0) return;

    const sectionIndexes = new Map(
      sections.map((section, index) => [section, index]),
    );
    const navigationAnchors = Array.from(
      document.querySelectorAll<HTMLAnchorElement>(SECTION_NAV_SELECTOR),
    );
    const navigableSections = navigationAnchors
      .map((anchor) => targetFromAnchor(anchor))
      .filter((section): section is HTMLElement => Boolean(section));
    const navigationRoot = document.querySelector<HTMLElement>("header");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motionStates = new Map<HTMLElement, SectionMotionState>();
    const revealFrames = new Map<HTMLElement, number>();
    const previousOverflowX = main.style.overflowX;

    let scrollFrame = 0;
    let mainReadyFrame = 0;
    let lastScrollY = window.scrollY;
    let scrollDirection: LandingScrollDirection = "down";
    let activeHref = "";
    let navigationSyncFrame = 0;
    let navigationTarget: HTMLElement | null = null;
    let navigationDeadline = 0;

    main.style.overflowX = "clip";

    function sideFor(section: HTMLElement) {
      return landingSectionSide(
        section.id,
        sectionIndexes.get(section) ?? 0,
      );
    }

    function setSectionAccessibility(section: HTMLElement, visible: boolean) {
      section.inert = !visible;
      if (visible) section.removeAttribute("aria-hidden");
      else section.setAttribute("aria-hidden", "true");
    }

    function setMotionOffset(section: HTMLElement, x: number, y: number) {
      section.style.setProperty("--landing-motion-x", `${x}px`);
      section.style.setProperty("--landing-motion-y", `${y}px`);
    }

    function cancelRevealFrame(section: HTMLElement) {
      const frame = revealFrames.get(section);
      if (!frame) return;
      window.cancelAnimationFrame(frame);
      revealFrames.delete(section);
    }

    function showSection(
      section: HTMLElement,
      direction: LandingScrollDirection,
      immediate = false,
    ) {
      const currentState = motionStates.get(section);
      if (currentState === "visible") return;
      if (
        currentState === "preparing" &&
        !immediate &&
        !reducedMotion.matches
      ) {
        return;
      }

      cancelRevealFrame(section);
      setMotionOffset(
        section,
        landingEnterOffset(sideFor(section), direction),
        direction === "down" ? 14 : -14,
      );

      if (immediate || reducedMotion.matches) {
        section.dataset.landingMotionState = "visible";
        motionStates.set(section, "visible");
        setSectionAccessibility(section, true);
        return;
      }

      section.dataset.landingMotionState = "preparing";
      motionStates.set(section, "preparing");
      setSectionAccessibility(section, false);

      const frame = window.requestAnimationFrame(() => {
        revealFrames.delete(section);
        if (motionStates.get(section) !== "preparing") return;

        section.getBoundingClientRect();
        section.dataset.landingMotionState = "visible";
        motionStates.set(section, "visible");
        setSectionAccessibility(section, true);
      });
      revealFrames.set(section, frame);
    }

    function hideSection(
      section: HTMLElement,
      direction: LandingScrollDirection,
      immediate = false,
    ) {
      cancelRevealFrame(section);
      setMotionOffset(
        section,
        landingExitOffset(sideFor(section), direction),
        direction === "down" ? -12 : 12,
      );

      if (motionStates.get(section) === "hidden" && !immediate) return;

      section.dataset.landingMotionState = "hidden";
      motionStates.set(section, "hidden");
      setSectionAccessibility(section, false);
    }

    function applyNavigationState(href: string) {
      navigationAnchors.forEach((anchor) => {
        const isActive = anchor.getAttribute("href") === href;
        if (anchor.classList.contains("landing-nav-active") !== isActive) {
          anchor.classList.toggle("landing-nav-active", isActive);
        }
        if (anchor.classList.contains("landing-nav-inactive") === isActive) {
          anchor.classList.toggle("landing-nav-inactive", !isActive);
        }

        const current = anchor.getAttribute("aria-current");
        if (isActive && current !== "location") {
          anchor.setAttribute("aria-current", "location");
        } else if (!isActive && current !== null) {
          anchor.removeAttribute("aria-current");
        }
      });
    }

    function scheduleNavigationState() {
      if (navigationSyncFrame) return;
      navigationSyncFrame = window.requestAnimationFrame(() => {
        navigationSyncFrame = 0;
        if (activeHref) applyNavigationState(activeHref);
      });
    }

    function publishActiveSection(
      section: HTMLElement,
      source: SectionChangeSource,
    ) {
      const href = sectionHref(section);
      if (href === activeHref) {
        applyNavigationState(href);
        return;
      }

      activeHref = href;
      applyNavigationState(href);
      window.dispatchEvent(
        new CustomEvent(SECTION_CHANGE_EVENT, {
          detail: { href, source },
        }),
      );
    }

    function resolveActivationMarker() {
      const headerBottom = navigationRoot?.getBoundingClientRect().bottom ?? 0;
      const headerSafeMarker = headerBottom + 48;
      const viewportMarker = window.innerHeight * 0.26;
      return Math.min(
        window.innerHeight * 0.42,
        Math.max(headerSafeMarker, viewportMarker),
      );
    }

    function resolveActiveSection() {
      const candidates = navigableSections.length > 0
        ? navigableSections
        : sections;
      const marker = resolveActivationMarker();
      const sectionTops = candidates.map(
        (section) => section.getBoundingClientRect().top,
      );
      return candidates[landingActiveIndex(sectionTops, marker)] ?? candidates[0];
    }

    function resolveMotionViewport() {
      const headerBottom = navigationRoot?.getBoundingClientRect().bottom ?? 0;
      const viewportHeight = window.innerHeight;
      return {
        revealTop: Math.min(
          viewportHeight * 0.44,
          Math.max(headerBottom + 56, viewportHeight * 0.28),
        ),
        revealBottom: viewportHeight * 0.82,
        hideTop: Math.max(headerBottom + 8, viewportHeight * 0.16),
        hideBottom: viewportHeight * 0.96,
      };
    }

    function applyMotionDecision(
      section: HTMLElement,
      decision: LandingSectionMotionDecision,
      immediate = false,
    ) {
      if (decision === "show") showSection(section, scrollDirection, immediate);
      else if (decision === "hide") hideSection(section, scrollDirection, immediate);
    }

    function syncSectionMotion(
      forceVisibleSection: HTMLElement | null,
      immediate = false,
    ) {
      if (reducedMotion.matches) {
        sections.forEach((section) => showSection(section, scrollDirection, true));
        return;
      }

      const viewport = resolveMotionViewport();
      sections.forEach((section) => {
        const bounds = section.getBoundingClientRect();
        const decision = landingSectionMotionDecision(
          bounds,
          viewport,
          section === forceVisibleSection,
        );
        applyMotionDecision(section, decision, immediate);
      });
    }

    function clearNavigationTarget() {
      navigationTarget = null;
      navigationDeadline = 0;
    }

    function updateScrollState() {
      scrollFrame = 0;
      const nextScrollY = window.scrollY;
      const delta = nextScrollY - lastScrollY;
      if (Math.abs(delta) > 2) {
        scrollDirection = delta > 0 ? "down" : "up";
      }
      lastScrollY = nextScrollY;

      const viewportActiveSection = resolveActiveSection();
      syncSectionMotion(viewportActiveSection);

      if (navigationTarget) {
        const bounds = navigationTarget.getBoundingClientRect();
        const reached = landingNavigationTargetReached(
          bounds.top,
          bounds.bottom,
          resolveActivationMarker(),
        );
        const expired = performance.now() >= navigationDeadline;

        if (!reached && !expired) {
          applyNavigationState(sectionHref(navigationTarget));
          return;
        }

        clearNavigationTarget();
      }

      if (viewportActiveSection) {
        publishActiveSection(viewportActiveSection, "scroll");
      }
    }

    function handleScroll() {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(updateScrollState);
    }

    function handleAnchorNavigation(event: MouseEvent) {
      const source = event.target;
      if (!(source instanceof Element)) return;
      const anchor = source.closest<HTMLAnchorElement>("a[href^='#'], a[href^='/#']");
      if (!anchor) return;

      const target = targetFromAnchor(anchor);
      if (!target) return;

      const targetTop = target.getBoundingClientRect().top + window.scrollY;
      scrollDirection = targetTop > window.scrollY + 80 ? "down" : "up";
      navigationTarget = target;
      navigationDeadline = performance.now() + NAVIGATION_LOCK_TIMEOUT_MS;
      publishActiveSection(target, "navigation");

      event.preventDefault();
      window.history.replaceState(null, "", sectionHref(target));
      target.scrollIntoView({
        behavior: reducedMotion.matches ? "auto" : "smooth",
        block: "start",
      });
      handleScroll();
    }

    function handleUserScrollIntent() {
      clearNavigationTarget();
      handleScroll();
    }

    function handleUserNavigationKey(event: KeyboardEvent) {
      if (!NAVIGATION_KEYS.has(event.key)) return;
      clearNavigationTarget();
      handleScroll();
    }

    function handlePageShow() {
      lastScrollY = window.scrollY;
      handleScroll();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") handleScroll();
    }

    function handleReducedMotionChange() {
      syncSectionMotion(resolveActiveSection(), true);
      handleScroll();
    }

    const navigationMutationObserver = new MutationObserver(
      scheduleNavigationState,
    );
    if (navigationRoot) {
      navigationMutationObserver.observe(navigationRoot, {
        attributes: true,
        subtree: true,
        attributeFilter: ["aria-current"],
      });
    }

    const layoutObserver = new ResizeObserver(handleScroll);
    layoutObserver.observe(main);

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    window.addEventListener("wheel", handleUserScrollIntent, { passive: true });
    window.addEventListener("touchstart", handleUserScrollIntent, { passive: true });
    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("keydown", handleUserNavigationKey);
    document.addEventListener("click", handleAnchorNavigation);
    reducedMotion.addEventListener("change", handleReducedMotionChange);

    const initialHashTarget = window.location.hash
      ? document.getElementById(
          decodeURIComponent(window.location.hash.slice(1)),
        )
      : null;
    const initialSection = initialHashTarget ?? resolveActiveSection();

    sections.forEach((section) => {
      const bounds = section.getBoundingClientRect();
      const initialDirection: LandingScrollDirection =
        bounds.top >= window.innerHeight ? "down" : "up";
      const viewport = resolveMotionViewport();
      const decision = landingSectionMotionDecision(
        bounds,
        viewport,
        section === initialSection,
      );

      if (decision === "show") {
        showSection(section, initialDirection, true);
      } else {
        hideSection(section, initialDirection, true);
      }
    });

    mainReadyFrame = window.requestAnimationFrame(() => {
      main.dataset.landingMotionReady = "true";
    });

    if (initialSection) publishActiveSection(initialSection, "initial");

    return () => {
      navigationMutationObserver.disconnect();
      layoutObserver.disconnect();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      window.removeEventListener("wheel", handleUserScrollIntent);
      window.removeEventListener("touchstart", handleUserScrollIntent);
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("keydown", handleUserNavigationKey);
      document.removeEventListener("click", handleAnchorNavigation);
      reducedMotion.removeEventListener("change", handleReducedMotionChange);
      window.cancelAnimationFrame(scrollFrame);
      window.cancelAnimationFrame(mainReadyFrame);
      window.cancelAnimationFrame(navigationSyncFrame);
      revealFrames.forEach((frame) => window.cancelAnimationFrame(frame));
      revealFrames.clear();
      motionStates.clear();
      main.style.overflowX = previousOverflowX;
      delete main.dataset.landingMotionReady;

      sections.forEach((section) => {
        section.inert = false;
        section.removeAttribute("aria-hidden");
        delete section.dataset.landingMotionState;
        section.style.removeProperty("--landing-motion-x");
        section.style.removeProperty("--landing-motion-y");
      });

      navigationAnchors.forEach((anchor) => {
        anchor.classList.remove(
          "landing-nav-active",
          "landing-nav-inactive",
        );
      });
    };
  }, []);

  return null;
}
