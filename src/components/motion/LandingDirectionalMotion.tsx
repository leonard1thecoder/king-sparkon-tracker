"use client";

import { useEffect } from "react";
import {
  landingEnterOffset,
  landingSectionSide,
  type LandingScrollDirection,
} from "@/lib/motion/landing-flow";

const LANDING_SECTION_SELECTOR = "main section[id]";
const SECTION_NAV_SELECTOR = "header [aria-label='Section navigation'] a[href^='#']";
const SECTION_CHANGE_EVENT = "king-sparkon:landing-section-change";
const ENTRY_DURATION_MS = 1050;
const ENTRY_EASING = "cubic-bezier(0.16, 1, 0.3, 1)";

type SectionChangeSource = "scroll" | "navigation" | "initial";

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
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const revealed = new WeakSet<HTMLElement>();
    const runningAnimations = new Map<HTMLElement, Animation>();
    const previousOverflowX = main.style.overflowX;

    let scrollFrame = 0;
    let lastScrollY = window.scrollY;
    let scrollDirection: LandingScrollDirection = "down";
    let activeHref = "";
    let navigationSyncFrame = 0;

    main.style.overflowX = "clip";

    function sideFor(section: HTMLElement) {
      return landingSectionSide(
        section.id,
        sectionIndexes.get(section) ?? 0,
      );
    }

    function reveal(
      section: HTMLElement,
      direction: LandingScrollDirection,
    ) {
      if (revealed.has(section)) return;
      revealed.add(section);
      section.dataset.landingRevealed = "true";

      if (reducedMotion.matches) return;

      runningAnimations.get(section)?.cancel();
      const offset = landingEnterOffset(sideFor(section), direction);
      const animation = section.animate(
        [
          {
            opacity: 0.38,
            transform: `translate3d(${offset}px, 12px, 0)`,
          },
          {
            opacity: 1,
            transform: "translate3d(0, 0, 0)",
          },
        ],
        {
          duration: ENTRY_DURATION_MS,
          easing: ENTRY_EASING,
          fill: "both",
        },
      );

      runningAnimations.set(section, animation);
      animation.addEventListener(
        "finish",
        () => {
          runningAnimations.delete(section);
          animation.cancel();
        },
        { once: true },
      );
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
      if (href === activeHref && source === "scroll") return;
      activeHref = href;
      applyNavigationState(href);
      window.dispatchEvent(
        new CustomEvent(SECTION_CHANGE_EVENT, {
          detail: { href, source },
        }),
      );
    }

    function resolveActiveSection() {
      const candidates = navigableSections.length > 0
        ? navigableSections
        : sections;
      const marker = window.innerHeight * 0.32;
      let nearest = candidates[0];
      let nearestDistance = Number.POSITIVE_INFINITY;

      for (const section of candidates) {
        const bounds = section.getBoundingClientRect();
        if (bounds.top <= marker && bounds.bottom >= marker) return section;

        const distance = Math.min(
          Math.abs(bounds.top - marker),
          Math.abs(bounds.bottom - marker),
        );
        if (distance < nearestDistance) {
          nearest = section;
          nearestDistance = distance;
        }
      }

      return nearest;
    }

    function updateScrollState() {
      scrollFrame = 0;
      const nextScrollY = window.scrollY;
      const delta = nextScrollY - lastScrollY;
      if (Math.abs(delta) > 2) {
        scrollDirection = delta > 0 ? "down" : "up";
      }
      lastScrollY = nextScrollY;

      const activeSection = resolveActiveSection();
      if (activeSection) {
        reveal(activeSection, scrollDirection);
        publishActiveSection(activeSection, "scroll");
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
      reveal(target, scrollDirection);
      publishActiveSection(target, "navigation");

      event.preventDefault();
      window.history.replaceState(null, "", sectionHref(target));
      target.scrollIntoView({
        behavior: reducedMotion.matches ? "auto" : "smooth",
        block: "start",
      });
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          reveal(entry.target as HTMLElement, scrollDirection);
        });
      },
      {
        rootMargin: "14% 0px 14% 0px",
        threshold: 0.04,
      },
    );

    sections.forEach((section) => revealObserver.observe(section));

    const navigationRoot = document.querySelector("header");
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

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    document.addEventListener("click", handleAnchorNavigation);

    const initialHashTarget = window.location.hash
      ? document.getElementById(
          decodeURIComponent(window.location.hash.slice(1)),
        )
      : null;
    const initialSection = initialHashTarget ?? resolveActiveSection();
    if (initialSection) {
      reveal(initialSection, "down");
      publishActiveSection(initialSection, "initial");
    }

    return () => {
      revealObserver.disconnect();
      navigationMutationObserver.disconnect();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      document.removeEventListener("click", handleAnchorNavigation);
      window.cancelAnimationFrame(scrollFrame);
      window.cancelAnimationFrame(navigationSyncFrame);
      runningAnimations.forEach((animation) => animation.cancel());
      runningAnimations.clear();
      main.style.overflowX = previousOverflowX;
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
