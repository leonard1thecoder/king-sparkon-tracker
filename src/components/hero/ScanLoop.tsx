"use client";

import Image from "next/image";
import { useEffect, useRef, type PointerEvent } from "react";
import { SocialLinks } from "@/components/social/SocialLinks";

const heroCards = [
  {
    imageSrc:
      "https://veizbtzugssszhxabzrv.supabase.co/storage/v1/object/public/king-sparkon-logo/ChatGPT%20Image%20Jun%2029,%202026,%2001_23_49%20PM.png",
    eyebrow: "King Sparkon brand terminal",
    title: "Present King Sparkon Lego",
    alt: "King Sparkon Tracker 3D Lego barcode visual",
  },
  {
    imageSrc:
      "https://veizbtzugssszhxabzrv.supabase.co/storage/v1/object/public/king-sparkon-logo/XSX.png",
    eyebrow: "Sizolwakhe Leonard Mthimunye",
    title: "Present King Sparkon",
    alt: "Sizolwakhe Leonard Mthimunye King Sparkon 3D visual",
  },
] as const;

const terminalMetrics = [
  ["Identity", "King Sparkon"],
  ["Scan cycle", "Smooth pass"],
  ["Hero style", "Lightweight 3D"],
] as const;

type PointerSample = {
  scene: HTMLDivElement;
  x: number;
  y: number;
};

export function ScanLoop() {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const pointerFrameRef = useRef(0);
  const pointerSampleRef = useRef<PointerSample | null>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    let isNearViewport = true;
    let pageIsVisible = document.visibilityState === "visible";

    function syncPlayback() {
      scene.dataset.heroMotion =
        isNearViewport && pageIsVisible ? "running" : "paused";
    }

    function handleVisibilityChange() {
      pageIsVisible = document.visibilityState === "visible";
      syncPlayback();
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        isNearViewport = entry?.isIntersecting ?? false;
        syncPlayback();
      },
      {
        rootMargin: "160px 0px",
        threshold: 0.01,
      },
    );

    observer.observe(scene);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    syncPlayback();

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.cancelAnimationFrame(pointerFrameRef.current);
    };
  }, []);

  function updateSceneTilt(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;

    const scene = event.currentTarget;
    const bounds = scene.getBoundingClientRect();
    pointerSampleRef.current = {
      scene,
      x: (event.clientX - bounds.left) / bounds.width,
      y: (event.clientY - bounds.top) / bounds.height,
    };

    if (pointerFrameRef.current) return;
    pointerFrameRef.current = window.requestAnimationFrame(() => {
      pointerFrameRef.current = 0;
      const sample = pointerSampleRef.current;
      if (!sample) return;

      sample.scene.style.setProperty(
        "--hero-tilt-x",
        `${((0.5 - sample.y) * 4.5).toFixed(2)}deg`,
      );
      sample.scene.style.setProperty(
        "--hero-tilt-y",
        `${((sample.x - 0.5) * 6).toFixed(2)}deg`,
      );
      sample.scene.style.setProperty(
        "--hero-glow-x",
        `${(sample.x * 100).toFixed(1)}%`,
      );
      sample.scene.style.setProperty(
        "--hero-glow-y",
        `${(sample.y * 100).toFixed(1)}%`,
      );
    });
  }

  function resetSceneTilt(event: PointerEvent<HTMLDivElement>) {
    pointerSampleRef.current = null;
    window.cancelAnimationFrame(pointerFrameRef.current);
    pointerFrameRef.current = 0;

    const scene = event.currentTarget;
    scene.style.setProperty("--hero-tilt-x", "0deg");
    scene.style.setProperty("--hero-tilt-y", "0deg");
    scene.style.setProperty("--hero-glow-x", "50%");
    scene.style.setProperty("--hero-glow-y", "42%");
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div
        ref={sceneRef}
        data-hero-motion="paused"
        className="hero-3d-scene relative min-h-[35rem] overflow-hidden rounded-[2.65rem] border border-[var(--line)] bg-white shadow-[0_28px_80px_rgba(7,19,31,0.18)] [perspective:1600px] sm:min-h-[43rem]"
        onPointerMove={updateSceneTilt}
        onPointerLeave={resetSceneTilt}
      >
        <div
          className="hero-scene-halo pointer-events-none absolute left-1/2 top-[44%] h-[72%] w-[84%] -translate-x-1/2 -translate-y-1/2 rounded-full"
          aria-hidden="true"
        />
        <div
          className="hero-scene-ring hero-scene-ring--outer pointer-events-none absolute left-1/2 top-[43%] rounded-full border border-[var(--signal)]/25"
          aria-hidden="true"
        />
        <div
          className="hero-scene-ring hero-scene-ring--inner pointer-events-none absolute left-1/2 top-[43%] rounded-full border border-[var(--gold)]/45"
          aria-hidden="true"
        />

        <div
          className="hero-particle-field pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <span key={index} />
          ))}
        </div>

        <div className="absolute inset-x-4 top-4 z-30 flex items-center justify-between gap-3 sm:inset-x-6 sm:top-6">
          <span className="rounded-full border border-[var(--line)] bg-white/95 px-3 py-2 font-mono text-[0.62rem] font-black uppercase tracking-[0.16em] text-[var(--signal)] shadow-[var(--shadow-soft)]">
            Circle-based hero
          </span>
          <span className="rounded-full border border-[var(--confirm)]/30 bg-white/95 px-3 py-2 font-mono text-[0.62rem] font-black uppercase tracking-[0.16em] text-[var(--confirm)] shadow-[var(--shadow-soft)]">
            Smooth scan loop
          </span>
        </div>

        <div className="hero-scan-stage absolute inset-x-4 bottom-24 top-20 sm:inset-x-8 sm:bottom-28 sm:top-24">
          {heroCards.map((card, index) => (
            <article
              key={card.title}
              className={`hero-scan-card hero-scan-card--${index + 1} absolute inset-0 transform-gpu`}
            >
              <div className="hero-scan-card__shell relative h-full overflow-hidden rounded-[2.2rem] border border-white/80 bg-white p-3 shadow-[0_30px_82px_rgba(7,19,31,0.2)]">
                <div className="relative flex h-full flex-col overflow-hidden rounded-[1.85rem] border border-[var(--line)] bg-white">
                  <div className="grid gap-3 border-b border-[var(--line)] p-4 sm:grid-cols-3">
                    {terminalMetrics.map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-[1.15rem] border border-[var(--line)] bg-[var(--surface)] p-3"
                      >
                        <p className="font-mono text-[0.54rem] font-black uppercase tracking-[0.14em] text-[var(--signal)]">
                          {label}
                        </p>
                        <p className="mt-1 text-sm font-black text-[var(--ink)]">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="hero-scan-window relative min-h-0 flex-1 overflow-hidden bg-[radial-gradient(circle_at_50%_38%,rgba(224,242,254,0.95),rgba(255,255,255,0.98)_68%)]">
                    <div
                      className="hero-image-aura pointer-events-none absolute left-1/2 top-1/2 h-[66%] w-[66%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                      aria-hidden="true"
                    />
                    <Image
                      src={card.imageSrc}
                      alt={card.alt}
                      fill
                      priority={index === 0}
                      unoptimized
                      sizes="(min-width: 1280px) 640px, (min-width: 1024px) 52vw, 94vw"
                      className="hero-3d-image transform-gpu object-contain p-4 [backface-visibility:hidden]"
                    />

                    <div
                      className="hero-orbit pointer-events-none absolute left-1/2 top-1/2 z-10 rounded-full border border-[var(--gold)]/45"
                      aria-hidden="true"
                    />
                    <div
                      className="barcode-scan-line pointer-events-none absolute left-4 right-4 top-0 z-30 h-1 rounded-full bg-[var(--signal)] shadow-[0_0_18px_rgba(14,165,233,0.8)]"
                      aria-hidden="true"
                    />
                    <span className="hero-corner hero-corner--tl" aria-hidden="true" />
                    <span className="hero-corner hero-corner--tr" aria-hidden="true" />
                    <span className="hero-corner hero-corner--bl" aria-hidden="true" />
                    <span className="hero-corner hero-corner--br" aria-hidden="true" />

                    <div className="absolute inset-x-0 bottom-0 z-40 bg-gradient-to-t from-white via-white/88 to-transparent px-5 pb-5 pt-16">
                      <p className="font-mono text-[0.6rem] font-black uppercase tracking-[0.18em] text-[var(--signal)]">
                        {card.eyebrow}
                      </p>
                      <p className="mt-2 text-xl font-black tracking-[-0.04em] text-[var(--ink)]">
                        {card.title}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div
          className="hero-floor pointer-events-none absolute bottom-[4.4rem] left-1/2 h-8 w-[58%] -translate-x-1/2 rounded-[50%] bg-sky-400/14 shadow-[0_0_34px_rgba(14,165,233,0.2)]"
          aria-hidden="true"
        />
      </div>

      <div className="relative z-20 mt-5 rounded-[1.65rem] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-soft)]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="font-mono text-[0.68rem] font-black uppercase tracking-[0.16em] text-[var(--muted)]">
            Official profiles
          </p>
          <span className="rounded-full border border-[var(--signal)]/25 bg-sky-50 px-3 py-1 font-mono text-[0.56rem] font-black uppercase tracking-[0.14em] text-[var(--signal)]">
            Move pointer to tilt
          </span>
        </div>
        <SocialLinks variant="light" />
      </div>

      <style jsx global>{`
        .hero-3d-scene {
          --hero-tilt-x: 0deg;
          --hero-tilt-y: 0deg;
          --hero-glow-x: 50%;
          --hero-glow-y: 42%;
          isolation: isolate;
          contain: layout paint style;
        }

        .hero-3d-scene[data-hero-motion="paused"] *,
        .hero-3d-scene[data-hero-motion="paused"] *::before,
        .hero-3d-scene[data-hero-motion="paused"] *::after {
          animation-play-state: paused !important;
        }

        .hero-scan-stage,
        .hero-scan-card,
        .hero-scan-card__shell {
          transform-style: preserve-3d;
        }

        .hero-scene-halo {
          background: radial-gradient(
            circle at var(--hero-glow-x) var(--hero-glow-y),
            rgb(56 189 248 / 0.22),
            rgb(240 249 255 / 0.78) 44%,
            transparent 73%
          );
          animation: heroHaloPulse 7.5s ease-in-out infinite;
        }

        .hero-scene-ring {
          width: 82%;
          aspect-ratio: 1;
          transform: translate(-50%, -50%) rotateX(70deg);
        }

        .hero-scene-ring--outer {
          animation: heroRingSpin 26s linear infinite;
        }

        .hero-scene-ring--inner {
          width: 62%;
          opacity: 0.72;
        }

        .hero-particle-field span {
          position: absolute;
          width: 0.34rem;
          height: 0.34rem;
          border-radius: 999px;
          background: var(--signal);
          box-shadow: 0 0 14px rgb(14 165 233 / 0.42);
          animation: heroParticleFloat 9s ease-in-out infinite;
        }

        .hero-particle-field span:nth-child(1) { left: 7%; top: 19%; animation-delay: -1.2s; }
        .hero-particle-field span:nth-child(2) { left: 15%; top: 66%; width: 0.24rem; height: 0.24rem; animation-delay: -4.1s; }
        .hero-particle-field span:nth-child(3) { left: 30%; top: 8%; background: var(--gold); animation-delay: -6.2s; }
        .hero-particle-field span:nth-child(4) { right: 9%; top: 25%; width: 0.26rem; height: 0.26rem; animation-delay: -2.6s; }
        .hero-particle-field span:nth-child(5) { right: 18%; top: 72%; background: var(--gold); animation-delay: -5.3s; }
        .hero-particle-field span:nth-child(6) { right: 31%; top: 11%; width: 0.22rem; height: 0.22rem; animation-delay: -0.9s; }

        .hero-scan-card__shell {
          transform: rotateX(var(--hero-tilt-x)) rotateY(var(--hero-tilt-y)) translateZ(0);
          transition: transform 320ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .hero-3d-scene[data-hero-motion="running"] .hero-scan-card__shell {
          will-change: transform;
        }

        .hero-scan-card--1 {
          animation: heroShowFirst 22s cubic-bezier(0.65, 0, 0.35, 1) infinite;
        }

        .hero-scan-card--2 {
          animation: heroShowSecond 22s cubic-bezier(0.65, 0, 0.35, 1) infinite;
        }

        .hero-3d-image {
          animation: heroImageFloat 7.2s ease-in-out infinite;
        }

        .hero-image-aura {
          background: radial-gradient(circle, rgb(186 230 253 / 0.72), transparent 68%);
        }

        .hero-orbit {
          width: 68%;
          aspect-ratio: 1;
          transform: translate(-50%, -50%) rotateX(67deg);
          animation: heroInnerOrbit 17s linear infinite;
        }

        .barcode-scan-line {
          animation: barcodeLineDown 3.4s cubic-bezier(0.22, 1, 0.36, 1) infinite;
        }

        .hero-corner {
          position: absolute;
          z-index: 30;
          width: 2rem;
          height: 2rem;
          color: var(--signal);
          opacity: 0.72;
        }

        .hero-corner--tl { left: 1rem; top: 1rem; border-left: 2px solid; border-top: 2px solid; border-radius: 0.6rem 0 0 0; }
        .hero-corner--tr { right: 1rem; top: 1rem; border-right: 2px solid; border-top: 2px solid; border-radius: 0 0.6rem 0 0; }
        .hero-corner--bl { left: 1rem; bottom: 1rem; border-left: 2px solid; border-bottom: 2px solid; border-radius: 0 0 0 0.6rem; }
        .hero-corner--br { right: 1rem; bottom: 1rem; border-right: 2px solid; border-bottom: 2px solid; border-radius: 0 0 0.6rem 0; }

        @keyframes heroShowFirst {
          0%, 45% {
            opacity: 1;
            transform: translate3d(0, 0, 36px) scale(1);
            z-index: 2;
          }
          52%, 94% {
            opacity: 0;
            transform: translate3d(-1.15rem, 0.5rem, -54px) rotateY(-4deg) scale(0.975);
            z-index: 1;
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 36px) scale(1);
            z-index: 2;
          }
        }

        @keyframes heroShowSecond {
          0%, 45% {
            opacity: 0;
            transform: translate3d(1.15rem, 0.5rem, -54px) rotateY(4deg) scale(0.975);
            z-index: 1;
          }
          52%, 94% {
            opacity: 1;
            transform: translate3d(0, 0, 36px) scale(1);
            z-index: 2;
          }
          100% {
            opacity: 0;
            transform: translate3d(1.15rem, 0.5rem, -54px) rotateY(4deg) scale(0.975);
            z-index: 1;
          }
        }

        @keyframes barcodeLineDown {
          0% {
            opacity: 0;
            transform: translate3d(0, -2rem, 0) scaleX(0.78);
          }
          12% {
            opacity: 0.95;
          }
          82% {
            opacity: 0.9;
          }
          100% {
            opacity: 0;
            transform: translate3d(0, calc(100% + 31rem), 0) scaleX(0.78);
          }
        }

        @keyframes heroImageFloat {
          0%, 100% {
            transform: translate3d(0, 0.3%, 0) rotateY(-0.6deg) scale(1);
          }
          50% {
            transform: translate3d(0, -1.2%, 16px) rotateY(0.8deg) scale(1.012);
          }
        }

        @keyframes heroHaloPulse {
          0%, 100% {
            opacity: 0.66;
            transform: translate(-50%, -50%) scale(0.97);
          }
          50% {
            opacity: 0.94;
            transform: translate(-50%, -50%) scale(1.03);
          }
        }

        @keyframes heroRingSpin {
          to {
            transform: translate(-50%, -50%) rotateX(70deg) rotateZ(360deg);
          }
        }

        @keyframes heroInnerOrbit {
          to {
            transform: translate(-50%, -50%) rotateX(67deg) rotateZ(360deg);
          }
        }

        @keyframes heroParticleFloat {
          0%, 100% {
            opacity: 0.2;
            transform: translate3d(0, 0, 0) scale(0.8);
          }
          50% {
            opacity: 0.78;
            transform: translate3d(0, -1.1rem, 18px) scale(1.08);
          }
        }

        @media (max-width: 640px) {
          .hero-scene-ring { width: 96%; }
          .hero-scene-ring--inner { width: 72%; }
          .hero-particle-field span:nth-child(n + 5) { display: none; }
          .hero-scan-card__shell { transform: none; }
          .hero-orbit { animation-duration: 24s; }
        }

        @media (prefers-reduced-motion: reduce), (update: slow) {
          .hero-scan-card--1 { opacity: 1; transform: none; }
          .hero-scan-card--2 { display: none; }
          .hero-3d-scene * { animation: none !important; }
          .hero-scan-card__shell { transform: none !important; }
        }
      `}</style>
    </div>
  );
}
