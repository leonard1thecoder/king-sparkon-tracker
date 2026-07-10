"use client";

import Image from "next/image";
import type { PointerEvent } from "react";
import { SocialLinks } from "@/components/social/SocialLinks";

const HERO_3D_IMAGE =
  "https://veizbtzugssszhxabzrv.supabase.co/storage/v1/object/public/king-sparkon-logo/ChatGPT%20Image%20Jun%2029,%202026,%2001_23_49%20PM.png";

const SECOND_3D_IMAGE =
  "https://veizbtzugssszhxabzrv.supabase.co/storage/v1/object/public/king-sparkon-logo/XSX.png";

const previewTerminalMetrics = [
  ["Brand logo", "LEGO"],
  ["Scan sweep", "4x"],
  ["Hero view", "4K"],
] as const;

type TerminalCardProps = {
  imageSrc: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  overlayEyebrow: string;
  overlayTitle: string;
  cardClassName: string;
};

function ScanTerminalCard({ imageSrc, eyebrow, title, subtitle, overlayEyebrow, overlayTitle, cardClassName }: TerminalCardProps) {
  return (
    <div className={`hero-scan-card absolute inset-0 ${cardClassName}`}>
      <div className="hero-scan-card__shell relative rounded-[2.35rem] border border-white/70 bg-white/92 p-3 shadow-[0_38px_110px_rgba(7,19,31,0.28)] backdrop-blur-xl">
        <div className="hero-card-edge hero-card-edge--left" aria-hidden="true" />
        <div className="hero-card-edge hero-card-edge--right" aria-hidden="true" />
        <div className="hero-card-specular pointer-events-none absolute inset-0 z-30 overflow-hidden rounded-[2.35rem]" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-x-8 top-2 z-20 h-6 rounded-full bg-gradient-to-b from-white via-white/75 to-transparent blur-[1px]" aria-hidden="true" />

        <div className="relative overflow-hidden rounded-[1.95rem] border border-white/12 bg-[var(--ink)] scan-grid">
          <div className="hero-terminal-glow pointer-events-none absolute inset-0" aria-hidden="true" />

          <div className="relative z-10 flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
            <div>
              <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[var(--gold)]">{eyebrow}</p>
              <p className="mt-1 text-sm font-semibold text-white/62">{subtitle}</p>
            </div>
            <span className="hero-live-pill rounded-full border border-[var(--confirm)]/40 bg-[var(--confirm)]/20 px-3 py-1 text-xs font-black text-white">4 scans</span>
          </div>

          <div className="relative z-10 grid gap-4 p-5">
            <div className="grid gap-3 sm:grid-cols-3">
              {previewTerminalMetrics.map(([label, value], index) => (
                <div key={label} className={`hero-metric-card hero-metric-card--${index + 1} rounded-[1.25rem] border border-white/10 bg-white/[0.065] p-3 shadow-[var(--shadow-soft)] backdrop-blur-md`}>
                  <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-white/38">{label}</p>
                  <p className="money mt-1 text-lg font-black text-white">{value}</p>
                </div>
              ))}
            </div>

            <div className="hero-scan-display relative mx-auto my-3 w-full overflow-hidden rounded-[1.9rem] border border-white/18 bg-[var(--ink)] text-white shadow-[0_32px_95px_rgba(0,0,0,0.46)]">
              <div className="hero-scan-window relative aspect-square w-full overflow-hidden bg-[radial-gradient(circle_at_50%_38%,rgba(255,210,90,0.24),rgba(7,19,31,0.98)_64%)]">
                <div className="hero-image-aura pointer-events-none absolute left-1/2 top-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--gold)]/16 blur-3xl" aria-hidden="true" />
                <Image
                  src={imageSrc}
                  alt={title}
                  fill
                  priority
                  unoptimized
                  sizes="(min-width: 1280px) 640px, (min-width: 1024px) 52vw, 94vw"
                  className="hero-3d-image transform-gpu object-contain [backface-visibility:hidden] [image-rendering:auto]"
                />

                <div className="hero-orbit hero-orbit--one pointer-events-none absolute left-1/2 top-1/2 z-10 rounded-full border border-[var(--gold)]/24" aria-hidden="true" />
                <div className="hero-orbit hero-orbit--two pointer-events-none absolute left-1/2 top-1/2 z-10 rounded-full border border-[var(--signal)]/22" aria-hidden="true" />
                <div className="logo-reflection-wick pointer-events-none absolute inset-0 z-10" aria-hidden="true" />
                <div className="barcode-scan-beam pointer-events-none absolute left-0 right-0 z-20 h-28 bg-gradient-to-b from-transparent via-[var(--signal)]/20 to-transparent" aria-hidden="true" />
                <div className="barcode-scan-line pointer-events-none absolute left-4 right-4 z-30 h-1.5 rounded-full bg-[var(--signal)] shadow-[0_0_22px_var(--signal),0_0_60px_var(--signal)]" aria-hidden="true" />
                <div className="barcode-scan-line barcode-scan-line--echo pointer-events-none absolute left-10 right-10 z-20 h-px bg-white/65" aria-hidden="true" />
                <div className="pointer-events-none absolute left-4 right-4 top-0 z-20 h-full border-x border-[var(--signal)]/18" aria-hidden="true" />

                <span className="hero-corner hero-corner--tl" aria-hidden="true" />
                <span className="hero-corner hero-corner--tr" aria-hidden="true" />
                <span className="hero-corner hero-corner--bl" aria-hidden="true" />
                <span className="hero-corner hero-corner--br" aria-hidden="true" />
              </div>

              <div className="absolute inset-x-0 bottom-0 z-40 bg-gradient-to-t from-[rgba(7,19,31,0.96)] via-[rgba(7,19,31,0.58)] to-transparent px-5 pb-5 pt-16 text-white">
                <p className="font-mono text-[0.62rem] font-black uppercase tracking-[0.18em] text-[var(--gold)]">{overlayEyebrow}</p>
                <p className="mt-2 text-xl font-black tracking-[-0.04em]">{overlayTitle}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ScanLoop() {
  function updateSceneTilt(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;

    const scene = event.currentTarget;
    const bounds = scene.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    const tiltY = (x - 0.5) * 10;
    const tiltX = (0.5 - y) * 8;

    scene.style.setProperty("--hero-tilt-x", `${tiltX.toFixed(2)}deg`);
    scene.style.setProperty("--hero-tilt-y", `${tiltY.toFixed(2)}deg`);
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
    <div
      className="hero-3d-scene relative mx-auto w-full max-w-2xl [perspective:1800px]"
      onPointerMove={updateSceneTilt}
      onPointerLeave={resetSceneTilt}
    >
      <div className="hero-scene-halo pointer-events-none absolute left-1/2 top-[45%] h-[72%] w-[84%] -translate-x-1/2 -translate-y-1/2 rounded-full" aria-hidden="true" />
      <div className="hero-scene-ring hero-scene-ring--outer pointer-events-none absolute left-1/2 top-[42%] rounded-full border border-[var(--gold)]/25" aria-hidden="true" />
      <div className="hero-scene-ring hero-scene-ring--inner pointer-events-none absolute left-1/2 top-[42%] rounded-full border border-[var(--signal)]/22" aria-hidden="true" />

      <div className="hero-particle-field pointer-events-none absolute inset-0" aria-hidden="true">
        {Array.from({ length: 10 }).map((_, index) => <span key={index} />)}
      </div>

      <div className="hero-scan-stage relative min-h-[36rem] sm:min-h-[44rem] lg:min-h-[47rem]">
        <ScanTerminalCard
          imageSrc={HERO_3D_IMAGE}
          eyebrow="King Sparkon brand terminal"
          subtitle="Barcode line scans down 4 times"
          title="King Sparkon Tracker"
          overlayEyebrow="King Sparkon Lego"
          overlayTitle="Present King Sparkon Lego"
          cardClassName="hero-scan-card--first"
        />
        <ScanTerminalCard
          imageSrc={SECOND_3D_IMAGE}
          eyebrow="King Sparkon second terminal"
          subtitle="Second card scans down 4 times"
          title="Sizolwakhe Leonard Mthimunye"
          overlayEyebrow="Sizolwakhe Leonard Mthimunye"
          overlayTitle="Present King Sparkon"
          cardClassName="hero-scan-card--second"
        />
      </div>

      <div className="hero-floor pointer-events-none absolute bottom-[7rem] left-1/2 h-16 w-[76%] -translate-x-1/2 rounded-[50%] bg-[var(--ink)]/24 blur-2xl" aria-hidden="true" />
      <div className="hero-floor-light pointer-events-none absolute bottom-[8.5rem] left-1/2 h-3 w-[58%] -translate-x-1/2 rounded-[50%] bg-[var(--gold)]/60 blur-xl" aria-hidden="true" />

      <div className="relative z-20 mt-10 rounded-[1.65rem] border border-[var(--line)] bg-white/88 p-4 shadow-[var(--shadow-soft)] backdrop-blur">
        <p className="mb-3 font-mono text-[0.68rem] font-black uppercase tracking-[0.16em] text-[var(--muted)]">Official profiles</p>
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

        .hero-scan-stage {
          transform-style: preserve-3d;
        }

        .hero-scene-halo {
          background: radial-gradient(circle at var(--hero-glow-x) var(--hero-glow-y), rgba(255, 190, 86, 0.4), rgba(74, 169, 223, 0.14) 38%, transparent 70%);
          filter: blur(22px);
          animation: heroHaloPulse 5.8s ease-in-out infinite;
        }

        .hero-scene-ring {
          width: 80%;
          aspect-ratio: 1;
          transform: translate(-50%, -50%) rotateX(72deg) rotateZ(0deg);
          transform-style: preserve-3d;
        }

        .hero-scene-ring--outer {
          animation: heroRingSpin 18s linear infinite;
          box-shadow: inset 0 0 40px rgba(255, 179, 107, 0.08), 0 0 40px rgba(255, 179, 107, 0.08);
        }

        .hero-scene-ring--inner {
          width: 61%;
          animation: heroRingSpinReverse 13s linear infinite;
          box-shadow: inset 0 0 34px rgba(74, 169, 223, 0.08), 0 0 34px rgba(74, 169, 223, 0.08);
        }

        .hero-particle-field span {
          position: absolute;
          display: block;
          width: 0.42rem;
          height: 0.42rem;
          border-radius: 999px;
          background: var(--gold);
          box-shadow: 0 0 18px rgba(255, 179, 107, 0.8);
          animation: heroParticleFloat 7s ease-in-out infinite;
        }

        .hero-particle-field span:nth-child(1) { left: 5%; top: 18%; animation-delay: -1.2s; }
        .hero-particle-field span:nth-child(2) { left: 14%; top: 62%; width: 0.28rem; height: 0.28rem; animation-delay: -3.8s; }
        .hero-particle-field span:nth-child(3) { left: 28%; top: 7%; background: var(--signal); animation-delay: -5.4s; }
        .hero-particle-field span:nth-child(4) { right: 8%; top: 24%; width: 0.3rem; height: 0.3rem; animation-delay: -2.1s; }
        .hero-particle-field span:nth-child(5) { right: 17%; top: 69%; background: var(--signal); animation-delay: -4.6s; }
        .hero-particle-field span:nth-child(6) { right: 31%; top: 10%; width: 0.24rem; height: 0.24rem; animation-delay: -0.8s; }
        .hero-particle-field span:nth-child(7) { left: 3%; top: 42%; background: var(--signal); animation-delay: -6.1s; }
        .hero-particle-field span:nth-child(8) { right: 3%; top: 48%; animation-delay: -3.1s; }
        .hero-particle-field span:nth-child(9) { left: 21%; top: 83%; width: 0.24rem; height: 0.24rem; animation-delay: -5.8s; }
        .hero-particle-field span:nth-child(10) { right: 24%; top: 86%; background: var(--signal); animation-delay: -1.7s; }

        .hero-scan-card {
          backface-visibility: hidden;
          transform-style: preserve-3d;
          will-change: opacity, filter, transform;
        }

        .hero-scan-card__shell {
          transform: rotateX(var(--hero-tilt-x)) rotateY(var(--hero-tilt-y)) translateZ(0);
          transform-style: preserve-3d;
          transition: transform 180ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 220ms ease;
          will-change: transform;
        }

        .hero-3d-scene:hover .hero-scan-card__shell {
          box-shadow: 0 48px 130px rgba(7, 19, 31, 0.34);
        }

        .hero-card-edge {
          position: absolute;
          top: 2.2rem;
          bottom: 2.2rem;
          width: 1rem;
          border-radius: 999px;
          background: linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,179,107,0.28), rgba(74,169,223,0.2));
          filter: blur(0.2px);
          opacity: 0.72;
          transform: translateZ(-18px);
        }

        .hero-card-edge--left { left: -0.45rem; }
        .hero-card-edge--right { right: -0.45rem; }

        .hero-card-specular::after {
          content: "";
          position: absolute;
          inset: -35% -70%;
          background: linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.42) 48%, rgba(255,217,102,0.2) 52%, transparent 62%);
          transform: translateX(-45%) rotate(4deg);
          animation: heroCardSpecular 7s ease-in-out infinite;
        }

        .hero-terminal-glow {
          background: radial-gradient(circle at var(--hero-glow-x) var(--hero-glow-y), rgba(255, 179, 107, 0.15), transparent 34%);
          mix-blend-mode: screen;
        }

        .hero-live-pill {
          animation: heroLivePulse 2.2s ease-in-out infinite;
        }

        .hero-metric-card {
          transform: translateZ(26px);
          animation: heroMetricFloat 4.8s ease-in-out infinite;
        }

        .hero-metric-card--2 { animation-delay: -1.6s; }
        .hero-metric-card--3 { animation-delay: -3.2s; }

        .hero-scan-display {
          transform: translateZ(34px);
          transform-style: preserve-3d;
        }

        .hero-3d-image {
          animation: heroImageFloat 5.6s ease-in-out infinite;
          filter: drop-shadow(0 30px 34px rgba(0,0,0,0.32));
          transform-origin: 50% 58%;
        }

        .hero-image-aura {
          animation: heroImageAura 4.2s ease-in-out infinite;
        }

        .hero-orbit {
          width: 72%;
          aspect-ratio: 1;
          transform: translate(-50%, -50%) rotateX(67deg);
        }

        .hero-orbit--one { animation: heroInnerOrbit 10s linear infinite; }
        .hero-orbit--two { width: 56%; animation: heroInnerOrbitReverse 7s linear infinite; }

        .hero-scan-card--first {
          animation: showFirstScanCard 18s cubic-bezier(0.76, 0, 0.24, 1) infinite;
        }

        .hero-scan-card--second {
          animation: showSecondScanCard 18s cubic-bezier(0.76, 0, 0.24, 1) infinite;
        }

        .barcode-scan-line,
        .barcode-scan-beam {
          top: -6rem;
          animation: barcodeLineDown 2s cubic-bezier(0.22, 1, 0.36, 1) infinite;
        }

        .barcode-scan-line {
          mix-blend-mode: screen;
        }

        .barcode-scan-line--echo {
          animation-delay: 90ms;
          opacity: 0.46;
        }

        .barcode-scan-beam {
          animation-name: barcodeBeamDown;
        }

        .hero-corner {
          position: absolute;
          z-index: 30;
          width: 2rem;
          height: 2rem;
          border-color: var(--gold);
          opacity: 0.68;
          filter: drop-shadow(0 0 9px rgba(255,179,107,0.55));
          animation: heroCornerPulse 2s ease-in-out infinite;
        }

        .hero-corner--tl { left: 1.1rem; top: 1.1rem; border-left: 2px solid; border-top: 2px solid; border-radius: 0.65rem 0 0 0; }
        .hero-corner--tr { right: 1.1rem; top: 1.1rem; border-right: 2px solid; border-top: 2px solid; border-radius: 0 0.65rem 0 0; }
        .hero-corner--bl { left: 1.1rem; bottom: 1.1rem; border-left: 2px solid; border-bottom: 2px solid; border-radius: 0 0 0 0.65rem; }
        .hero-corner--br { right: 1.1rem; bottom: 1.1rem; border-right: 2px solid; border-bottom: 2px solid; border-radius: 0 0 0.65rem 0; }

        .hero-floor {
          animation: heroFloorShadow 5.6s ease-in-out infinite;
        }

        .hero-floor-light {
          animation: heroFloorLight 3.8s ease-in-out infinite;
        }

        @keyframes showFirstScanCard {
          0%, 43% {
            opacity: 1;
            filter: blur(0);
            transform: translate3d(0, 0, 42px) rotateX(0deg) rotateY(0deg) scale(1);
            z-index: 2;
          }
          48%, 94% {
            opacity: 0;
            filter: blur(8px);
            transform: translate3d(-2.5rem, 1.4rem, -110px) rotateX(5deg) rotateY(-10deg) scale(0.94);
            z-index: 1;
          }
          100% {
            opacity: 1;
            filter: blur(0);
            transform: translate3d(0, 0, 42px) rotateX(0deg) rotateY(0deg) scale(1);
            z-index: 2;
          }
        }

        @keyframes showSecondScanCard {
          0%, 43% {
            opacity: 0;
            filter: blur(8px);
            transform: translate3d(2.5rem, 1.4rem, -110px) rotateX(5deg) rotateY(10deg) scale(0.94);
            z-index: 1;
          }
          48%, 94% {
            opacity: 1;
            filter: blur(0);
            transform: translate3d(0, 0, 42px) rotateX(0deg) rotateY(0deg) scale(1);
            z-index: 2;
          }
          100% {
            opacity: 0;
            filter: blur(8px);
            transform: translate3d(2.5rem, 1.4rem, -110px) rotateX(5deg) rotateY(10deg) scale(0.94);
            z-index: 1;
          }
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

        @keyframes heroImageFloat {
          0%, 100% { transform: translate3d(0, 0.4%, 0) rotateY(-1.2deg) scale(1); }
          50% { transform: translate3d(0, -2.1%, 26px) rotateY(1.8deg) scale(1.025); }
        }

        @keyframes heroImageAura {
          0%, 100% { opacity: 0.45; transform: translate(-50%, -50%) scale(0.92); }
          50% { opacity: 0.9; transform: translate(-50%, -50%) scale(1.08); }
        }

        @keyframes heroMetricFloat {
          0%, 100% { transform: translate3d(0, 0, 26px); }
          50% { transform: translate3d(0, -5px, 38px); }
        }

        @keyframes heroLivePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(50,213,131,0); }
          50% { box-shadow: 0 0 0 7px rgba(50,213,131,0.08), 0 0 22px rgba(50,213,131,0.18); }
        }

        @keyframes heroCardSpecular {
          0%, 18% { opacity: 0; transform: translateX(-45%) rotate(4deg); }
          32% { opacity: 0.72; }
          58% { opacity: 0.16; }
          75%, 100% { opacity: 0; transform: translateX(45%) rotate(4deg); }
        }

        @keyframes heroHaloPulse {
          0%, 100% { opacity: 0.62; transform: translate(-50%, -50%) scale(0.94); }
          50% { opacity: 0.95; transform: translate(-50%, -50%) scale(1.06); }
        }

        @keyframes heroRingSpin {
          to { transform: translate(-50%, -50%) rotateX(72deg) rotateZ(360deg); }
        }

        @keyframes heroRingSpinReverse {
          to { transform: translate(-50%, -50%) rotateX(72deg) rotateZ(-360deg); }
        }

        @keyframes heroInnerOrbit {
          to { transform: translate(-50%, -50%) rotateX(67deg) rotateZ(360deg); }
        }

        @keyframes heroInnerOrbitReverse {
          to { transform: translate(-50%, -50%) rotateX(67deg) rotateZ(-360deg); }
        }

        @keyframes heroParticleFloat {
          0%, 100% { opacity: 0.18; transform: translate3d(0, 0, -20px) scale(0.7); }
          50% { opacity: 0.88; transform: translate3d(0, -1.7rem, 45px) scale(1.2); }
        }

        @keyframes heroCornerPulse {
          0%, 100% { opacity: 0.44; transform: scale(0.96); }
          50% { opacity: 0.9; transform: scale(1.04); }
        }

        @keyframes heroFloorShadow {
          0%, 100% { opacity: 0.58; transform: translateX(-50%) scaleX(0.92); }
          50% { opacity: 0.34; transform: translateX(-50%) scaleX(1.04); }
        }

        @keyframes heroFloorLight {
          0%, 100% { opacity: 0.28; transform: translateX(-50%) scaleX(0.86); }
          50% { opacity: 0.72; transform: translateX(-50%) scaleX(1.06); }
        }

        @media (max-width: 640px) {
          .hero-scene-ring { width: 96%; }
          .hero-scene-ring--inner { width: 72%; }
          .hero-particle-field span:nth-child(n + 7) { display: none; }
          .hero-scan-card__shell { transform: rotateX(0deg) rotateY(0deg); }
          .hero-card-edge { display: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-scan-card--first {
            opacity: 1;
            transform: none;
          }

          .hero-scan-card--second {
            display: none;
          }

          .hero-scan-card,
          .hero-scan-card__shell,
          .hero-scene-halo,
          .hero-scene-ring,
          .hero-particle-field span,
          .hero-card-specular::after,
          .hero-live-pill,
          .hero-metric-card,
          .hero-3d-image,
          .hero-image-aura,
          .hero-orbit,
          .barcode-scan-line,
          .barcode-scan-beam,
          .hero-corner,
          .hero-floor,
          .hero-floor-light {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}
