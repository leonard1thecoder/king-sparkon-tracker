"use client";

import { useEffect, useRef } from "react";
import type { LucideIcon } from "lucide-react";

type VisionBubble = {
  icon: LucideIcon;
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

const MIN_SPEED = 7;
const MAX_SPEED = 16;
const COLLISION_DAMPING = 0.88;
const WALL_DAMPING = 0.92;

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

export function VisionBubbleField({ items }: { items: readonly VisionBubble[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bubbleRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const container = containerRef.current;
    const bubbles = bubbleRefs.current.slice(0, items.length);
    if (!container || bubbles.some((bubble) => !bubble)) return;

    const stage = container;
    const elements = bubbles as HTMLElement[];
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame = 0;
    let lastTime = performance.now();
    let bodies: MovingBody[] = [];

    function placeBodies() {
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      const isCompact = width < 640;
      const positions = isCompact
        ? [
            { x: 0.3, y: 0.2, vx: 7, vy: 5 },
            { x: 0.7, y: 0.5, vx: -6, vy: 8 },
            { x: 0.36, y: 0.8, vx: 5, vy: -7 },
          ]
        : [
            { x: 0.2, y: 0.36, vx: 11, vy: 7 },
            { x: 0.5, y: 0.66, vx: -9, vy: -10 },
            { x: 0.8, y: 0.35, vx: -8, vy: 11 },
          ];

      bodies = elements.map((element, index) => {
        const radius = element.offsetWidth / 2;
        const seed = positions[index] ?? positions[0];
        const existing = bodies[index];
        return {
          x: existing ? Math.min(width - radius, Math.max(radius, existing.x)) : Math.min(width - radius, Math.max(radius, width * seed.x)),
          y: existing ? Math.min(height - radius, Math.max(radius, existing.y)) : Math.min(height - radius, Math.max(radius, height * seed.y)),
          vx: existing?.vx ?? seed.vx,
          vy: existing?.vy ?? seed.vy,
          radius,
        };
      });

      bodies.forEach((body, index) => {
        elements[index].style.transform = `translate3d(${body.x - body.radius}px, ${body.y - body.radius}px, 0)`;
      });
    }

    function resolveWallCollision(body: MovingBody, width: number, height: number) {
      if (body.x - body.radius <= 0) {
        body.x = body.radius;
        body.vx = Math.abs(body.vx) * WALL_DAMPING;
      } else if (body.x + body.radius >= width) {
        body.x = width - body.radius;
        body.vx = -Math.abs(body.vx) * WALL_DAMPING;
      }

      if (body.y - body.radius <= 0) {
        body.y = body.radius;
        body.vy = Math.abs(body.vy) * WALL_DAMPING;
      } else if (body.y + body.radius >= height) {
        body.y = height - body.radius;
        body.vy = -Math.abs(body.vy) * WALL_DAMPING;
      }
    }

    function resolveBubbleCollisions() {
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

      bodies.forEach((body, index) => {
        elements[index].style.transform = `translate3d(${body.x - body.radius}px, ${body.y - body.radius}px, 0)`;
      });

      animationFrame = window.requestAnimationFrame(animate);
    }

    function startMotion() {
      window.cancelAnimationFrame(animationFrame);
      placeBodies();
      lastTime = performance.now();
      if (!prefersReducedMotion.matches) animationFrame = window.requestAnimationFrame(animate);
    }

    const resizeObserver = new ResizeObserver(startMotion);
    resizeObserver.observe(stage);
    elements.forEach((element) => resizeObserver.observe(element));
    prefersReducedMotion.addEventListener("change", startMotion);
    startMotion();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      prefersReducedMotion.removeEventListener("change", startMotion);
    };
  }, [items]);

  return (
    <div
      ref={containerRef}
      className="relative mt-10 min-h-[40rem] overflow-hidden rounded-[3rem] border border-[var(--line)] bg-white sm:min-h-[36rem] lg:min-h-[34rem]"
      aria-label="King Sparkon vision principles"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,var(--signal-soft),transparent_68%)] opacity-60" aria-hidden="true" />
      {items.map(({ icon: Icon, title, copy }, index) => (
        <article
          key={title}
          ref={(element) => {
            bubbleRefs.current[index] = element;
          }}
          className="absolute left-0 top-0 flex aspect-square w-[clamp(10.5rem,28vw,19rem)] will-change-transform flex-col items-center justify-center rounded-full border border-[var(--line-strong)] bg-white p-6 text-center shadow-[0_18px_45px_rgba(14,165,233,0.13)] sm:p-8"
        >
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-[var(--line)] bg-[var(--signal-soft)] text-[var(--signal)]">
            <Icon className="h-5 w-5" />
          </div>
          <p className="mt-4 text-[0.58rem] font-extrabold uppercase tracking-[0.12em] text-[var(--signal-strong)]">Vision 0{index + 1}</p>
          <h3 className="mt-2 text-lg font-black tracking-[-0.03em] sm:text-xl">{title}</h3>
          <p className="mt-3 text-xs leading-5 text-[var(--steel)] sm:text-sm sm:leading-6">{copy}</p>
        </article>
      ))}
    </div>
  );
}
