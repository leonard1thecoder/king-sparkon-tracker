"use client";

import { useEffect } from "react";

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
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

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

function rememberStyle(
  node: HTMLElement,
  styles: Map<HTMLElement, string | null>,
) {
  if (!styles.has(node)) styles.set(node, node.getAttribute("style"));
}

export function FeatureCircleEnhancer() {
  useEffect(() => {
    const firstCard = document.querySelector<HTMLElement>("#features article");
    const stageElement = firstCard?.parentElement;
    if (!stageElement || stageElement.dataset.waveFeatureField === "true")
      return;

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

    stage.dataset.waveFeatureField = "true";
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("preserveAspectRatio", "none");
    Object.assign(svg.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      zIndex: "1",
    });

    [glowPath, linePath].forEach((path) => {
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "var(--signal)");
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("stroke-linejoin", "round");
      path.setAttribute("vector-effect", "non-scaling-stroke");
    });
    glowPath.setAttribute("stroke-width", "12");
    glowPath.setAttribute("opacity", connectorVisible ? "0.10" : "0");
    linePath.setAttribute("stroke-width", "3.5");
    linePath.setAttribute("stroke-dasharray", "18 12");
    linePath.setAttribute("opacity", connectorVisible ? "0.82" : "0");
    svg.append(glowPath, linePath);
    stage.prepend(svg);

    function styleCards() {
      const width = stage.clientWidth;
      const vertical = width < DESKTOP_BREAKPOINT;
      const horizontalSpacing =
        cards.length > 1 ? (width - 48) / (cards.length - 1) : width;
      const size = vertical
        ? clamp(width * 0.46, 148, 176)
        : clamp(horizontalSpacing * 0.82, 150, 190);
      const stageHeight = vertical
        ? Math.max(1180, cards.length * (size + 34))
        : 660;
      const compactText = size < 170;

      Object.assign(stage.style, {
        position: "relative",
        display: "block",
        minHeight: `${stageHeight}px`,
        overflow: "hidden",
        borderTop: "1px solid var(--line)",
        borderBottom: "1px solid var(--line)",
        background:
          "radial-gradient(circle at center, var(--signal-soft), white 68%)",
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
          padding: compactText ? "12px" : "18px",
          willChange: "transform",
          boxShadow: "0 18px 45px rgba(14, 165, 233, 0.13)",
          zIndex: "2",
        });

        const icon = card.firstElementChild as HTMLElement | null;
        const title = card.querySelector<HTMLElement>("h3");
        const copy = card.querySelector<HTMLElement>("p");
        const tags = card.querySelector<HTMLElement>("h3 ~ div");
        if (icon) icon.style.borderRadius = "9999px";
        if (title) {
          title.style.marginTop = compactText ? "8px" : "10px";
          title.style.fontSize = compactText ? "0.78rem" : "0.92rem";
          title.style.lineHeight = "1.05rem";
        }
        if (copy) {
          copy.style.marginTop = "5px";
          copy.style.fontSize = compactText ? "0.55rem" : "0.64rem";
          copy.style.lineHeight = compactText ? "0.82rem" : "0.94rem";
        }
        if (tags) {
          tags.style.marginTop = compactText ? "5px" : "8px";
          tags.style.justifyContent = "center";
          tags.querySelectorAll<HTMLElement>("span").forEach((tag) => {
            tag.style.borderRadius = "9999px";
            tag.style.fontSize = compactText ? "0.42rem" : "0.49rem";
            tag.style.padding = compactText ? "2px 5px" : "3px 7px";
          });
        }
      });
    }

    function renderWave(currentPhase: number) {
      styleCards();
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      if (!width || !height) return;

      const maximumRadius = Math.max(
        ...cards.map((card) => card.offsetWidth / 2),
      );
      const metrics = createWaveMetrics(width, height, maximumRadius);
      const path = buildWavePath(metrics, currentPhase);

      stage.dataset.waveOrientation = metrics.orientation;
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      glowPath.setAttribute("d", path);
      linePath.setAttribute("d", path);
      linePath.style.strokeDashoffset = `${-currentPhase * 42}px`;

      cards.forEach((card, index) => {
        const progress = cards.length <= 1 ? 0.5 : index / (cards.length - 1);
        const point = pointOnWave(metrics, progress, currentPhase);
        const radius = card.offsetWidth / 2;
        card.style.transform = `translate3d(${point.x - radius}px, ${point.y - radius}px, 0)`;
      });
    }

    function animate(now: number) {
      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      phase += delta * WAVE_SPEED;
      renderWave(phase);
      animationFrame = window.requestAnimationFrame(animate);
    }

    function restart() {
      window.cancelAnimationFrame(animationFrame);
      lastTime = performance.now();
      renderWave(phase);
      if (!reducedMotion.matches)
        animationFrame = window.requestAnimationFrame(animate);
    }

    const resizeObserver = new ResizeObserver(restart);
    resizeObserver.observe(stage);
    reducedMotion.addEventListener("change", restart);
    restart();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      reducedMotion.removeEventListener("change", restart);
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
