"use client";

import { useEffect, useRef } from "react";
import type { LucideIcon } from "lucide-react";

export type BouncingCircleItem = {
  icon: LucideIcon;
  eyebrow?: string;
  title: string;
  copy: string;
  tags?: readonly string[];
};

type WaveVariant =
  | "vision"
  | "notes"
  | "stats"
  | "services"
  | "features"
  | "subscription";

type BouncingCircleFieldProps = {
  items: readonly BouncingCircleItem[];
  ariaLabel: string;
  variant?: WaveVariant;
  showConnector?: boolean;
  connectorOpacity?: number;
};

type Orientation = "horizontal" | "vertical";
type Point = { x: number; y: number };

type WaveMetrics = {
  orientation: Orientation;
  start: number;
  span: number;
  baseline: number;
  amplitude: number;
};

type VariantMotionConfig = {
  desktopDiameter: number;
  desktopMinimum: number;
  desktopHeight: number;
  mobileDiameter: number;
  mobileGap: number;
  horizontalAmplitude: number;
  verticalAmplitude: number;
};

const DESKTOP_BREAKPOINT = 1024;
const WAVE_CYCLES = 1.05;
const WAVE_SPEED = 0.2;
const FRAME_INTERVAL_MS = 1000 / 30;
const PATH_SEGMENTS = 42;
const DESKTOP_EDGE_PADDING = 76;
const CIRCLE_GAP = 14;

const motionConfig: Record<WaveVariant, VariantMotionConfig> = {
  vision: {
    desktopDiameter: 320,
    desktopMinimum: 220,
    desktopHeight: 620,
    mobileDiameter: 220,
    mobileGap: 126,
    horizontalAmplitude: 54,
    verticalAmplitude: 34,
  },
  notes: {
    desktopDiameter: 240,
    desktopMinimum: 176,
    desktopHeight: 500,
    mobileDiameter: 202,
    mobileGap: 112,
    horizontalAmplitude: 40,
    verticalAmplitude: 30,
  },
  stats: {
    desktopDiameter: 246,
    desktopMinimum: 176,
    desktopHeight: 520,
    mobileDiameter: 206,
    mobileGap: 114,
    horizontalAmplitude: 42,
    verticalAmplitude: 30,
  },
  services: {
    desktopDiameter: 230,
    desktopMinimum: 158,
    desktopHeight: 600,
    mobileDiameter: 204,
    mobileGap: 114,
    horizontalAmplitude: 46,
    verticalAmplitude: 30,
  },
  features: {
    desktopDiameter: 220,
    desktopMinimum: 146,
    desktopHeight: 680,
    mobileDiameter: 212,
    mobileGap: 120,
    horizontalAmplitude: 50,
    verticalAmplitude: 32,
  },
  subscription: {
    desktopDiameter: 176,
    desktopMinimum: 144,
    desktopHeight: 380,
    mobileDiameter: 174,
    mobileGap: 92,
    horizontalAmplitude: 24,
    verticalAmplitude: 22,
  },
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function resolveOrientation(): Orientation {
  return window.innerWidth >= DESKTOP_BREAKPOINT ? "horizontal" : "vertical";
}

function resolveDiameter(
  width: number,
  count: number,
  orientation: Orientation,
  config: VariantMotionConfig,
) {
  if (orientation === "vertical") {
    return clamp(
      Math.min(config.mobileDiameter, width - 64),
      146,
      config.mobileDiameter,
    );
  }

  if (count <= 1) return config.desktopDiameter;

  const collisionSafeMaximum =
    (width - DESKTOP_EDGE_PADDING - CIRCLE_GAP * (count - 1)) / count;
  const safeMinimum = Math.min(
    config.desktopMinimum,
    collisionSafeMaximum,
  );

  return clamp(
    collisionSafeMaximum,
    safeMinimum,
    config.desktopDiameter,
  );
}

function resolveStageHeight(
  diameter: number,
  count: number,
  orientation: Orientation,
  variant: WaveVariant,
  config: VariantMotionConfig,
) {
  if (orientation === "horizontal") return config.desktopHeight;
  const edgeRoom = diameter / 2 + (variant === "subscription" ? 30 : 48);
  return Math.ceil(
    edgeRoom * 2 + Math.max(0, count - 1) * (diameter + config.mobileGap),
  );
}

function createWaveMetrics(
  width: number,
  height: number,
  radius: number,
  orientation: Orientation,
  variant: WaveVariant,
  config: VariantMotionConfig,
): WaveMetrics {
  const edgeRoom = radius + (variant === "subscription" ? 24 : 38);

  if (orientation === "horizontal") {
    const availableHeight = Math.max(0, height - radius * 2 - 52);
    return {
      orientation,
      start: edgeRoom,
      span: Math.max(1, width - edgeRoom * 2),
      baseline: height / 2,
      amplitude: clamp(
        availableHeight * 0.2,
        variant === "subscription" ? 10 : 18,
        config.horizontalAmplitude,
      ),
    };
  }

  const availableWidth = Math.max(0, width - radius * 2 - 36);
  return {
    orientation,
    start: edgeRoom,
    span: Math.max(1, height - edgeRoom * 2),
    baseline: width / 2,
    amplitude: clamp(
      availableWidth * 0.24,
      variant === "subscription" ? 10 : 16,
      config.verticalAmplitude,
    ),
  };
}

function pointOnWave(
  metrics: WaveMetrics,
  progress: number,
  phase: number,
): Point {
  const waveOffset =
    Math.sin(progress * Math.PI * 2 * WAVE_CYCLES + phase) *
    metrics.amplitude;

  return metrics.orientation === "horizontal"
    ? {
        x: metrics.start + metrics.span * progress,
        y: metrics.baseline + waveOffset,
      }
    : {
        x: metrics.baseline + waveOffset,
        y: metrics.start + metrics.span * progress,
      };
}

function buildWavePath(metrics: WaveMetrics, phase: number) {
  return Array.from({ length: PATH_SEGMENTS + 1 }, (_, index) =>
    pointOnWave(metrics, index / PATH_SEGMENTS, phase),
  )
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`,
    )
    .join(" ");
}

function applyBubbleTypography(
  element: HTMLElement,
  diameter: number,
  variant: WaveVariant,
) {
  const isSubscription = variant === "subscription";
  const title = element.querySelector<HTMLElement>("[data-bubble-title]");
  const copy = element.querySelector<HTMLElement>("[data-bubble-copy]");
  const eyebrow = element.querySelector<HTMLElement>("[data-bubble-eyebrow]");
  const tags = element.querySelector<HTMLElement>("[data-bubble-tags]");
  const tagItems = tags
    ? Array.from(tags.querySelectorAll<HTMLElement>("span"))
    : [];

  const large = diameter >= 210;
  const medium = diameter >= 180;
  const titleSize = isSubscription
    ? medium
      ? 0.94
      : 0.84
    : large
      ? 1.02
      : medium
        ? 0.92
        : 0.82;
  const copySize = isSubscription
    ? medium
      ? 0.68
      : 0.61
    : large
      ? 0.74
      : medium
        ? 0.68
        : 0.6;
  const copyLineHeight = isSubscription
    ? medium
      ? 0.98
      : 0.88
    : large
      ? 1.08
      : medium
        ? 0.98
        : 0.88;
  const eyebrowSize = large ? 0.56 : medium ? 0.52 : 0.48;
  const tagSize = large ? 0.54 : medium ? 0.5 : 0.46;

  element.style.boxSizing = "border-box";
  element.style.overflow = "hidden";
  element.style.padding = isSubscription
    ? diameter >= 170
      ? "16px"
      : "13px"
    : large
      ? "24px"
      : medium
        ? "19px"
        : "15px";

  [title, copy, eyebrow, tags].forEach((node) => {
    if (!node) return;
    node.style.maxWidth = "86%";
    node.style.overflowWrap = "anywhere";
  });

  if (title) {
    title.style.marginTop = isSubscription ? "6px" : "7px";
    title.style.fontSize = `${titleSize}rem`;
    title.style.lineHeight = `${titleSize * 1.12}rem`;
  }
  if (copy) {
    copy.style.marginTop = "6px";
    copy.style.fontSize = `${copySize}rem`;
    copy.style.lineHeight = `${copyLineHeight}rem`;
  }
  if (eyebrow) {
    eyebrow.style.marginTop = isSubscription ? "7px" : "9px";
    eyebrow.style.fontSize = `${eyebrowSize}rem`;
  }
  if (tags) {
    tags.style.marginTop = "8px";
    tags.style.justifyContent = "center";
  }
  tagItems.forEach((tag) => {
    tag.style.fontSize = `${tagSize}rem`;
    tag.style.padding = large ? "3px 8px" : "2px 6px";
  });
}

export function BouncingCircleField({
  items,
  ariaLabel,
  variant = "stats",
  showConnector = true,
  connectorOpacity = 0.92,
}: BouncingCircleFieldProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const glowPathRef = useRef<SVGPathElement | null>(null);
  const linePathRef = useRef<SVGPathElement | null>(null);
  const bubbleRefs = useRef<Array<HTMLElement | null>>([]);
  const config = motionConfig[variant];
  const safeConnectorOpacity = clamp(connectorOpacity, 0, 1);
  const isSubscription = variant === "subscription";

  useEffect(() => {
    const stageElement = containerRef.current;
    const bubbles = bubbleRefs.current.slice(0, items.length);
    if (!stageElement || bubbles.some((bubble) => !bubble)) return;

    const stage = stageElement;
    const elements = bubbles as HTMLElement[];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let animationFrame = 0;
    let phase = 0.35;
    let lastPaintTime = performance.now();
    let layoutKey = "";
    let isNearViewport = false;
    let pageIsVisible = document.visibilityState === "visible";

    function renderScene(currentPhase: number) {
      const width = stage.clientWidth;
      if (!width) return;

      const orientation = resolveOrientation();
      const diameter = resolveDiameter(
        width,
        items.length,
        orientation,
        config,
      );
      const stageHeight = resolveStageHeight(
        diameter,
        items.length,
        orientation,
        variant,
        config,
      );
      const nextLayoutKey = `${Math.round(width)}:${orientation}:${Math.round(diameter)}:${stageHeight}`;

      if (nextLayoutKey !== layoutKey) {
        layoutKey = nextLayoutKey;
        stage.style.height = `${stageHeight}px`;
        stage.style.minHeight = `${stageHeight}px`;
        elements.forEach((element) => {
          element.style.width = `${diameter}px`;
          element.style.height = `${diameter}px`;
          applyBubbleTypography(element, diameter, variant);
        });
      }

      const radius = diameter / 2;
      const metrics = createWaveMetrics(
        width,
        stageHeight,
        radius,
        orientation,
        variant,
        config,
      );
      const anchors = items.map((_, index) =>
        pointOnWave(
          metrics,
          items.length <= 1 ? 0.5 : index / (items.length - 1),
          currentPhase,
        ),
      );
      const path = buildWavePath(metrics, currentPhase);

      stage.dataset.waveOrientation = orientation;
      svgRef.current?.setAttribute("viewBox", `0 0 ${width} ${stageHeight}`);
      glowPathRef.current?.setAttribute("d", path);
      linePathRef.current?.setAttribute("d", path);
      if (linePathRef.current) {
        linePathRef.current.style.strokeDashoffset = `${-currentPhase * 24}px`;
      }

      anchors.forEach((anchor, index) => {
        const drift = Math.sin(currentPhase * 1.15 + index * 1.37) * 4;
        const crossDrift = Math.cos(currentPhase * 0.8 + index * 0.91) * 3;
        const x = orientation === "horizontal"
          ? anchor.x + crossDrift
          : anchor.x + drift;
        const y = orientation === "horizontal"
          ? anchor.y + drift
          : anchor.y + crossDrift;

        elements[index].style.transform = `translate3d(${x - radius}px, ${y - radius}px, 0)`;
      });
    }

    function shouldAnimate() {
      return isNearViewport && pageIsVisible && !reducedMotion.matches;
    }

    function animate(now: number) {
      if (!shouldAnimate()) {
        animationFrame = 0;
        stage.dataset.waveMotion = "paused";
        return;
      }

      const elapsed = now - lastPaintTime;
      if (elapsed >= FRAME_INTERVAL_MS) {
        phase += Math.min(elapsed / 1000, 0.08) * WAVE_SPEED;
        lastPaintTime = now;
        renderScene(phase);
      }

      animationFrame = window.requestAnimationFrame(animate);
    }

    function syncMotion() {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      renderScene(phase);
      stage.dataset.waveMotion = shouldAnimate() ? "running" : "paused";

      if (shouldAnimate()) {
        lastPaintTime = performance.now();
        animationFrame = window.requestAnimationFrame(animate);
      }
    }

    function handleVisibilityChange() {
      pageIsVisible = document.visibilityState === "visible";
      syncMotion();
    }

    const resizeObserver = new ResizeObserver(syncMotion);
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isNearViewport = entry?.isIntersecting ?? false;
        syncMotion();
      },
      {
        rootMargin: "180px 0px",
        threshold: 0.01,
      },
    );

    resizeObserver.observe(stage);
    visibilityObserver.observe(stage);
    reducedMotion.addEventListener("change", syncMotion);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("resize", syncMotion, { passive: true });
    syncMotion();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      reducedMotion.removeEventListener("change", syncMotion);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("resize", syncMotion);
      delete stage.dataset.waveOrientation;
      delete stage.dataset.waveMotion;
      stage.style.removeProperty("height");
      stage.style.removeProperty("min-height");
      elements.forEach((element) => {
        element.style.removeProperty("width");
        element.style.removeProperty("height");
        element.style.removeProperty("transform");
      });
    };
  }, [config, items, variant]);

  return (
    <div
      ref={containerRef}
      className="relative mt-8 overflow-hidden border-y border-[var(--line)] bg-white"
      aria-label={ariaLabel}
      data-wave-connector={showConnector ? "visible" : "hidden"}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,var(--signal-soft),transparent_70%)] opacity-60"
        aria-hidden="true"
      />
      <svg
        ref={svgRef}
        className="pointer-events-none absolute inset-0 z-[2] h-full w-full"
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <path
          ref={glowPathRef}
          fill="none"
          stroke="var(--signal)"
          strokeWidth={isSubscription ? "10" : "13"}
          strokeLinecap="round"
          opacity={showConnector ? safeConnectorOpacity * 0.13 : 0}
          vectorEffect="non-scaling-stroke"
        />
        <path
          ref={linePathRef}
          fill="none"
          stroke="var(--signal)"
          strokeWidth={isSubscription ? "3.5" : "4.25"}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={isSubscription ? "17 11" : "21 12"}
          opacity={showConnector ? safeConnectorOpacity : 0}
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {items.map(({ icon: Icon, eyebrow, title, copy, tags }, index) => (
        <article
          key={title}
          ref={(element: HTMLElement | null) => {
            bubbleRefs.current[index] = element;
          }}
          className="absolute left-0 top-0 z-10 flex aspect-square min-h-0 transform-gpu flex-col items-center justify-center rounded-full border border-[var(--line-strong)] bg-white text-center shadow-[0_18px_45px_rgba(14,165,233,0.13)] [backface-visibility:hidden]"
        >
          <div
            className={`grid shrink-0 place-items-center rounded-full border border-[var(--line)] bg-[var(--signal-soft)] text-[var(--signal)] ${isSubscription ? "h-10 w-10" : "h-11 w-11 sm:h-12 sm:w-12"}`}
          >
            <Icon className={isSubscription ? "h-4 w-4" : "h-5 w-5"} />
          </div>
          <p
            data-bubble-eyebrow
            className="font-extrabold uppercase tracking-[0.1em] text-[var(--signal-strong)]"
          >
            {eyebrow ?? `0${index + 1}`}
          </p>
          <h3
            data-bubble-title
            className="text-balance font-black leading-tight tracking-[-0.03em] text-[var(--ink)]"
          >
            {title}
          </h3>
          <p
            data-bubble-copy
            className="text-balance text-[var(--steel)]"
          >
            {copy}
          </p>
          {tags?.length ? (
            <div
              data-bubble-tags
              className="flex flex-wrap justify-center gap-1"
            >
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[var(--line)] bg-[var(--signal-soft)] font-extrabold text-[var(--signal-strong)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}
