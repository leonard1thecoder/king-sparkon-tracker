"use client";

import Image from "next/image";
import type { PointerEvent } from "react";
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
  ["Scan cycle", "4 passes"],
  ["Hero style", "Circle 3D"],
] as const;

export function ScanLoop() {
  function updateSceneTilt(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;

    const scene = event.currentTarget;
    const bounds = scene.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;

    scene.style.setProperty("--hero-tilt-x", `${((0.5 - y) * 7).toFixed(2)}deg`);
    scene.style.setProperty("--hero-tilt-y", `${((x - 0.5) * 9).toFixed(2)}deg`);
    scene.style.setProperty("--hero-glow-x", `${(x * 100).toFixed(1)}%`);
    scene.style.setProperty("--hero-glow-y", `${(y * 100).toFixed(1)}%`);
  }

  function resetSceneTilt(event: PointerEvent<HTMLDivElement>) {
    const scene = event.currentTarget;
    scene.style.setProperty("--hero-tilt-x", "0deg");
    scene.style.setProperty("--hero-tilt-y", "0deg");
    scene.style.setProperty("--hero-glow-x", "50%");
    scene.style.setProperty("--hero-glow-y", "42%");
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div
        className="hero-3d-scene relative min-h-[35rem] overflow-hidden rounded-[2.65rem] border border-[var(--line)] bg-white shadow-[0_34px_105px_rgba(7,19,31,0.22)] [perspective:1800px] sm:min-h-[43rem]"
        onPointerMove={updateSceneTilt}
        onPointerLeave={resetSceneTilt}
      >
        <div className="hero-scene-halo pointer-events-none absolute left-1/2 top-[44%] h-[72%] w-[84%] -translate-x-1/2 -translate-y-1/2 rounded-full" aria-hidden="true" />
        <div className="hero-scene-ring hero-scene-ring--outer pointer-events-none absolute left-1/2 top-[43%] rounded-full border border-[var(--signal)]/25" aria-hidden="true" />
        <div className="hero-scene-ring hero-scene-ring--inner pointer-events-none absolute left-1/2 top-[43%] rounded-full border border-[var(--gold)]/45" aria-hidden="true" />

        <div className="hero-particle-field pointer-events-none absolute inset-0" aria-hidden="true">
          {Array.from({ length: 10 }).map((_, index) => <span key={index} />)}
        </div>

        <div className="absolute inset-x-4 top-4 z-30 flex items-center justify-between gap-3 sm:inset-x-6 sm:top-6">
          <span className="rounded-full border border-[var(--line)] bg-white/90 px-3 py-2 font-mono text-[0.62rem] font-black uppercase tracking-[0.16em] text-[var(--signal)] shadow-[var(--shadow-soft)] backdrop-blur">
            Circle-based hero restored
          </span>
          <span className="hero-live-pill rounded-full border border-[var(--confirm)]/30 bg-white/90 px-3 py-2 font-mono text-[0.62rem] font-black uppercase tracking-[0.16em] text-[var(--confirm)] shadow-[var(--shadow-soft)] backdrop-blur">
            Live scan loop
          </span>
        </div>

        <div className="hero-scan-stage absolute inset-x-4 bottom-24 top-20 sm:inset-x-8 sm:bottom-28 sm:top-24">
          {heroCards.map((card, index) => (
            <article
              key={card.title}
              className={`hero-scan-card hero-scan-card--${index + 1} absolute inset-0 transform-gpu`}
            >
              <div className="hero-scan-card__shell relative h-full overflow-hidden rounded-[2.2rem] border border-white/80 bg-white/94 p-3 shadow-[0_38px_110px_rgba(7,19,31,0.26)] backdrop-blur-xl">
                <div className="hero-card-specular pointer-events-none absolute inset-0 z-30 overflow-hidden rounded-[2.2rem]" aria-hidden="true" />
                <div className="relative flex h-full flex-col overflow-hidden rounded-[1.85rem] border border-[var(--line)] bg-white">
                  <div className="grid gap-3 border-b border-[var(--line)] p-4 sm:grid-cols-3">
                    {terminalMetrics.map(([label, value], metricIndex) => (
                      <div key={label} className={`hero-metric-card hero-metric-card--${metricIndex + 1} rounded-[1.15rem] border border-[var(--line)] bg-[var(--surface)] p-3`}>
                        <p className="font-mono text-[0.54rem] font-black uppercase tracking-[0.14em] text-[var(--signal)]">{label}</p>
                        <p className="mt-1 text-sm font-black text-[var(--ink)]">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="hero-scan-window relative min-h-0 flex-1 overflow-hidden bg-[radial-gradient(circle_at_50%_38%,rgba(224,242,254,0.95),rgba(255,255,255,0.98)_68%)]">
                    <div className="hero-image-aura pointer-events-none absolute left-1/2 top-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-100/80 blur-3xl" aria-hidden="true" />
                    <Image
                      src={card.imageSrc}
                      alt={card.alt}
                      fill
                      priority={index === 0}
                      unoptimized
                      sizes="(min-width: 1280px) 640px, (min-width: 1024px) 52vw, 94vw"
                      className="hero-3d-image transform-gpu object-contain p-4 [backface-visibility:hidden]"
                    />

                    <div className="hero-orbit hero-orbit--one pointer-events-none absolute left-1/2 top-1/2 z-10 rounded-full border border-[var(--gold)]/45" aria-hidden="true" />
                    <div className="hero-orbit hero-orbit--two pointer-events-none absolute left-1/2 top-1/2 z-10 rounded-full border border-[var(--signal)]/30" aria-hidden="true" />
                    <div className="barcode-scan-beam pointer-events-none absolute left-0 right-0 z-20 h-24 bg-gradient-to-b from-transparent via-sky-400/18 to-transparent" aria-hidden="true" />
                    <div className="barcode-scan-line pointer-events-none absolute left-4 right-4 z-30 h-1 rounded-full bg-[var(--signal)] shadow-[0_0_18px_var(--signal),0_0_48px_var(--signal)]" aria-hidden="true" />
                    <span className="hero-corner hero-corner--tl" aria-hidden="true" />
                    <span className="hero-corner hero-corner--tr" aria-hidden="true" />
                    <span className="hero-corner hero-corner--bl" aria-hidden="true" />
                    <span className="hero-corner hero-corner--br" aria-hidden="true" />

                    <div className="absolute inset-x-0 bottom-0 z-40 bg-gradient-to-t from-white via-white/88 to-transparent px-5 pb-5 pt-16">
                      <p className="font-mono text-[0.6rem] font-black uppercase tracking-[0.18em] text-[var(--signal)]">{card.eyebrow}</p>
                      <p className="mt-2 text-xl font-black tracking-[-0.04em] text-[var(--ink)]">{card.title}</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="hero-floor pointer-events-none absolute bottom-16 left-1/2 h-14 w-[72%] -translate-x-1/2 rounded-[50%] bg-sky-400/12 blur-2xl" aria-hidden="true" />
        <div className="hero-floor-light pointer-events-none absolute bottom-[4.8rem] left-1/2 h-2 w-[54%] -translate-x-1/2 rounded-[50%] bg-[var(--signal)]/45 blur-xl" aria-hidden="true" />
      </div>

      <div className="relative z-20 mt-5 rounded-[1.65rem] border border-[var(--line)] bg-white/92 p-4 shadow-[var(--shadow-soft)] backdrop-blur">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="font-mono text-[0.68rem] font-black uppercase tracking-[0.16em] text-[var(--muted)]">Official profiles</p>
          <span className="rounded-full border border-[var(--signal)]/25 bg-sky-50 px-3 py-1 font-mono text-[0.56rem] font-black uppercase tracking-[0.14em] text-[var(--signal)]">Move pointer to tilt</span>
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
        }

        .hero-scan-stage,
        .hero-scan-card,
        .hero-scan-card__shell {
          transform-style: preserve-3d;
        }

        .hero-scene-halo {
          background: radial-gradient(circle at var(--hero-glow-x) var(--hero-glow-y), rgb(56 189 248 / 0.22), rgb(240 249 255 / 0.76) 42%, transparent 72%);
          filter: blur(22px);
          animation: heroHaloPulse 5.8s ease-in-out infinite;
        }

        .hero-scene-ring {
          width: 82%;
          aspect-ratio: 1;
          transform: translate(-50%, -50%) rotateX(70deg);
        }

        .hero-scene-ring--outer { animation: heroRingSpin 18s linear infinite; }
        .hero-scene-ring--inner { width: 62%; animation: heroRingSpinReverse 13s linear infinite; }

        .hero-particle-field span {
          position: absolute;
          width: 0.42rem;
          height: 0.42rem;
          border-radius: 999px;
          background: var(--signal);
          box-shadow: 0 0 18px rgb(14 165 233 / 0.55);
          animation: heroParticleFloat 7s ease-in-out infinite;
        }

        .hero-particle-field span:nth-child(1) { left: 5%; top: 18%; animation-delay: -1.2s; }
        .hero-particle-field span:nth-child(2) { left: 14%; top: 62%; width: 0.28rem; height: 0.28rem; animation-delay: -3.8s; }
        .hero-particle-field span:nth-child(3) { left: 28%; top: 7%; background: var(--gold); animation-delay: -5.4s; }
        .hero-particle-field span:nth-child(4) { right: 8%; top: 24%; width: 0.3rem; height: 0.3rem; animation-delay: -2.1s; }
        .hero-particle-field span:nth-child(5) { right: 17%; top: 69%; background: var(--gold); animation-delay: -4.6s; }
        .hero-particle-field span:nth-child(6) { right: 31%; top: 10%; width: 0.24rem; height: 0.24rem; animation-delay: -0.8s; }
        .hero-particle-field span:nth-child(7) { left: 3%; top: 42%; animation-delay: -6.1s; }
        .hero-particle-field span:nth-child(8) { right: 3%; top: 48%; animation-delay: -3.1s; }
        .hero-particle-field span:nth-child(9) { left: 21%; top: 83%; width: 0.24rem; height: 0.24rem; animation-delay: -5.8s; }
        .hero-particle-field span:nth-child(10) { right: 24%; top: 86%; background: var(--gold); animation-delay: -1.7s; }

        .hero-scan-card__shell {
          transform: rotateX(var(--hero-tilt-x)) rotateY(var(--hero-tilt-y)) translateZ(0);
          transition: transform 180ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 220ms ease;
          will-change: transform;
        }

        .hero-scan-card--1 { animation: heroShowFirst 18s cubic-bezier(0.76, 0, 0.24, 1) infinite; }
        .hero-scan-card--2 { animation: heroShowSecond 18s cubic-bezier(0.76, 0, 0.24, 1) infinite; }
        .hero-3d-image { animation: heroImageFloat 5.6s ease-in-out infinite; filter: drop-shadow(0 26px 32px rgb(7 19 31 / 0.24)); }
        .hero-image-aura { animation: heroImageAura 4.2s ease-in-out infinite; }
        .hero-metric-card { transform: translateZ(24px); animation: heroMetricFloat 4.8s ease-in-out infinite; }
        .hero-metric-card--2 { animation-delay: -1.6s; }
        .hero-metric-card--3 { animation-delay: -3.2s; }
        .hero-live-pill { animation: heroLivePulse 2.2s ease-in-out infinite; }

        .hero-card-specular::after {
          content: "";
          position: absolute;
          inset: -35% -70%;
          background: linear-gradient(105deg, transparent 38%, rgb(255 255 255 / 0.72) 48%, rgb(186 230 253 / 0.35) 52%, transparent 62%);
          animation: heroCardSpecular 7s ease-in-out infinite;
        }

        .hero-orbit { width: 72%; aspect-ratio: 1; transform: translate(-50%, -50%) rotateX(67deg); }
        .hero-orbit--one { animation: heroInnerOrbit 10s linear infinite; }
        .hero-orbit--two { width: 56%; animation: heroInnerOrbitReverse 7s linear infinite; }

        .barcode-scan-line,
        .barcode-scan-beam { top: -6rem; animation: barcodeLineDown 2s cubic-bezier(0.22, 1, 0.36, 1) infinite; }
        .barcode-scan-beam { animation-name: barcodeBeamDown; }

        .hero-corner {
          position: absolute;
          z-index: 30;
          width: 2rem;
          height: 2rem;
          color: var(--signal);
          opacity: 0.72;
          animation: heroCornerPulse 2s ease-in-out infinite;
        }

        .hero-corner--tl { left: 1rem; top: 1rem; border-left: 2px solid; border-top: 2px solid; border-radius: 0.6rem 0 0 0; }
        .hero-corner--tr { right: 1rem; top: 1rem; border-right: 2px solid; border-top: 2px solid; border-radius: 0 0.6rem 0 0; }
        .hero-corner--bl { left: 1rem; bottom: 1rem; border-left: 2px solid; border-bottom: 2px solid; border-radius: 0 0 0 0.6rem; }
        .hero-corner--br { right: 1rem; bottom: 1rem; border-right: 2px solid; border-bottom: 2px solid; border-radius: 0 0 0.6rem 0; }

        .hero-floor { animation: heroFloorShadow 5.6s ease-in-out infinite; }
        .hero-floor-light { animation: heroFloorLight 3.8s ease-in-out infinite; }

        @keyframes heroShowFirst {
          0%, 43% { opacity: 1; filter: blur(0); transform: translate3d(0, 0, 42px) scale(1); z-index: 2; }
          48%, 94% { opacity: 0; filter: blur(8px); transform: translate3d(-2rem, 1rem, -100px) rotateY(-8deg) scale(0.95); z-index: 1; }
          100% { opacity: 1; filter: blur(0); transform: translate3d(0, 0, 42px) scale(1); z-index: 2; }
        }

        @keyframes heroShowSecond {
          0%, 43% { opacity: 0; filter: blur(8px); transform: translate3d(2rem, 1rem, -100px) rotateY(8deg) scale(0.95); z-index: 1; }
          48%, 94% { opacity: 1; filter: blur(0); transform: translate3d(0, 0, 42px) scale(1); z-index: 2; }
          100% { opacity: 0; filter: blur(8px); transform: translate3d(2rem, 1rem, -100px) rotateY(8deg) scale(0.95); z-index: 1; }
        }

        @keyframes barcodeLineDown {
          0% { opacity: 0; top: -1.5rem; transform: scaleX(0.72); }
          8% { opacity: 1; top: -0.4rem; transform: scaleX(1); }
          78% { opacity: 1; top: calc(100% - 0.4rem); transform: scaleX(1); }
          100% { opacity: 0; top: calc(100% + 1.5rem); transform: scaleX(0.72); }
        }

        @keyframes barcodeBeamDown {
          0% { opacity: 0; top: -6rem; }
          12% { opacity: 0.78; top: -3rem; }
          78% { opacity: 0.66; top: calc(100% - 4rem); }
          100% { opacity: 0; top: calc(100% + 1rem); }
        }

        @keyframes heroImageFloat { 0%, 100% { transform: translate3d(0, 0.4%, 0) rotateY(-1deg) scale(1); } 50% { transform: translate3d(0, -2%, 24px) rotateY(1.6deg) scale(1.025); } }
        @keyframes heroImageAura { 0%, 100% { opacity: 0.45; transform: translate(-50%, -50%) scale(0.92); } 50% { opacity: 0.9; transform: translate(-50%, -50%) scale(1.08); } }
        @keyframes heroMetricFloat { 0%, 100% { transform: translate3d(0, 0, 24px); } 50% { transform: translate3d(0, -5px, 36px); } }
        @keyframes heroLivePulse { 0%, 100% { box-shadow: 0 0 0 0 rgb(28 124 84 / 0); } 50% { box-shadow: 0 0 0 7px rgb(28 124 84 / 0.08), 0 0 22px rgb(28 124 84 / 0.18); } }
        @keyframes heroCardSpecular { 0%, 18% { opacity: 0; transform: translateX(-45%) rotate(4deg); } 32% { opacity: 0.72; } 58% { opacity: 0.16; } 75%, 100% { opacity: 0; transform: translateX(45%) rotate(4deg); } }
        @keyframes heroHaloPulse { 0%, 100% { opacity: 0.62; transform: translate(-50%, -50%) scale(0.94); } 50% { opacity: 0.95; transform: translate(-50%, -50%) scale(1.06); } }
        @keyframes heroRingSpin { to { transform: translate(-50%, -50%) rotateX(70deg) rotateZ(360deg); } }
        @keyframes heroRingSpinReverse { to { transform: translate(-50%, -50%) rotateX(70deg) rotateZ(-360deg); } }
        @keyframes heroInnerOrbit { to { transform: translate(-50%, -50%) rotateX(67deg) rotateZ(360deg); } }
        @keyframes heroInnerOrbitReverse { to { transform: translate(-50%, -50%) rotateX(67deg) rotateZ(-360deg); } }
        @keyframes heroParticleFloat { 0%, 100% { opacity: 0.18; transform: translate3d(0, 0, -20px) scale(0.7); } 50% { opacity: 0.88; transform: translate3d(0, -1.7rem, 45px) scale(1.2); } }
        @keyframes heroCornerPulse { 0%, 100% { opacity: 0.44; transform: scale(0.96); } 50% { opacity: 0.9; transform: scale(1.04); } }
        @keyframes heroFloorShadow { 0%, 100% { opacity: 0.58; transform: translateX(-50%) scaleX(0.92); } 50% { opacity: 0.34; transform: translateX(-50%) scaleX(1.04); } }
        @keyframes heroFloorLight { 0%, 100% { opacity: 0.28; transform: translateX(-50%) scaleX(0.86); } 50% { opacity: 0.72; transform: translateX(-50%) scaleX(1.06); } }

        @media (max-width: 640px) {
          .hero-scene-ring { width: 98%; }
          .hero-scene-ring--inner { width: 74%; }
          .hero-particle-field span:nth-child(n + 7) { display: none; }
          .hero-scan-card__shell { transform: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-scan-card--1 { opacity: 1; transform: none; }
          .hero-scan-card--2 { display: none; }
          .hero-3d-scene * { animation: none !important; }
          .hero-scan-card__shell { transform: none !important; }
        }
      `}</style>
    </div>
  );
}
