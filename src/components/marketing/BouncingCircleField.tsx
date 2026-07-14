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

type WaveVariant = "vision" | "notes" | "stats" | "services" | "features" | "subscription";

type BouncingCircleFieldProps = {
  items: readonly BouncingCircleItem[];
  ariaLabel: string;
  variant?: WaveVariant;
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

type Point = { x: number; y: number };

type MovingBody = Point & {
  vx: number;
  vy: number;
  radius: number;
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
const WAVE_SPEED = 0.5;
const SPRING_STRENGTH = 5.4;
const VELOCITY_RETENTION_PER_SECOND = 0.18;
const WALL_RESTITUTION = 0.68;
const COLLISION_RESTITUTION = 0.62;
const MAX_BODY_SPEED = 72;
const COLLISION_GAP = 10;

const variantClasses = {
  vision: { bubble: "p-5 sm:p-7" },
  notes: { bubble: "p-4 sm:p-5" },
  stats: { bubble: "p-4 sm:p-5" },
  services: { bubble: "p-4 sm:p-5" },
  features: { bubble: "p-3.5 sm:p-4" },
  subscription: { bubble: "p-3 sm:p-3.5" },
} as const;

const motionConfig: Record<WaveVariant, VariantMotionConfig> = {
  vision: { desktopDiameter: 280, desktopMinimum: 170, desktopHeight: 520, mobileDiameter: 180, mobileGap: 110, horizontalAmplitude: 48, verticalAmplitude: 30 },
  notes: { desktopDiameter: 198, desktopMinimum: 132, desktopHeight: 410, mobileDiameter: 164, mobileGap: 96, horizontalAmplitude: 34, verticalAmplitude: 26 },
  stats: { desktopDiameter: 204, desktopMinimum: 132, desktopHeight: 440, mobileDiameter: 170, mobileGap: 100, horizontalAmplitude: 38, verticalAmplitude: 28 },
  services: { desktopDiameter: 190, desktopMinimum: 120, desktopHeight: 520, mobileDiameter: 168, mobileGap: 96, horizontalAmplitude: 42, verticalAmplitude: 28 },
  features: { desktopDiameter: 180, desktopMinimum: 116, desktopHeight: 600, mobileDiameter: 176, mobileGap: 104, horizontalAmplitude: 46, verticalAmplitude: 30 },
  subscription: { desktopDiameter: 136, desktopMinimum: 112, desktopHeight: 300, mobileDiameter: 138, mobileGap: 72, horizontalAmplitude: 20, verticalAmplitude: 20 },
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function resolveOrientation(): Orientation {
  return window.innerWidth >= DESKTOP_BREAKPOINT ? "horizontal" : "vertical";
}

function resolveDiameter(width: number, count: number, orientation: Orientation, config: VariantMotionConfig) {
  if (orientation === "vertical") return clamp(Math.min(config.mobileDiameter, width - 88), 118, config.mobileDiameter);
  if (count <= 1) return config.desktopDiameter;
  const centreSpacing = Math.max(1, (width - 64) / (count - 1));
  return clamp(centreSpacing * 0.72, config.desktopMinimum, config.desktopDiameter);
}

function resolveStageHeight(diameter: number, count: number, orientation: Orientation, variant: WaveVariant, config: VariantMotionConfig) {
  if (orientation === "horizontal") return config.desktopHeight;
  const edgeRoom = diameter / 2 + (variant === "subscription" ? 28 : 44);
  return Math.ceil(edgeRoom * 2 + Math.max(0, count - 1) * (diameter + config.mobileGap));
}

function createWaveMetrics(width: number, height: number, radius: number, orientation: Orientation, variant: WaveVariant, config: VariantMotionConfig): WaveMetrics {
  const edgeRoom = radius + (variant === "subscription" ? 22 : 34);
  if (orientation === "horizontal") {
    const availableHeight = Math.max(0, height - radius * 2 - 48);
    return { orientation, start: edgeRoom, span: Math.max(1, width - edgeRoom * 2), baseline: height / 2, amplitude: clamp(availableHeight * 0.2, variant === "subscription" ? 8 : 18, config.horizontalAmplitude) };
  }
  const availableWidth = Math.max(0, width - radius * 2 - 36);
  return { orientation, start: edgeRoom, span: Math.max(1, height - edgeRoom * 2), baseline: width / 2, amplitude: clamp(availableWidth * 0.24, variant === "subscription" ? 10 : 16, config.verticalAmplitude) };
}

function pointOnWave(metrics: WaveMetrics, progress: number, phase: number): Point {
  const waveOffset = Math.sin(progress * Math.PI * 2 * WAVE_CYCLES + phase) * metrics.amplitude;
  return metrics.orientation === "horizontal"
    ? { x: metrics.start + metrics.span * progress, y: metrics.baseline + waveOffset }
    : { x: metrics.baseline + waveOffset, y: metrics.start + metrics.span * progress };
}

function buildWavePath(metrics: WaveMetrics, phase: number) {
  const segments = 96;
  return Array.from({ length: segments + 1 }, (_, index) => pointOnWave(metrics, index / segments, phase))
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");
}

function limitSpeed(body: MovingBody) {
  const speed = Math.hypot(body.vx, body.vy);
  if (speed <= MAX_BODY_SPEED || speed === 0) return;
  const scale = MAX_BODY_SPEED / speed;
  body.vx *= scale;
  body.vy *= scale;
}

function resolveWallCollision(body: MovingBody, width: number, height: number) {
  const padding = 6;
  const minimumX = body.radius + padding;
  const maximumX = width - body.radius - padding;
  const minimumY = body.radius + padding;
  const maximumY = height - body.radius - padding;
  if (body.x < minimumX) { body.x = minimumX; body.vx = Math.abs(body.vx) * WALL_RESTITUTION; }
  else if (body.x > maximumX) { body.x = maximumX; body.vx = -Math.abs(body.vx) * WALL_RESTITUTION; }
  if (body.y < minimumY) { body.y = minimumY; body.vy = Math.abs(body.vy) * WALL_RESTITUTION; }
  else if (body.y > maximumY) { body.y = maximumY; body.vy = -Math.abs(body.vy) * WALL_RESTITUTION; }
}

function resolveBodyCollisions(bodies: MovingBody[]) {
  for (let pass = 0; pass < 2; pass += 1) {
    for (let first = 0; first < bodies.length; first += 1) {
      for (let second = first + 1; second < bodies.length; second += 1) {
        const a = bodies[first];
        const b = bodies[second];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let distance = Math.hypot(dx, dy);
        const minimumDistance = a.radius + b.radius + COLLISION_GAP;
        if (distance >= minimumDistance) continue;
        if (distance === 0) { dx = 1; dy = 0; distance = 1; }
        const normalX = dx / distance;
        const normalY = dy / distance;
        const overlap = minimumDistance - distance;
        a.x -= normalX * overlap * 0.5;
        a.y -= normalY * overlap * 0.5;
        b.x += normalX * overlap * 0.5;
        b.y += normalY * overlap * 0.5;
        const relativeVelocityX = b.vx - a.vx;
        const relativeVelocityY = b.vy - a.vy;
        const velocityAlongNormal = relativeVelocityX * normalX + relativeVelocityY * normalY;
        if (velocityAlongNormal >= 0) continue;
        const impulse = (-(1 + COLLISION_RESTITUTION) * velocityAlongNormal) / 2;
        a.vx -= impulse * normalX;
        a.vy -= impulse * normalY;
        b.vx += impulse * normalX;
        b.vy += impulse * normalY;
        limitSpeed(a);
        limitSpeed(b);
      }
    }
  }
}

export function BouncingCircleField({ items, ariaLabel, variant = "stats", showConnector = true, connectorOpacity = 0.86 }: BouncingCircleFieldProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const glowPathRef = useRef<SVGPathElement | null>(null);
  const linePathRef = useRef<SVGPathElement | null>(null);
  const bubbleRefs = useRef<Array<HTMLElement | null>>([]);
  const classes = variantClasses[variant];
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
    let lastTime = performance.now();
    let phase = 0.35;
    let bodies: MovingBody[] = [];
    let layoutKey = "";

    function prepareLayout(currentPhase: number) {
      const width = stage.clientWidth;
      if (!width) return null;
      const orientation = resolveOrientation();
      const diameter = resolveDiameter(width, items.length, orientation, config);
      const stageHeight = resolveStageHeight(diameter, items.length, orientation, variant, config);
      const nextLayoutKey = `${Math.round(width)}:${orientation}:${Math.round(diameter)}:${stageHeight}`;
      const layoutChanged = nextLayoutKey !== layoutKey;
      if (layoutChanged) {
        layoutKey = nextLayoutKey;
        stage.style.height = `${stageHeight}px`;
        stage.style.minHeight = `${stageHeight}px`;
        elements.forEach((element) => { element.style.width = `${diameter}px`; element.style.height = `${diameter}px`; });
      }
      const height = stageHeight;
      const radius = diameter / 2;
      const metrics = createWaveMetrics(width, height, radius, orientation, variant, config);
      const anchors = items.map((_, index) => pointOnWave(metrics, items.length <= 1 ? 0.5 : index / (items.length - 1), currentPhase));
      stage.dataset.waveOrientation = orientation;
      svgRef.current?.setAttribute("viewBox", `0 0 ${width} ${height}`);
      const path = buildWavePath(metrics, currentPhase);
      glowPathRef.current?.setAttribute("d", path);
      linePathRef.current?.setAttribute("d", path);
      if (linePathRef.current) linePathRef.current.style.strokeDashoffset = `${-currentPhase * 40}px`;
      if (layoutChanged || bodies.length !== elements.length) {
        bodies = anchors.map((anchor, index) => {
          const direction = index % 2 === 0 ? 1 : -1;
          return { x: anchor.x, y: anchor.y, vx: orientation === "horizontal" ? direction * 5 : direction * 16, vy: orientation === "horizontal" ? direction * 16 : direction * 5, radius };
        });
      } else {
        bodies.forEach((body) => { body.radius = radius; resolveWallCollision(body, width, height); });
      }
      return { anchors, width, height };
    }

    function renderBodies() {
      bodies.forEach((body, index) => { elements[index].style.transform = `translate3d(${body.x - body.radius}px, ${body.y - body.radius}px, 0)`; });
    }

    function renderStatic() {
      const scene = prepareLayout(phase);
      if (!scene) return;
      bodies = scene.anchors.map((anchor, index) => ({ ...anchor, vx: 0, vy: 0, radius: elements[index].offsetWidth / 2 }));
      renderBodies();
    }

    function animate(now: number) {
      const delta = Math.min((now - lastTime) / 1000, 0.04);
      lastTime = now;
      phase += delta * WAVE_SPEED;
      const scene = prepareLayout(phase);
      if (!scene) { animationFrame = window.requestAnimationFrame(animate); return; }
      const damping = Math.pow(VELOCITY_RETENTION_PER_SECOND, delta);
      bodies.forEach((body, index) => {
        const anchor = scene.anchors[index];
        body.vx += (anchor.x - body.x) * SPRING_STRENGTH * delta;
        body.vy += (anchor.y - body.y) * SPRING_STRENGTH * delta;
        body.vx *= damping;
        body.vy *= damping;
        limitSpeed(body);
        body.x += body.vx * delta;
        body.y += body.vy * delta;
        resolveWallCollision(body, scene.width, scene.height);
      });
      resolveBodyCollisions(bodies);
      bodies.forEach((body) => resolveWallCollision(body, scene.width, scene.height));
      renderBodies();
      animationFrame = window.requestAnimationFrame(animate);
    }

    function startMotion() {
      window.cancelAnimationFrame(animationFrame);
      lastTime = performance.now();
      if (reducedMotion.matches) renderStatic();
      else animationFrame = window.requestAnimationFrame(animate);
    }

    const resizeObserver = new ResizeObserver(startMotion);
    resizeObserver.observe(stage);
    reducedMotion.addEventListener("change", startMotion);
    window.addEventListener("resize", startMotion);
    startMotion();
    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      reducedMotion.removeEventListener("change", startMotion);
      window.removeEventListener("resize", startMotion);
      delete stage.dataset.waveOrientation;
      stage.style.removeProperty("height");
      stage.style.removeProperty("min-height");
      elements.forEach((element) => { element.style.removeProperty("width"); element.style.removeProperty("height"); element.style.removeProperty("transform"); });
    };
  }, [config, items, variant]);

  return (
    <div ref={containerRef} className="relative mt-8 overflow-hidden border-y border-[var(--line)] bg-white" aria-label={ariaLabel} data-wave-connector={showConnector ? "visible" : "hidden"}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,var(--signal-soft),transparent_70%)] opacity-60" aria-hidden="true" />
      <svg ref={svgRef} className="pointer-events-none absolute inset-0 z-[2] h-full w-full" aria-hidden="true" preserveAspectRatio="none">
        <path ref={glowPathRef} fill="none" stroke="var(--signal)" strokeWidth={isSubscription ? "10" : "12"} strokeLinecap="round" opacity={showConnector ? safeConnectorOpacity * 0.12 : 0} vectorEffect="non-scaling-stroke" />
        <path ref={linePathRef} fill="none" stroke="var(--signal)" strokeWidth={isSubscription ? "3.25" : "4"} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={isSubscription ? "16 11" : "20 12"} opacity={showConnector ? safeConnectorOpacity : 0} vectorEffect="non-scaling-stroke" />
      </svg>
      {items.map(({ icon: Icon, eyebrow, title, copy, tags }, index) => (
        <article key={title} ref={(element: HTMLElement | null) => { bubbleRefs.current[index] = element; }} className={`absolute left-0 top-0 z-10 flex aspect-square min-h-0 will-change-transform flex-col items-center justify-center rounded-full border border-[var(--line-strong)] bg-white text-center shadow-[0_18px_45px_rgba(14,165,233,0.13)] ${classes.bubble}`}>
          <div className={`grid shrink-0 place-items-center rounded-full border border-[var(--line)] bg-[var(--signal-soft)] text-[var(--signal)] ${isSubscription ? "h-9 w-9" : "h-10 w-10 sm:h-11 sm:w-11"}`}><Icon className={isSubscription ? "h-4 w-4" : "h-5 w-5"} /></div>
          <p className={`font-extrabold uppercase text-[var(--signal-strong)] ${isSubscription ? "mt-2 text-[0.46rem] tracking-[0.09em]" : "mt-2.5 text-[0.54rem] tracking-[0.11em]"}`}>{eyebrow ?? `0${index + 1}`}</p>
          <h3 className={`text-balance font-black leading-tight tracking-[-0.03em] ${isSubscription ? "mt-1 text-sm" : "mt-1 text-sm sm:text-base"}`}>{title}</h3>
          <p className={`mt-1.5 text-balance text-[var(--steel)] ${variant === "features" ? "text-[0.58rem] leading-[0.86rem] sm:text-[0.64rem] sm:leading-4" : isSubscription ? "text-[0.56rem] leading-[0.82rem]" : "text-[0.66rem] leading-[0.98rem] sm:text-[0.7rem] sm:leading-4"}`}>{copy}</p>
          {tags?.length ? <div className="mt-2 flex max-w-full flex-wrap justify-center gap-1">{tags.map((tag) => <span key={tag} className="rounded-full border border-[var(--line)] bg-[var(--signal-soft)] px-1.5 py-0.5 text-[0.46rem] font-extrabold text-[var(--signal-strong)] sm:text-[0.5rem]">{tag}</span>)}</div> : null}
        </article>
      ))}
    </div>
  );
}
