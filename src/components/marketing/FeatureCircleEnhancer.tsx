"use client";

import { useEffect } from "react";

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
const VELOCITIES = [
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

function positions(count: number, compact: boolean) {
  const columns = compact ? 2 : 3;
  const rows = Math.ceil(count / columns);
  return Array.from({ length: count }, (_, index) => {
    const row = Math.floor(index / columns);
    const column = index % columns;
    const itemsInRow = Math.min(columns, count - row * columns);
    return { x: (column + 1) / (itemsInRow + 1), y: (row + 1) / (rows + 1) };
  });
}

export function FeatureCircleEnhancer() {
  useEffect(() => {
    const firstCard = document.querySelector<HTMLElement>("#features article");
    const stageElement = firstCard?.parentElement;
    if (!stageElement || stageElement.dataset.bouncingFeatureField === "true") return;

    const stage = stageElement;
    const cards = Array.from(stage.children).filter(
      (element): element is HTMLElement => element instanceof HTMLElement && element.tagName === "ARTICLE",
    );
    if (!cards.length) return;

    const originalStageStyle = stage.getAttribute("style");
    const originalCardStyles = cards.map((card) => card.getAttribute("style"));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame = 0;
    let lastTime = performance.now();
    let bodies: MovingBody[] = [];

    stage.dataset.bouncingFeatureField = "true";

    function styleCards() {
      const width = stage.clientWidth;
      const compact = width < 640;
      const tablet = width < 1024;
      const size = compact ? Math.min(164, width * 0.47) : tablet ? Math.min(220, width * 0.28) : Math.min(256, width * 0.22);
      const stageHeight = compact ? 1152 : tablet ? 992 : 800;

      Object.assign(stage.style, {
        position: "relative",
        display: "block",
        minHeight: `${stageHeight}px`,
        overflow: "hidden",
        borderTop: "1px solid var(--line)",
        borderBottom: "1px solid var(--line)",
        background: "radial-gradient(circle at center, var(--signal-soft), white 68%)",
      });

      cards.forEach((card) => {
        Object.assign(card.style, {
          position: "absolute",
          left: "0",
          top: "0",
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "9999px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: compact ? "12px" : "20px",
          willChange: "transform",
          boxShadow: "0 18px 45px rgba(14, 165, 233, 0.13)",
        });

        const icon = card.firstElementChild as HTMLElement | null;
        const title = card.querySelector<HTMLElement>("h3");
        const copy = card.querySelector<HTMLElement>("p");
        const tags = card.querySelector<HTMLElement>("h3 ~ div");
        if (icon) icon.style.borderRadius = "9999px";
        if (title) {
          title.style.marginTop = compact ? "8px" : "12px";
          title.style.fontSize = compact ? "0.82rem" : "1rem";
        }
        if (copy) {
          copy.style.marginTop = "6px";
          copy.style.fontSize = compact ? "0.58rem" : "0.7rem";
          copy.style.lineHeight = compact ? "0.86rem" : "1rem";
        }
        if (tags) {
          tags.style.marginTop = compact ? "6px" : "10px";
          tags.style.justifyContent = "center";
          tags.querySelectorAll<HTMLElement>("span").forEach((tag) => {
            tag.style.borderRadius = "9999px";
            tag.style.fontSize = compact ? "0.45rem" : "0.54rem";
            tag.style.padding = compact ? "2px 5px" : "3px 7px";
          });
        }
      });
    }

    function resolveWalls(body: MovingBody, width: number, height: number) {
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

    function resolveCollisions(applyImpulse = true) {
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

    function render() {
      bodies.forEach((body, index) => {
        cards[index].style.transform = `translate3d(${body.x - body.radius}px, ${body.y - body.radius}px, 0)`;
      });
    }

    function place() {
      styleCards();
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      const seeds = positions(cards.length, width < 640);
      bodies = cards.map((card, index) => {
        const radius = card.offsetWidth / 2;
        const seed = seeds[index];
        const velocity = VELOCITIES[index % VELOCITIES.length];
        return {
          x: Math.min(width - radius, Math.max(radius, width * seed.x)),
          y: Math.min(height - radius, Math.max(radius, height * seed.y)),
          vx: velocity.vx,
          vy: velocity.vy,
          radius,
        };
      });
      for (let pass = 0; pass < 12; pass += 1) {
        resolveCollisions(false);
        bodies.forEach((body) => resolveWalls(body, width, height));
      }
      render();
    }

    function animate(now: number) {
      const delta = Math.min((now - lastTime) / 1000, 0.034);
      lastTime = now;
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      bodies.forEach((body) => {
        body.x += body.vx * delta;
        body.y += body.vy * delta;
        resolveWalls(body, width, height);
      });
      resolveCollisions();
      render();
      animationFrame = window.requestAnimationFrame(animate);
    }

    function restart() {
      window.cancelAnimationFrame(animationFrame);
      place();
      lastTime = performance.now();
      if (!reducedMotion.matches) animationFrame = window.requestAnimationFrame(animate);
    }

    const resizeObserver = new ResizeObserver(restart);
    resizeObserver.observe(stage);
    reducedMotion.addEventListener("change", restart);
    restart();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      reducedMotion.removeEventListener("change", restart);
      delete stage.dataset.bouncingFeatureField;
      if (originalStageStyle === null) stage.removeAttribute("style");
      else stage.setAttribute("style", originalStageStyle);
      cards.forEach((card, index) => {
        const originalStyle = originalCardStyles[index];
        if (originalStyle === null) card.removeAttribute("style");
        else card.setAttribute("style", originalStyle);
      });
    };
  }, []);

  return null;
}
