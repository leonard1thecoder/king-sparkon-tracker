"use client";

import { useEffect } from "react";

type Orientation = "horizontal" | "vertical";
type Point = { x: number; y: number };
type MovingBody = Point & { vx: number; vy: number; radius: number };

type WaveMetrics = {
  orientation: Orientation;
  start: number;
  span: number;
  baseline: number;
  amplitude: number;
};

const DESKTOP_BREAKPOINT = 1024;
const WAVE_CYCLES = 1.05;
const WAVE_SPEED = 0.5;
const SPRING_STRENGTH = 5.4;
const VELOCITY_RETENTION_PER_SECOND = 0.18;
const WALL_RESTITUTION = 0.68;
const COLLISION_RESTITUTION = 0.62;
const MAX_BODY_SPEED = 72;
const COLLISION_GAP = 12;
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const MOBILE_DIAMETER = 212;
const MOBILE_GAP = 120;
const DESKTOP_DIAMETER = 220;
const DESKTOP_MINIMUM = 146;

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
) {
  if (orientation === "vertical") {
    return clamp(Math.min(MOBILE_DIAMETER, width - 64), 146, MOBILE_DIAMETER);
  }

  if (count <= 1) return DESKTOP_DIAMETER;
  const centreSpacing = Math.max(1, (width - 64) / (count - 1));
  return clamp(
    centreSpacing * 0.86,
    DESKTOP_MINIMUM,
    DESKTOP_DIAMETER,
  );
}

function resolveStageHeight(
  diameter: number,
  count: number,
  orientation: Orientation,
) {
  if (orientation === "horizontal") return 680;
  const edgeRoom = diameter / 2 + 48;
  return Math.ceil(
    edgeRoom * 2 + Math.max(0, count - 1) * (diameter + MOBILE_GAP),
  );
}

function createWaveMetrics(
  width: number,
  height: number,
  radius: number,
  orientation: Orientation,
): WaveMetrics {
  const edgeRoom = radius + 38;

  if (orientation === "horizontal") {
    const availableHeight = Math.max(0, height - radius * 2 - 52);
    return {
      orientation,
      start: edgeRoom,
      span: Math.max(1, width - edgeRoom * 2),
      baseline: height / 2,
      amplitude: clamp(availableHeight * 0.2, 18, 50),
    };
  }

  const availableWidth = Math.max(0, width - radius * 2 - 36);
  return {
    orientation,
    start: edgeRoom,
    span: Math.max(1, height - edgeRoom * 2),
    baseline: width / 2,
    amplitude: clamp(availableWidth * 0.24, 16, 32),
  };
}

function pointOnWave(
  metrics: WaveMetrics,
  progress: number,
  phase: number,
): Point {
  const waveOffset =
    Math.sin(progress * Math.PI * 2 * WAVE_CYCLES + phase) * metrics.amplitude;

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
  const segments = 96;
  return Array.from({ length: segments + 1 }, (_, index) =>
    pointOnWave(metrics, index / segments, phase),
  )
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`,
    )
    .join(" ");
}

function rememberStyle(
  node: HTMLElement,
  styles: Map<HTMLElement, string | null>,
) {
  if (!styles.has(node)) styles.set(node, node.getAttribute("style"));
}

function limitSpeed(body: MovingBody) {
  const speed = Math.hypot(body.vx, body.vy);
  if (speed <= MAX_BODY_SPEED || speed === 0) return;
  const scale = MAX_BODY_SPEED / speed;
  body.vx *= scale;
  body.vy *= scale;
}

function resolveWallCollision(body: MovingBody, width: number, height: number) {
  const padding = 8;
  const minimumX = body.radius + padding;
  const maximumX = width - body.radius - padding;
  const minimumY = body.radius + padding;
  const maximumY = height - body.radius - padding;

  if (body.x < minimumX) {
    body.x = minimumX;
    body.vx = Math.abs(body.vx) * WALL_RESTITUTION;
  } else if (body.x > maximumX) {
    body.x = maximumX;
    body.vx = -Math.abs(body.vx) * WALL_RESTITUTION;
  }

  if (body.y < minimumY) {
    body.y = minimumY;
    body.vy = Math.abs(body.vy) * WALL_RESTITUTION;
  } else if (body.y > maximumY) {
    body.y = maximumY;
    body.vy = -Math.abs(body.vy) * WALL_RESTITUTION;
  }
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

        const relativeVelocityX = b.vx - a.vx;
        const relativeVelocityY = b.vy - a.vy;
        const velocityAlongNormal =
          relativeVelocityX * normalX + relativeVelocityY * normalY;

        if (velocityAlongNormal >= 0) continue;
        const impulse =
          (-(1 + COLLISION_RESTITUTION) * velocityAlongNormal) / 2;
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

function fitCardTypography(card: HTMLElement, diameter: number) {
  const icon = card.firstElementChild as HTMLElement | null;
  const title = card.querySelector<HTMLElement>("h3");
  const copy = card.querySelector<HTMLElement>("p");
  const tags = card.querySelector<HTMLElement>("h3 ~ div");
  const tagItems = tags
    ? Array.from(tags.querySelectorAll<HTMLElement>("span"))
    : [];
  const large = diameter >= 205;
  const medium = diameter >= 180;

  let titleSize = large ? 0.98 : medium ? 0.9 : 0.8;
  let copySize = large ? 0.7 : medium ? 0.64 : 0.56;
  let copyLineHeight = large ? 1.02 : medium ? 0.94 : 0.84;
  let tagSize = large ? 0.52 : medium ? 0.48 : 0.43;

  Object.assign(card.style, {
    position: "absolute",
    left: "0",
    top: "0",
    width: `${diameter}px`,
    height: `${diameter}px`,
    borderRadius: "9999px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: large ? "22px" : medium ? "18px" : "14px",
    overflow: "hidden",
    boxSizing: "border-box",
    willChange: "transform",
    boxShadow: "0 18px 45px rgba(14,165,233,0.13)",
    zIndex: "10",
  });

  if (icon) {
    icon.style.borderRadius = "9999px";
    icon.style.flexShrink = "0";
  }

  [title, copy, tags].forEach((node) => {
    if (!node) return;
    node.style.maxWidth = "88%";
    node.style.overflowWrap = "anywhere";
  });

  if (title) title.style.marginTop = large ? "10px" : "8px";
  if (copy) copy.style.marginTop = "5px";
  if (tags) {
    tags.style.marginTop = large ? "8px" : "6px";
    tags.style.justifyContent = "center";
  }

  const applySizes = () => {
    if (title) {
      title.style.fontSize = `${titleSize}rem`;
      title.style.lineHeight = `${titleSize * 1.12}rem`;
    }
    if (copy) {
      copy.style.fontSize = `${copySize}rem`;
      copy.style.lineHeight = `${copyLineHeight}rem`;
    }
    tagItems.forEach((tag) => {
      tag.style.borderRadius = "9999px";
      tag.style.fontSize = `${tagSize}rem`;
      tag.style.padding = large ? "3px 8px" : "2px 6px";
    });
  };

  applySizes();

  for (
    let attempt = 0;
    attempt < 5 && card.scrollHeight > card.clientHeight + 1;
    attempt += 1
  ) {
    titleSize *= 0.96;
    copySize *= 0.94;
    copyLineHeight *= 0.95;
    tagSize *= 0.94;
    applySizes();
  }
}

export function FeatureCircleEnhancer() {
  useEffect(() => {
    const firstCard = document.querySelector<HTMLElement>("#features article");
    const stageElement = firstCard?.parentElement;
    if (!stageElement || stageElement.dataset.waveFeatureField === "true") {
      return;
    }

    const stage = stageElement;
    const cards = Array.from(stage.children).filter(
      (element): element is HTMLElement =>
        element instanceof HTMLElement && element.tagName === "ARTICLE",
    );
    if (!cards.length) return;

    const originalStyles = new Map<HTMLElement, string | null>();
    rememberStyle(stage, originalStyles);
    cards.forEach((card) => {
      rememberStyle(card, originalStyles);
      const icon = card.firstElementChild;
      const title = card.querySelector<HTMLElement>("h3");
      const copy = card.querySelector<HTMLElement>("p");
      const tags = card.querySelector<HTMLElement>("h3 ~ div");
      if (icon instanceof HTMLElement) rememberStyle(icon, originalStyles);
      if (title) rememberStyle(title, originalStyles);
      if (copy) rememberStyle(copy, originalStyles);
      if (tags) {
        rememberStyle(tags, originalStyles);
        tags
          .querySelectorAll<HTMLElement>("span")
          .forEach((tag) => rememberStyle(tag, originalStyles));
      }
    });

    const svg = document.createElementNS(SVG_NAMESPACE, "svg");
    const glowPath = document.createElementNS(SVG_NAMESPACE, "path");
    const linePath = document.createElementNS(SVG_NAMESPACE, "path");
    const connectorVisible = stage.dataset.waveConnector !== "hidden";
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame = 0;
    let lastTime = performance.now();
    let phase = 0.35;
    let bodies: MovingBody[] = [];
    let layoutKey = "";

    stage.dataset.waveFeatureField = "true";
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("preserveAspectRatio", "none");
    Object.assign(svg.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      zIndex: "2",
    });

    [glowPath, linePath].forEach((path) => {
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "var(--signal)");
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("stroke-linejoin", "round");
      path.setAttribute("vector-effect", "non-scaling-stroke");
    });
    glowPath.setAttribute("stroke-width", "13");
    glowPath.setAttribute("opacity", connectorVisible ? "0.13" : "0");
    linePath.setAttribute("stroke-width", "4.25");
    linePath.setAttribute("stroke-dasharray", "21 12");
    linePath.setAttribute("opacity", connectorVisible ? "0.92" : "0");
    svg.append(glowPath, linePath);
    stage.prepend(svg);

    function prepareLayout(currentPhase: number) {
      const width = stage.clientWidth;
      if (!width) return null;

      const orientation = resolveOrientation();
      const diameter = resolveDiameter(width, cards.length, orientation);
      const stageHeight = resolveStageHeight(
        diameter,
        cards.length,
        orientation,
      );
      const nextLayoutKey = `${Math.round(width)}:${orientation}:${Math.round(diameter)}:${stageHeight}`;
      const layoutChanged = nextLayoutKey !== layoutKey;

      if (layoutChanged) {
        layoutKey = nextLayoutKey;
        Object.assign(stage.style, {
          position: "relative",
          display: "block",
          height: `${stageHeight}px`,
          minHeight: `${stageHeight}px`,
          overflow: "hidden",
          borderTop: "1px solid var(--line)",
          borderBottom: "1px solid var(--line)",
          background:
            "radial-gradient(circle at center, var(--signal-soft), white 70%)",
        });
        cards.forEach((card) => fitCardTypography(card, diameter));
      }

      const height = stageHeight;
      const radius = diameter / 2;
      const metrics = createWaveMetrics(
        width,
        height,
        radius,
        orientation,
      );
      const anchors = cards.map((_, index) =>
        pointOnWave(
          metrics,
          cards.length <= 1 ? 0.5 : index / (cards.length - 1),
          currentPhase,
        ),
      );
      const path = buildWavePath(metrics, currentPhase);

      stage.dataset.waveOrientation = orientation;
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      glowPath.setAttribute("d", path);
      linePath.setAttribute("d", path);
      linePath.style.strokeDashoffset = `${-currentPhase * 40}px`;

      if (layoutChanged || bodies.length !== cards.length) {
        bodies = anchors.map((anchor, index) => {
          const direction = index % 2 === 0 ? 1 : -1;
          return {
            x: anchor.x,
            y: anchor.y,
            vx: orientation === "horizontal" ? direction * 5 : direction * 16,
            vy: orientation === "horizontal" ? direction * 16 : direction * 5,
            radius,
          };
        });
      } else {
        bodies.forEach((body) => {
          body.radius = radius;
          resolveWallCollision(body, width, height);
        });
      }

      return { anchors, width, height };
    }

    function renderBodies() {
      bodies.forEach((body, index) => {
        cards[index].style.transform = `translate3d(${body.x - body.radius}px, ${body.y - body.radius}px, 0)`;
      });
    }

    function renderStatic() {
      const scene = prepareLayout(phase);
      if (!scene) return;
      bodies = scene.anchors.map((anchor, index) => ({
        ...anchor,
        vx: 0,
        vy: 0,
        radius: cards[index].offsetWidth / 2,
      }));
      renderBodies();
    }

    function animate(now: number) {
      const delta = Math.min((now - lastTime) / 1000, 0.04);
      lastTime = now;
      phase += delta * WAVE_SPEED;
      const scene = prepareLayout(phase);

      if (!scene) {
        animationFrame = window.requestAnimationFrame(animate);
        return;
      }

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
      bodies.forEach((body) =>
        resolveWallCollision(body, scene.width, scene.height),
      );
      renderBodies();
      animationFrame = window.requestAnimationFrame(animate);
    }

    function restart() {
      window.cancelAnimationFrame(animationFrame);
      lastTime = performance.now();
      if (reducedMotion.matches) renderStatic();
      else animationFrame = window.requestAnimationFrame(animate);
    }

    const resizeObserver = new ResizeObserver(restart);
    resizeObserver.observe(stage);
    reducedMotion.addEventListener("change", restart);
    window.addEventListener("resize", restart);
    restart();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      reducedMotion.removeEventListener("change", restart);
      window.removeEventListener("resize", restart);
      svg.remove();
      delete stage.dataset.waveFeatureField;
      delete stage.dataset.waveOrientation;
      originalStyles.forEach((style, node) => {
        if (style === null) node.removeAttribute("style");
        else node.setAttribute("style", style);
      });
    };
  }, []);

  return null;
}
