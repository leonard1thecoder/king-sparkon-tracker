"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type AnimatedStatProps = {
  end: number;
  prefix?: string;
  suffix?: string;
  compact?: boolean;
  durationMs?: number;
  className?: string;
};

function formatValue(value: number, compact: boolean) {
  if (!compact) {
    return new Intl.NumberFormat("en-ZA").format(Math.round(value));
  }

  if (value >= 1_000_000) {
    return `${Math.round(value / 100_000) / 10}m`;
  }

  if (value >= 1_000) {
    return `${Math.round(value / 100) / 10}k`;
  }

  return String(Math.round(value));
}

export function AnimatedStat({ end, prefix = "", suffix = "", compact = false, durationMs = 1300, className }: AnimatedStatProps) {
  const [value, setValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLSpanElement | null>(null);
  const displayValue = useMemo(() => `${prefix}${formatValue(value, compact)}${suffix}`, [compact, prefix, suffix, value]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAnimated) return;

        setHasAnimated(true);
        const startedAt = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - startedAt) / durationMs, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setValue(end * eased);

          if (progress < 1) {
            requestAnimationFrame(tick);
          }
        };

        requestAnimationFrame(tick);
        observer.disconnect();
      },
      { threshold: 0.32 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [durationMs, end, hasAnimated]);

  return (
    <span ref={elementRef} className={className} aria-label={`${prefix}${formatValue(end, compact)}${suffix}`}>
      {displayValue}
    </span>
  );
}
