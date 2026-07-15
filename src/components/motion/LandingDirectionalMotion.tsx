"use client";

import { useEffect } from "react";
import {
  landingEnterOffset,
  landingExitOffset,
  landingSectionSide,
  type LandingScrollDirection,
} from "@/lib/motion/landing-flow";
import { loadGsapRuntime, type GsapTweenLike } from "@/lib/motion/gsap-runtime";

const LANDING_SECTION_SELECTOR = "main section[id]";

type SectionState = "hidden" | "visible" | "leaving";

export function LandingDirectionalMotion() {
  useEffect(() => {
    let disposed = false;
    let scrollFrameId = 0;
    let scrollDirection: LandingScrollDirection = "down";
    let lastScrollY = window.scrollY;
    let activeSection: HTMLElement | null = null;
    const tweens: GsapTweenLike[] = [];
    const animatedSections = new Set<HTMLElement>();

    async function initialize() {
      const main = document.querySelector<HTMLElement>("main");
      if (!main) return;

      const previousOverflowX = main.style.overflowX;
      main.style.overflowX = "clip";

      try {
        const { gsap } = await loadGsapRuntime();
        if (disposed) return;

        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const sections = Array.from(document.querySelectorAll<HTMLElement>(LANDING_SECTION_SELECTOR));
        const indexes = new Map(sections.map((section, index) => [section, index]));
        const states = new Map<HTMLElement, SectionState>();

        function sideFor(section: HTMLElement) {
          return landingSectionSide(section.id, indexes.get(section) ?? 0);
        }

        function remember(tween: GsapTweenLike) {
          tweens.push(tween);
          return tween;
        }

        function setHidden(section: HTMLElement, direction: LandingScrollDirection) {
          const side = sideFor(section);
          animatedSections.add(section);
          states.set(section, "hidden");
          gsap.set(section, {
            opacity: 0,
            x: landingEnterOffset(side, direction),
            y: 10,
            rotationY: side * 2.5,
            scale: 0.994,
            transformPerspective: 1400,
            transformOrigin: side < 0 ? "0% 50%" : "100% 50%",
            willChange: "transform, opacity",
          });
        }

        function showImmediately(section: HTMLElement) {
          animatedSections.add(section);
          states.set(section, "visible");
          gsap.set(section, {
            opacity: 1,
            x: 0,
            y: 0,
            rotationY: 0,
            scale: 1,
          });
        }

        function enter(section: HTMLElement, direction: LandingScrollDirection) {
          if (states.get(section) === "visible") return;

          const side = sideFor(section);
          const offset = landingEnterOffset(side, direction);
          animatedSections.add(section);
          states.set(section, "visible");

          if (reducedMotion) {
            showImmediately(section);
            return;
          }

          remember(
            gsap.fromTo(
              section,
              {
                opacity: 0,
                x: offset,
                y: 10,
                rotationY: (offset < 0 ? -1 : 1) * 3,
                scale: 0.994,
                transformPerspective: 1400,
                transformOrigin: offset < 0 ? "0% 50%" : "100% 50%",
                willChange: "transform, opacity",
              },
              {
                opacity: 1,
                x: 0,
                y: 0,
                rotationY: 0,
                scale: 1,
                duration: 0.78,
                ease: "power3.out",
                clearProps: "willChange",
                overwrite: "auto",
              },
            ),
          );
        }

        function leave(section: HTMLElement, direction: LandingScrollDirection) {
          if (states.get(section) !== "visible" || reducedMotion) return;

          const offset = landingExitOffset(sideFor(section), direction);
          animatedSections.add(section);
          states.set(section, "leaving");

          remember(
            gsap.to(section, {
              opacity: 0,
              x: offset,
              y: direction === "up" ? 8 : -8,
              rotationY: (offset < 0 ? -1 : 1) * 2.5,
              scale: 0.996,
              duration: 0.46,
              ease: "power2.inOut",
              overwrite: "auto",
              onComplete: () => {
                if (states.get(section) === "leaving") states.set(section, "hidden");
              },
            }),
          );
        }

        function updateScrollDirection() {
          if (scrollFrameId) return;
          scrollFrameId = window.requestAnimationFrame(() => {
            scrollFrameId = 0;
            const nextScrollY = window.scrollY;
            const delta = nextScrollY - lastScrollY;
            if (Math.abs(delta) > 2) scrollDirection = delta > 0 ? "down" : "up";
            lastScrollY = nextScrollY;
          });
        }

        function handleAnchorNavigation(event: MouseEvent) {
          const source = event.target;
          if (!(source instanceof Element)) return;
          const anchor = source.closest<HTMLAnchorElement>("a[href^='#']");
          const href = anchor?.getAttribute("href");
          if (!href || href.length < 2) return;

          const target = document.getElementById(decodeURIComponent(href.slice(1)));
          if (!target) return;

          const targetTop = target.getBoundingClientRect().top + window.scrollY;
          scrollDirection = targetTop > window.scrollY + 100 ? "down" : "up";
          event.preventDefault();
          window.history.replaceState(null, "", href);
          target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
        }

        if (reducedMotion) {
          sections.forEach(showImmediately);
          document.addEventListener("click", handleAnchorNavigation);
          return () => {
            document.removeEventListener("click", handleAnchorNavigation);
            main.style.overflowX = previousOverflowX;
          };
        }

        const observer = new IntersectionObserver(
          (entries) => {
            const entering = entries
              .filter((entry) => entry.isIntersecting)
              .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

            const nextEntry = entering[0];
            if (!nextEntry) return;

            const nextSection = nextEntry.target as HTMLElement;
            if (activeSection && activeSection !== nextSection) leave(activeSection, scrollDirection);
            enter(nextSection, scrollDirection);
            activeSection = nextSection;
          },
          {
            rootMargin: "-18% 0px -24% 0px",
            threshold: [0.08, 0.22, 0.42],
          },
        );

        sections.forEach((section) => {
          const bounds = section.getBoundingClientRect();
          const initiallyVisible = bounds.top < window.innerHeight * 0.82 && bounds.bottom > window.innerHeight * 0.18;
          if (initiallyVisible) {
            showImmediately(section);
            activeSection = section;
          } else {
            setHidden(section, "down");
          }
          observer.observe(section);
        });

        window.addEventListener("scroll", updateScrollDirection, { passive: true });
        document.addEventListener("click", handleAnchorNavigation);

        return () => {
          observer.disconnect();
          window.removeEventListener("scroll", updateScrollDirection);
          document.removeEventListener("click", handleAnchorNavigation);
          main.style.overflowX = previousOverflowX;
        };
      } catch (error) {
        main.style.overflowX = previousOverflowX;
        console.error("Landing directional motion failed to initialize", error);
      }
    }

    let runtimeCleanup: (() => void) | undefined;
    void initialize().then((cleanup) => {
      runtimeCleanup = cleanup;
      if (disposed) runtimeCleanup?.();
    });

    return () => {
      disposed = true;
      runtimeCleanup?.();
      window.cancelAnimationFrame(scrollFrameId);
      tweens.forEach((tween) => tween.kill());
      if (window.__KING_SPARKON_MOTION__) {
        animatedSections.forEach((section) => {
          window.__KING_SPARKON_MOTION__?.gsap.killTweensOf(section);
          window.__KING_SPARKON_MOTION__?.gsap.set(section, {
            clearProps: "transform,opacity,willChange",
          });
        });
      }
    };
  }, []);

  return null;
}
