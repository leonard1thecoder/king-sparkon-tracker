"use client";

import { useEffect, useRef } from "react";
import type { LucideIcon } from "lucide-react";

export type BouncingCircleItem = {
  icon: LucideIcon;
  eyebrow?: string;
  title: string;
  copy: string;
};

type MovingBody = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
};

type BouncingCircleFieldProps = {
  items: readonly BouncingCircleItem[];
  ariaLabel: string;
  variant?: "vision" | "notes" | "stats" | "services";
};

const MIN_SPEED = 7;
const MAX_SPEED = 16;
const COLLISION_DAMPING = 0.88;
const WALL_DAMPING = 0.92;

const variantClasses = {
  vision: {
    stage: "min-h-[40rem] sm:min-h-[36rem] lg:min-h-[34rem]",
    bubble: "w-[clamp(10rem,28vw,19rem)] p-6 sm:p-8",
  },
  notes: {
    stage: "min-h-[32rem] sm:min-h-[30rem] lg:min-h-[29rem]",
    bubble: "w-[clamp(8.5rem,25vw,13.5rem)] p-5 sm:p-6",
  },
  stats: {
    stage: "min-h-[40rem] sm:min-h-[35rem] lg:min-h-[34rem]",
    bubble: "w-[clamp(8.5rem,22vw,14rem)] p-5 sm:p-6",
  },
  services: {
    stage: "min-h-[49rem] sm:min-h-[44rem] lg:min-h-[42rem]",
    bubble: "w-[clamp(8.5rem,19vw,14.5rem)] p-5 sm:p-6",
  },
} as const;

const velocitySeeds = [
  { vx: 11, vy: 7 },
  { vx: -9, vy: 10 },
  { vx: -8, vy: -11 },
  { vx: 10, vy: -8 },
  { vx: 7, vy: 12 },
  { vx: -12, vy: 7 },
] as const;

function keepSlowDrift(body: MovingBody) {
  const speed = Math.hypot(body.vx, body.vy);
  if (speed === 0) {
    body.vx = MIN_SPEED;
    body.vy = MIN_SPEED * 0.5;
    return;
  }

  const target = Math.min(MAX_SPEED, Math.max(MIN_SPEED, speed));
  const scale = target / speed;
  body.vx *= scale;
  body.vy *= scale;
}

function layoutSeeds(count: number, compact: boolean) {
  if (count === 3) {
    return compact
      ? [{ x: 0.3, y: 0.22 }, { x: 0.7, y: 0.5 }, { x: 0.34, y: 0.8 }]
      : [{ x: 0.22, y: 0.34 }, { x: 0.78, y: 0.34 }, { x: 0.5, y: 0.74 }];
  }

  const columns = compact ? 2 : count === 4 ? 2 : 3;
  const rows = Math.ceil(count / columns);

  return Array.from({ length: count }, (_, index) => {
    const row = Math.floor(index / columns);
    const column = index % columns;
    const itemsInRow = Math.min(columns, count - row * columns);
    const x = (column + 1) / (itemsInRow + 1);
    const y = (row + 1) / (rows + 1);
    return { x, y };
  });
}

export function BouncingCircleField({ items, ariaLabel, variant = "stats" }: BouncingCircleFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bubbleRefs = useRef<Array<HTMLElement | null>>([]);
  const classes = variantClasses[variant];

  useEffect(() => {
    const stage = containerRef.current;
    const bubbles = bubbleRefs.current.slice(0, items.length);
    if (!stage || bubbles.some((bubble) => !bubble)) return;

    const elements = bubbles as HTMLElement[];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame = 0;
    let lastTime = performance.now();
    let bodies: MovingBody[] = [];

    function resolveWallCollision(body: MovingBody, width: number, height: number) {
      let collided = false;

      if (body.x - body.radius <= 0) {
        body.x = body.radius;
        body.vx = Math.abs(body.vx) * WALL_DAMPING;
        collided = true;
      } else if (body.x + body.radius >= width) {
        body.x = width - body.radius;
        body.vx = -Math.abs(body.vx) * WALL_DAMPING;
        collided = true;
      }

      if (body.y - body.radius <= 0) {
        body.y = body.radius;
        body.vy = Math.abs(body.vy) * WALL_DAMPING;
        collided = true;
      } else if (body.y + body.radius >= height) {
        body.y = height - body.radius;
        body.vy = -Math.abs(body.vy) * WALL_DAMPING;
        collided = true;
      }

      if (collided) keepSlowDrift(body);
    }

    function resolveBubbleCollisions(applyImpulse = true) {
      for (let first = 0; first < bodies.length; first += 1) {
        for (let second = first + 1; second < bodies.length; second += 1) {
          const a = bodies[first];
          const b = bodies[second];
          let dx = b.x - a.x;
          let dy = b.y - a.y;
          let distance = Math.hypot(dx, dy);
          const minimumDistance = a.radius + b.radius;

          if (distance >= minimumDistance) continue;
          if (distance === 0) {
            dx = 1;
            dy = 0;
            distance = 1;
          }

          const normalX = dx / distance;
          const normalY = dy / distance;
          const overlap = minimumDistance - distance;

          a.x -= normalX * overlap * 0.5;
          a.y -= normalY * overlap * 0.5;
          b.x += normalX * overlap * 0.5;
          b.y += normalY * overlap * 0.5;

          if (!applyImpulse) continue;

          const closingSpeed = (a.vx - b.vx) * normalX + (a.vy - b.vy) * normalY;
          if (closingSpeed > 0) {
            const impulse = closingSpeed * COLLISION_DAMPING;
            a.vx -= impulse * normalX;
            a.vy -= impulse * normalY;
            b.vx += impulse * normalX;
            b.vy += impulse * normalY;
            keepSlowDrift(a);
            keepSlowDrift(b);
          }
        }
      }
    }

    function renderBodies() {
      bodies.forEach((body, index) => {
        elements[index].style.transform = `translate3d(${body.x - body.radius}px, ${body.y - body.radius}px, 0)`;
      });
    }

    function placeBodies() {
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      const compact = width < 640;
      const positions = layoutSeeds(items.length, compact);

      bodies = elements.map((element, index) => {
        const radius = element.offsetWidth / 2;
        const position = positions[index];
        const velocity = velocitySeeds[index % velocitySeeds.length];
        const existing = bodies[index];

        return {
          x: existing ? Math.min(width - radius, Math.max(radius, existing.x)) : Math.min(width - radius, Math.max(radius, width * position.x)),
          y: existing ? Math.min(height - radius, Math.max(radius, existing.y)) : Math.min(height - radius, Math.max(radius, height * position.y)),
          vx: existing?.vx ?? velocity.vx,
          vy: existing?.vy ?? velocity.vy,
          radius,
        };
      });

      for (let pass = 0; pass < 12; pass += 1) {
        resolveBubbleCollisions(false);
        bodies.forEach((body) => resolveWallCollision(body, width, height));
      }
      renderBodies();
    }

    function animate(now: number) {
      const delta = Math.min((now - lastTime) / 1000, 0.034);
      lastTime = now;
      const width = stage.clientWidth;
      const height = stage.clientHeight;

      bodies.forEach((body) => {
        body.x += body.vx * delta;
        body.y += body.vy * delta;
        resolveWallCollision(body, width, height);
      });
      resolveBubbleCollisions();
      renderBodies();

      animationFrame = window.requestAnimationFrame(animate);
    }

    function startMotion() {
      window.cancelAnimationFrame(animationFrame);
      placeBodies();
      lastTime = performance.now();
      if (!reducedMotion.matches) animationFrame = window.requestAnimationFrame(animate);
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
    };
  }, [items]);

  return (
    <div ref={containerRef} className={`relative mt-8 overflow-hidden border-y border-[var(--line)] bg-white ${classes.stage}`} aria-label={ariaLabel}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,var(--signal-soft),transparent_68%)] opacity-60" aria-hidden="true" />
      {items.map(({ icon: Icon, eyebrow, title, copy }, index) => (
        <article
          key={title}
          ref={(element) => {
            bubbleRefs.current[index] = element;
          }}
          className={`absolute left-0 top-0 flex aspect-square will-change-transform flex-col items-center justify-center rounded-full border border-[var(--line-strong)] bg-white text-center shadow-[0_18px_45px_rgba(14,165,233,0.13)] ${classes.bubble}`}
        >
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[var(--line)] bg-[var(--signal-soft)] text-[var(--signal)] sm:h-12 sm:w-12">
            <Icon className="h-5 w-5" />
          </div>
          <p className="mt-3 text-[0.56rem] font-extrabold uppercase tracking-[0.12em] text-[var(--signal-strong)]">{eyebrow ?? `0${index + 1}`}</p>
          <h3 className="mt-1 text-base font-black tracking-[-0.03em] sm:text-lg">{title}</h3>
          <p className="mt-2 text-[0.7rem] leading-5 text-[var(--steel)] sm:text-xs sm:leading-5">{copy}</p>
        </article>
      ))}
    </div>
  );
}
