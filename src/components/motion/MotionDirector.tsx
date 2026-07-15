"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  loadGsapRuntime,
  type GsapRuntime,
  type GsapTweenLike,
} from "@/lib/motion/gsap-runtime";

const LANDING_SECTION_SELECTOR = "main section[id]";
const DASHBOARD_ACTION_SELECTOR =
  "button:not([disabled]), a[href^='/dashboard/'], [role='button']:not([aria-disabled='true'])";

function landingTargetFromHref(href: string) {
  if (!href.startsWith("#") || href.length < 2) return null;
  return document.getElementById(decodeURIComponent(href.slice(1)));
}

function sectionLabelFromAnchor(anchor: HTMLAnchorElement) {
  return anchor.textContent?.trim() || anchor.getAttribute("href")?.replace("#", "") || "Section";
}

function uniqueElements(elements: HTMLElement[]) {
  return Array.from(new Set(elements));
}

function createDashboardBurst(gsap: GsapRuntime, target: HTMLElement) {
  const bounds = target.getBoundingClientRect();
  const burst = document.createElement("span");
  burst.className = "dashboard-motion-burst";
  burst.setAttribute("aria-hidden", "true");
  burst.style.left = `${bounds.left + bounds.width / 2}px`;
  burst.style.top = `${bounds.top + bounds.height / 2}px`;
  document.body.appendChild(burst);

  const timeline = gsap.timeline();
  timeline
    .fromTo(
      burst,
      {
        opacity: 0,
        scale: 0.28,
        rotationX: 72,
        rotationZ: -28,
      },
      {
        opacity: 1,
        scale: 1,
        rotationX: 0,
        rotationZ: 0,
        duration: 0.24,
        ease: "power2.out",
      },
    )
    .to(burst, {
      opacity: 0,
      scale: 1.9,
      rotationZ: 30,
      duration: 0.5,
      ease: "power2.in",
      onComplete: () => burst.remove(),
    });

  return {
    timeline,
    cleanup: () => burst.remove(),
  };
}

export function MotionDirector() {
  const pathname = usePathname();
  const indicatorRef = useRef<HTMLDivElement>(null);
  const [activeSectionLabel, setActiveSectionLabel] = useState<string | null>(null);

  useEffect(() => {
    let disposed = false;
    let frameId = 0;
    const cleanupCallbacks: Array<() => void> = [];
    const tweens: GsapTweenLike[] = [];
    const animatedElements = new Set<HTMLElement>();

    function registerTween(tween: GsapTweenLike) {
      tweens.push(tween);
      return tween;
    }

    function registerElement(element: HTMLElement) {
      animatedElements.add(element);
      return element;
    }

    async function initializeMotion() {
      try {
        const { gsap } = await loadGsapRuntime();
        if (disposed) return;

        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const isLanding = pathname === "/";
        const isDashboard = pathname.startsWith("/dashboard");

        if (isLanding) {
          const sections = Array.from(document.querySelectorAll<HTMLElement>(LANDING_SECTION_SELECTOR));
          const revealed = new WeakSet<HTMLElement>();

          function revealSection(section: HTMLElement, emphasize = false) {
            if (!revealed.has(section)) revealed.add(section);
            registerElement(section);

            registerTween(
              gsap.to(section, {
                opacity: 1,
                y: 0,
                rotationX: 0,
                rotationY: 0,
                scale: 1,
                duration: reducedMotion ? 0 : emphasize ? 0.72 : 1.02,
                ease: emphasize ? "back.out(1.35)" : "power3.out",
                clearProps: "willChange",
                overwrite: "auto",
              }),
            );

            const detailElements = uniqueElements(
              Array.from(
                section.querySelectorAll<HTMLElement>(
                  "article, form, [data-motion-card], [class*='capacity-card-3d'], [class*='contact-card-3d']",
                ),
              ).slice(0, 12),
            );

            if (detailElements.length > 0 && !reducedMotion) {
              detailElements.forEach(registerElement);
              registerTween(
                gsap.fromTo(
                  detailElements,
                  {
                    opacity: 0.72,
                    y: 22,
                    rotationY: -3,
                    scale: 0.985,
                    transformPerspective: 1000,
                  },
                  {
                    opacity: 1,
                    y: 0,
                    rotationY: 0,
                    scale: 1,
                    duration: 0.72,
                    ease: "power2.out",
                    stagger: 0.055,
                    overwrite: "auto",
                  },
                ),
              );
            }
          }

          const observer = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const section = entry.target as HTMLElement;
                revealSection(section);
                observer.unobserve(section);
              });
            },
            { rootMargin: "0px 0px -13% 0px", threshold: 0.12 },
          );

          sections.forEach((section) => {
            const isInitiallyVisible = section.getBoundingClientRect().top < window.innerHeight * 0.86;
            if (reducedMotion || isInitiallyVisible) {
              revealSection(section);
              return;
            }

            gsap.set(section, {
              opacity: 0,
              y: 68,
              rotationX: 8,
              rotationY: -1.5,
              scale: 0.985,
              transformPerspective: 1200,
              transformOrigin: "50% 0%",
              willChange: "transform, opacity",
            });
            observer.observe(section);
          });

          const hero = document.querySelector<HTMLElement>("main > section:first-child");
          if (hero && !reducedMotion) {
            const heroColumns = Array.from(hero.querySelectorAll<HTMLElement>(":scope > div:last-child > div"));
            if (heroColumns.length > 0) {
              heroColumns.forEach(registerElement);
              registerTween(
                gsap.fromTo(
                  heroColumns,
                  {
                    opacity: 0,
                    y: 28,
                    rotationY: -4,
                    scale: 0.985,
                    transformPerspective: 1100,
                  },
                  {
                    opacity: 1,
                    y: 0,
                    rotationY: 0,
                    scale: 1,
                    duration: 0.95,
                    ease: "power3.out",
                    stagger: 0.12,
                  },
                ),
              );
            }
          }

          let lastActiveHref = "";
          function syncActiveLandingNavigation() {
            const activeAnchor = document.querySelector<HTMLAnchorElement>(
              "header a[aria-current='location'][href^='#']",
            );
            if (!activeAnchor) return;

            const href = activeAnchor.getAttribute("href") ?? "";
            if (!href || href === lastActiveHref) return;
            lastActiveHref = href;
            setActiveSectionLabel(sectionLabelFromAnchor(activeAnchor));
            registerElement(activeAnchor);

            if (!reducedMotion) {
              registerTween(
                gsap.fromTo(
                  activeAnchor,
                  {
                    scale: 0.84,
                    rotationX: -16,
                    y: 4,
                    transformPerspective: 700,
                  },
                  {
                    scale: 1,
                    rotationX: 0,
                    y: 0,
                    duration: 0.48,
                    ease: "back.out(1.8)",
                    overwrite: "auto",
                  },
                ),
              );
            }

            const section = landingTargetFromHref(href);
            if (section) {
              section.classList.add("motion-section-current");
              sections.filter((item) => item !== section).forEach((item) => item.classList.remove("motion-section-current"));
              if (!reducedMotion) revealSection(section, true);
            }
          }

          const navigationRoot = document.querySelector("header");
          const navigationObserver = new MutationObserver(syncActiveLandingNavigation);
          if (navigationRoot) {
            navigationObserver.observe(navigationRoot, {
              attributes: true,
              subtree: true,
              attributeFilter: ["aria-current"],
            });
          }
          syncActiveLandingNavigation();

          function handleLandingNavigation(event: MouseEvent) {
            const source = event.target;
            if (!(source instanceof Element)) return;
            const anchor = source.closest<HTMLAnchorElement>("a[href^='#']");
            if (!anchor) return;

            const href = anchor.getAttribute("href") ?? "";
            const target = landingTargetFromHref(href);
            if (!target) return;

            event.preventDefault();
            setActiveSectionLabel(sectionLabelFromAnchor(anchor));
            window.history.replaceState(null, "", href);
            target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });

            if (!reducedMotion) {
              registerTween(
                gsap.fromTo(
                  target,
                  {
                    rotationY: -2.4,
                    scale: 0.992,
                    transformPerspective: 1200,
                  },
                  {
                    rotationY: 0,
                    scale: 1,
                    duration: 0.84,
                    ease: "power3.out",
                    delay: 0.18,
                    overwrite: "auto",
                  },
                ),
              );
            }
          }

          document.addEventListener("click", handleLandingNavigation);
          cleanupCallbacks.push(
            () => observer.disconnect(),
            () => navigationObserver.disconnect(),
            () => document.removeEventListener("click", handleLandingNavigation),
            () => sections.forEach((section) => section.classList.remove("motion-section-current")),
          );
        } else {
          setActiveSectionLabel(null);
        }

        if (isDashboard) {
          frameId = window.requestAnimationFrame(() => {
            const main = document.querySelector<HTMLElement>("main");
            if (!main) return;

            const dashboardSurfaces = uniqueElements([
              ...Array.from(main.children).filter((child): child is HTMLElement => child instanceof HTMLElement),
              ...Array.from(main.querySelectorAll<HTMLElement>("section, article")).slice(0, 18),
            ]);

            dashboardSurfaces.forEach(registerElement);
            if (!reducedMotion && dashboardSurfaces.length > 0) {
              registerTween(
                gsap.fromTo(
                  dashboardSurfaces,
                  {
                    opacity: 0,
                    y: 24,
                    rotationX: 5,
                    scale: 0.992,
                    transformPerspective: 1000,
                    transformOrigin: "50% 0%",
                  },
                  {
                    opacity: 1,
                    y: 0,
                    rotationX: 0,
                    scale: 1,
                    duration: 0.62,
                    ease: "power3.out",
                    stagger: 0.035,
                    clearProps: "transform,opacity",
                  },
                ),
              );
            }
          });

          function actionTarget(event: Event) {
            const source = event.target;
            if (!(source instanceof Element)) return null;
            const target = source.closest<HTMLElement>(DASHBOARD_ACTION_SELECTOR);
            if (!target || !target.closest("main")) return null;
            return target;
          }

          function handlePointerDown(event: PointerEvent) {
            const target = actionTarget(event);
            if (!target || reducedMotion) return;
            registerElement(target);
            registerTween(
              gsap.to(target, {
                scale: 0.965,
                rotationX: -7,
                y: 2,
                transformPerspective: 700,
                duration: 0.12,
                ease: "power1.out",
                overwrite: "auto",
              }),
            );
          }

          function handleAction(event: Event) {
            const target = actionTarget(event);
            if (!target) return;
            registerElement(target);

            if (!reducedMotion) {
              registerTween(
                gsap.to(target, {
                  scale: 1,
                  rotationX: 0,
                  rotationY: 0,
                  y: 0,
                  duration: 0.42,
                  ease: "back.out(1.9)",
                  overwrite: "auto",
                }),
              );

              const burst = createDashboardBurst(gsap, target);
              registerTween(burst.timeline);
              cleanupCallbacks.push(burst.cleanup);
            }
          }

          function handleSubmit(event: SubmitEvent) {
            const form = event.target;
            if (!(form instanceof HTMLFormElement)) return;
            const submitter = event.submitter;
            const target = submitter instanceof HTMLElement
              ? submitter
              : form.querySelector<HTMLElement>("button[type='submit'], input[type='submit']");
            if (!target) return;

            if (!reducedMotion) {
              const burst = createDashboardBurst(gsap, target);
              registerTween(burst.timeline);
              cleanupCallbacks.push(burst.cleanup);
            }
          }

          const busyObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              const target = mutation.target;
              if (!(target instanceof HTMLElement)) return;
              const isBusy = target.getAttribute("aria-busy") === "true" || target.hasAttribute("disabled");
              if (!isBusy || reducedMotion) return;

              registerElement(target);
              registerTween(
                gsap.fromTo(
                  target,
                  { rotationY: -5, scale: 0.985 },
                  {
                    rotationY: 5,
                    scale: 1,
                    duration: 0.3,
                    ease: "power2.inOut",
                    repeat: 1,
                    yoyo: true,
                    overwrite: "auto",
                  },
                ),
              );
            });
          });

          busyObserver.observe(document.body, {
            attributes: true,
            subtree: true,
            attributeFilter: ["disabled", "aria-busy"],
          });

          document.addEventListener("pointerdown", handlePointerDown);
          document.addEventListener("click", handleAction);
          document.addEventListener("submit", handleSubmit);
          cleanupCallbacks.push(
            () => busyObserver.disconnect(),
            () => document.removeEventListener("pointerdown", handlePointerDown),
            () => document.removeEventListener("click", handleAction),
            () => document.removeEventListener("submit", handleSubmit),
          );
        }
      } catch (error) {
        console.error("King Sparkon motion runtime failed to initialize", error);
      }
    }

    void initializeMotion();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      cleanupCallbacks.forEach((cleanup) => cleanup());
      tweens.forEach((tween) => tween.kill());
      if (window.__KING_SPARKON_MOTION__) {
        animatedElements.forEach((element) => window.__KING_SPARKON_MOTION__?.gsap.killTweensOf(element));
      }
    };
  }, [pathname]);

  return activeSectionLabel ? (
    <div
      ref={indicatorRef}
      key={activeSectionLabel}
      className="motion-section-indicator"
      aria-live="polite"
    >
      <span>Viewing</span>
      <strong>{activeSectionLabel}</strong>
    </div>
  ) : null;
}
