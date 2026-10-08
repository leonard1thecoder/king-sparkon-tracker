"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type ViewState = "pending" | "hidden" | "shown";

/*
 * Scroll-triggered state. "pending" is the server render and first client
 * paint, so content is never hidden before JavaScript runs. "hidden" applies
 * only after mount and before the element enters the viewport. Once shown, the
 * state stays shown.
 */
function useInView<T extends HTMLElement>(threshold: number) {
  const ref = useRef<T>(null);
  const [state, setState] = useState<ViewState>("pending");

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (typeof IntersectionObserver === "undefined") {
      setState("shown");
      return;
    }
    setState("hidden");
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setState("shown");
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -6% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, state };
}

export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const { ref, state } = useInView<HTMLDivElement>(0.2);
  return (
    <div ref={ref} className={`ks-reveal ${className}`} data-state={state === "pending" ? undefined : state}>
      {children}
    </div>
  );
}

export function Scene({ children, className = "" }: { children: ReactNode; className?: string }) {
  const { ref, state } = useInView<HTMLDivElement>(0.3);
  return (
    <div ref={ref} className={`ks-scene ${className}`} data-state={state === "pending" ? undefined : state}>
      {children}
    </div>
  );
}
