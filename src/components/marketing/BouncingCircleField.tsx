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

type BouncingCircleFieldProps = {
  items: readonly BouncingCircleItem[];
  ariaLabel: string;
  variant?: "vision" | "notes" | "stats" | "services" | "features";
  showConnector?: boolean;
  connectorOpacity?: number;
};

type Orientation = "horizontal" | "vertical";

type WaveMetrics = {
  orientation: Orientation;
  start: number;
  span: number;
  baseline: number;
  amplitude: number;
};

const DESKTOP_BREAKPOINT = 1024;
const WAVE_CYCLES = 1.15;
const WAVE_SPEED = 0.55;

const variantClasses = {
  vision: {
    stage: "min-h-[44rem] lg:min-h-[34rem]",
    bubble: "w-[clamp(10rem,28vw,19rem)] p-6 sm:p-8",
  },
  notes: {
    stage: "min-h-[38rem] lg:min-h-[28rem]",
    bubble: "w-[clamp(8.5rem,25vw,13.5rem)] p-5 sm:p-6",
  },
  stats: {
    stage: "min-h-[48rem] lg:min-h-[31rem]",
    bubble: "w-[clamp(8.5rem,22vw,14rem)] p-5 sm:p-6",
  },
  services: {
    stage: "min-h-[68rem] lg:min-h-[38rem]",
    bubble: "w-[clamp(8.5rem,17vw,13rem)] p-5 sm:p-6",
  },
  features: {
    stage: "min-h-[80rem] lg:min-h-[46rem]",
    bubble: "w-[clamp(9.5rem,15vw,12rem)] p-4 sm:p-5",
  },
} as const;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function createWaveMetrics(
  width: number,
  height: number,
  radius: number,
): WaveMetrics {
  const orientation: Orientation =
    width >= DESKTOP_BREAKPOINT ? "horizontal" : "vertical";
  const padding = radius + 24;

  if (orientation === "horizontal") {
    const availableHeight = Math.max(0, height - radius * 2 - 64);
    return {
      orientation,
      start: padding,
      span: Math.max(1, width - padding * 2),
      baseline: height / 2,
      amplitude: clamp(availableHeight * 0.18, 18, 52),
    };
  }

  const availableWidth = Math.max(0, width - radius * 2 - 48);
  return {
    orientation,
    start: padding,
    span: Math.max(1, height - padding * 2),
    baseline: width / 2,
    amplitude: clamp(availableWidth * 0.22, 16, 42),
  };
}

function pointOnWave(metrics: WaveMetrics, progress: number, phase: number) {
  const waveOffset =
    Math.sin(progress * Math.PI * 2 * WAVE_CYCLES + phase) * metrics.amplitude;

  if (metrics.orientation === "horizontal") {
    return {
      x: metrics.start + metrics.span * progress,
      y: metrics.baseline + waveOffset,
    };
  }

  return {
    x: metrics.baseline + waveOffset,
    y: metrics.start + metrics.span * progress,
  };
}

function buildWavePath(metrics: WaveMetrics, phase: number) {
  const segments = 80;
  const points = Array.from({ length: segments + 1 }, (_, index) =>
    pointOnWave(metrics, index / segments, phase),
  );
  return points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`,
    )
    .join(" ");
}

export function BouncingCircleField({
  items,
  ariaLabel,
  variant = "stats",
  showConnector = true,
  connectorOpacity = 0.82,
}: BouncingCircleFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const glowPathRef = useRef<SVGPathElement>(null);
  const linePathRef = useRef<SVGPathElement>(null);
  const bubbleRefs = useRef<Array<HTMLElement | null>>([]);
  const classes = variantClasses[variant];
  const safeConnectorOpacity = clamp(connectorOpacity, 0, 1);

  useEffect(() => {
    const stageElement = containerRef.current;
    const bubbles = bubbleRefs.current.slice(0, items.length);
    if (!stageElement || bubbles.some((bubble) => !bubble)) return;

    const stage = stageElement;
    const elements = bubbles as HTMLElement[];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame = 0;
    let lastTime = performance.now();
    let phase = 0.35;

    function renderWave(currentPhase: number) {
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      if (!width || !height) return;

      const maximumRadius = Math.max(
        ...elements.map((element) => element.offsetWidth / 2),
      );
      const metrics = createWaveMetrics(width, height, maximumRadius);
      const path = buildWavePath(metrics, currentPhase);

      stage.dataset.waveOrientation = metrics.orientation;
      svgRef.current?.setAttribute("viewBox", `0 0 ${width} ${height}`);
      glowPathRef.current?.setAttribute("d", path);
      linePathRef.current?.setAttribute("d", path);

      if (linePathRef.current) {
        linePathRef.current.style.strokeDashoffset = `${-currentPhase * 42}px`;
      }

      elements.forEach((element, index) => {
        const progress = items.length <= 1 ? 0.5 : index / (items.length - 1);
        const point = pointOnWave(metrics, progress, currentPhase);
        const radius = element.offsetWidth / 2;
        element.style.transform = `translate3d(${point.x - radius}px, ${point.y - radius}px, 0)`;
      });
    }

    function animate(now: number) {
      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      phase += delta * WAVE_SPEED;
      renderWave(phase);
      animationFrame = window.requestAnimationFrame(animate);
    }

    function startMotion() {
      window.cancelAnimationFrame(animationFrame);
      lastTime = performance.now();
      renderWave(phase);
      if (!reducedMotion.matches)
        animationFrame = window.requestAnimationFrame(animate);
    }

    const resizeObserver = new ResizeObserver(startMotion);
    resizeObserver.observe(stage);
    elements.forEach((element) => resizeObserver.observe(element));
    reducedMotion.addEventListener("change", startMotion);
    startMotion();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      reducedMotion.removeEventListener("change", startMotion);
      delete stage.dataset.waveOrientation;
    };
  }, [items]);

  return (
    <div
      ref={containerRef}
      className={`relative mt-8 overflow-hidden border-y border-[var(--line)] bg-white ${classes.stage}`}
      aria-label={ariaLabel}
      data-wave-connector={showConnector ? "visible" : "hidden"}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,var(--signal-soft),transparent_68%)] opacity-60"
        aria-hidden="true"
      />
      <svg
        ref={svgRef}
        className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <path
          ref={glowPathRef}
          fill="none"
          stroke="var(--signal)"
          strokeWidth="12"
          strokeLinecap="round"
          opacity={showConnector ? safeConnectorOpacity * 0.12 : 0}
          vectorEffect="non-scaling-stroke"
        />
        <path
          ref={linePathRef}
          fill="none"
          stroke="var(--signal)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="18 12"
          opacity={showConnector ? safeConnectorOpacity : 0}
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {items.map(({ icon: Icon, eyebrow, title, copy, tags }, index) => (
        <article
          key={title}
          ref={(element) => {
            bubbleRefs.current[index] = element;
          }}
          className={`absolute left-0 top-0 z-10 flex aspect-square will-change-transform flex-col items-center justify-center rounded-full border border-[var(--line-strong)] bg-white text-center shadow-[0_18px_45px_rgba(14,165,233,0.13)] ${classes.bubble}`}
        >
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[var(--line)] bg-[var(--signal-soft)] text-[var(--signal)] sm:h-12 sm:w-12">
            <Icon className="h-5 w-5" />
          </div>
          <p className="mt-3 text-[0.56rem] font-extrabold uppercase tracking-[0.12em] text-[var(--signal-strong)]">
            {eyebrow ?? `0${index + 1}`}
          </p>
          <h3 className="mt-1 text-base font-black tracking-[-0.03em] sm:text-lg">
            {title}
          </h3>
          <p
            className={`mt-2 text-[var(--steel)] ${variant === "features" ? "text-[0.62rem] leading-4 sm:text-[0.7rem] sm:leading-5" : "text-[0.7rem] leading-5 sm:text-xs sm:leading-5"}`}
          >
            {copy}
          </p>
          {tags?.length ? (
            <div className="mt-3 flex max-w-full flex-wrap justify-center gap-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[var(--line)] bg-[var(--signal-soft)] px-2 py-0.5 text-[0.5rem] font-extrabold text-[var(--signal-strong)] sm:text-[0.56rem]"
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
