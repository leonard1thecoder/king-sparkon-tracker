"use client";

import { usePathname } from "next/navigation";
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

function motionSurface(section: HTMLElement) {
  return section.querySelector<HTMLElement>(":scope > div") ?? section;
}

export function LandingDirectionalMotion() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;

    let disposed = false;
    let scrollFrameId = 0;
    let scrollDirection: LandingScrollDirection = "down";
    let lastScrollY = window.scrollY;
    const tweens: GsapTweenLike[] = [];
    const surfaces = new Set<HTMLElement>();
    const previousOverflowX = document.documentElement.style.overflowX;
    document.documentElement.style.overflowX = "clip";

    async function initialize() {
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

        function hide(section: HTMLElement, direction: LandingScrollDirection) {
          const surface = motionSurface(section);
          const side = sideFor(section);
          surfaces.add(surface);
          states.set(section, "hidden");
          gsap.set(surface, {
            opacity: 0,
            x: landingEnterOffset(side, direction),
            y: 16,
            rotationX: 2.5,
            rotationY: side * 7,
            scale: 0.988,
            transformPerspective: 1200,
            transformOrigin: side < 0 ? "0% 50%" : "100% 50%",
            willChange: "transform, opacity",
          });
        }

        function enter(section: HTMLElement, direction: LandingScrollDirection) {
          if (states.get(section) === "visible") return;

          const surface = motionSurface(section);
          const side = sideFor(section);
          const offset = landingEnterOffset(side, direction);
          surfaces.add(surface);
          states.set(section, "visible");

          if (reducedMotion) {
            gsap.set(surface, { opacity: 1, x: 0, y: 0, rotationX: 0, rotationY: 0, scale: 1 });
            return;
          }

          remember(
            gsap.fromTo(
              surface,
              {
                opacity: 0,
                x: offset,
                y: 16,
                rotationX: 2.5,
                rotationY: (offset < 0 ? -1 : 1) * 8,
                scale: 0.985,
                transformPerspective: 1200,
                transformOrigin: offset < 0 ? "0% 50%" : "100% 50%",
                willChange: "transform, opacity",
              },
              {
                opacity: 1,
                x: 0,
                y: 0,
                rotationX: 0,
                rotationY: 0,
                scale: 1,
                duration: 0.92,
                ease: "power3.out",
                clearProps: "willChange",
                overwrite: "auto",
              },
            ),
          );
        }

        function exit(section: HTMLElement, direction: LandingScrollDirection) {
          if (states.get(section) !== "visible" || reducedMotion) return;

          const surface = motionSurface(section);
          const offset = landingExitOffset(sideFor(section), direction);
          surfaces.add(surface);
          states.set(section, "leaving");

          remember(
            gsap.to(surface, {
              opacity: 0,
              x: offset,
              y: direction === "up" ? 12 : -12,
              rotationX: direction === "up" ? -2 : 2,
              rotationY: (offset < 0 ? -1 : 1) * 7,
              scale: 0.99,
              duration: 0.58,
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

        function captureNavigationIntent(event: MouseEvent) {
          const source = event.target;
          if (!(source instanceof Element)) return;
          const anchor = source.closest<HTMLAnchorElement>("a[href^='#']");
          const href = anchor?.getAttribute("href");
          if (!href || href.length < 2) return;
          const target = document.getElementById(decodeURIComponent(href.slice(1)));
          if (!target) return;
          const targetTop = target.getBoundingClientRect().top + window.scrollY;
          scrollDirection = targetTop > window.scrollY + 120 ? "down" : "up";
        }

        if (reducedMotion) {
          sections.forEach((section) => enter(section, "down"));
          return;
        }

        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              const section = entry.target as HTMLElement;
              if (entry.isIntersecting) enter(section, scrollDirection);
              else exit(section, scrollDirection);
            });
          },
          {
            rootMargin: "-20% 0px -25% 0px",
            threshold: [0, 0.08, 0.24],
          },
        );

        sections.forEach((section) => {
          const bounds = section.getBoundingClientRect();
          const initiallyVisible = bounds.top < window.innerHeight * 0.8 && bounds.bottom > window.innerHeight * 0.2;
          if (initiallyVisible) {
            states.set(section, "visible");
            gsap.set(motionSurface(section), { opacity: 1, x: 0, y: 0, rotationX: 0, rotationY: 0, scale: 1 });
          } else {
            hide(section, "down");
          }
          observer.observe(section);
        });

        window.addEventListener("scroll", updateScrollDirection, { passive: true });
        document.addEventListener("click", captureNavigationIntent, true);

        return () => {
          observer.disconnect();
          window.removeEventListener("scroll", updateScrollDirection);
          document.removeEventListener("click", captureNavigationIntent, true);
        };
      } catch (error) {
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
        surfaces.forEach((surface) => {
          window.__KING_SPARKON_MOTION__?.gsap.killTweensOf(surface);
          window.__KING_SPARKON_MOTION__?.gsap.set(surface, {
            clearProps: "transform,opacity,willChange",
          });
        });
      }
      document.documentElement.style.overflowX = previousOverflowX;
    };
  }, [pathname]);

  return null;
}
