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
    alt: "King Sparkon 3D Lego barcode visual",
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
    const sceneElement = sceneRef.current;
    if (sceneElement === null) return;
    const mountedScene: HTMLDivElement = sceneElement;

    let isNearViewport = true;
    let pageIsVisible = document.visibilityState === "visible";

    const syncPlayback = () => {
      mountedScene.dataset.heroMotion =
        isNearViewport && pageIsVisible ? "running" : "paused";
    };

    const handleVisibilityChange = () => {
      pageIsVisible = document.visibilityState === "visible";
      syncPlayback();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isNearViewport = entry?.isIntersecting ?? false;
        syncPlayback();
      },
      { rootMargin: "160px 0px", threshold: 0.01 },
    );

    observer.observe(mountedScene);
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
      sample.scene.style.setProperty("--hero-glow-x", `${sample.x * 100}%`);
      sample.scene.style.setProperty("--hero-glow-y", `${sample.y * 100}%`);
    });
  }

  function resetSceneTilt(event: PointerEvent<HTMLDivElement>) {
    pointerSampleRef.current = null;
    window.cancelAnimationFrame(pointerFrameRef.current);
    pointerFrameRef.current = 0;
    event.currentTarget.style.setProperty("--hero-tilt-x", "0deg");
    event.currentTarget.style.setProperty("--hero-tilt-y", "0deg");
    event.currentTarget.style.setProperty("--hero-glow-x", "50%");
    event.currentTarget.style.setProperty("--hero-glow-y", "42%");
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div
        ref={sceneRef}
        data-hero-motion="paused"
        className="hero-3d-scene relative min-h-[42rem] overflow-hidden rounded-[2.65rem] border border-[var(--line-strong)] bg-black shadow-[0_28px_80px_rgba(0,0,0,0.65),0_0_36px_rgba(34,211,238,0.12)] [perspective:1600px] sm:min-h-[43rem]"
        onPointerMove={updateSceneTilt}
        onPointerLeave={resetSceneTilt}
      >
        <div className="hero-scene-halo pointer-events-none absolute left-1/2 top-[44%] h-[72%] w-[84%] -translate-x-1/2 -translate-y-1/2 rounded-full" />
        <div className="hero-orb hero-orb--cyan pointer-events-none absolute" aria-hidden="true" />
        <div className="hero-orb hero-orb--violet pointer-events-none absolute" aria-hidden="true" />
        <div className="hero-orb hero-orb--magenta pointer-events-none absolute" aria-hidden="true" />
        <div className="hero-scene-ring pointer-events-none absolute left-1/2 top-[43%] rounded-full border border-[var(--signal)]/25" />
        <div className="hero-scene-ring hero-scene-ring--inner pointer-events-none absolute left-1/2 top-[43%] rounded-full border border-[var(--gold)]/45" />
        <div className="hero-scene-dash pointer-events-none absolute left-1/2 top-[43%] rounded-full border-2 border-dashed border-[var(--premium-magenta)]/40" aria-hidden="true" />

        <div className="hero-particle-field pointer-events-none absolute inset-0" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, index) => (
            <span key={index} />
          ))}
        </div>

        <div className="absolute inset-x-4 top-4 z-30 flex items-center justify-between gap-3 sm:inset-x-6 sm:top-6">
          <span className="rounded-full border border-[var(--line-strong)] bg-black/80 px-3 py-2 font-mono text-[0.62rem] font-black uppercase tracking-[0.16em] text-[var(--signal)] shadow-[var(--shadow-soft)]">
            Circle-based hero
          </span>
          <span className="rounded-full border border-[var(--confirm)]/30 bg-black/80 px-3 py-2 font-mono text-[0.62rem] font-black uppercase tracking-[0.16em] text-[var(--confirm)] shadow-[var(--shadow-soft)]">
            Smooth scan loop
          </span>
        </div>

        <div className="hero-scan-stage absolute inset-x-4 bottom-20 top-20 sm:inset-x-8 sm:bottom-28 sm:top-24">
          {heroCards.map((card, index) => (
            <article
              key={card.title}
              className={`hero-scan-card hero-scan-card--${index + 1} absolute inset-0 transform-gpu`}
            >
              <div className="hero-scan-card__shell relative h-full overflow-hidden rounded-[2.2rem] border border-[var(--line-strong)] bg-[#0a0a14] p-3 shadow-[0_30px_82px_rgba(0,0,0,0.65),0_0_28px_rgba(139,92,246,0.18)]">
                <div className="hero-sheen pointer-events-none absolute inset-0 z-20" aria-hidden="true" />
                <div className="relative flex h-full flex-col overflow-hidden rounded-[1.85rem] border border-[var(--line)] bg-[#0a0a14]">
                  <div className="grid gap-3 border-b border-[var(--line)] p-4 sm:grid-cols-3">
                    {terminalMetrics.map(([label, value]) => (
                      <div key={label} className="rounded-[1.15rem] border border-[var(--line)] bg-[var(--surface)] p-3">
                        <p className="font-mono text-[0.54rem] font-black uppercase tracking-[0.14em] text-[var(--signal)]">{label}</p>
                        <p className="mt-1 text-sm font-black text-[var(--ink)]">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="relative min-h-0 flex-1 overflow-hidden bg-[radial-gradient(circle_at_50%_38%,rgba(34,211,238,0.14),rgba(0,0,0,0.92)_68%)]">
                    <div className="hero-image-aura pointer-events-none absolute left-1/2 top-1/2 h-[66%] w-[66%] -translate-x-1/2 -translate-y-1/2 rounded-full" />
                    <div className="hero-scan-grid pointer-events-none absolute inset-0 z-10" aria-hidden="true" />
                    <Image
                      src={card.imageSrc}
                      alt={card.alt}
                      fill
                      priority={index === 0}
                      sizes="(min-width: 1280px) 640px, (min-width: 1024px) 52vw, 94vw"
                      className="hero-3d-image transform-gpu object-contain p-4 [backface-visibility:hidden]"
                    />
                    <div className="hero-orbit pointer-events-none absolute left-1/2 top-1/2 z-10 rounded-full border border-[var(--gold)]/45" />
                    <div className="barcode-scan-line pointer-events-none absolute left-4 right-4 top-0 z-30 h-1 rounded-full bg-[var(--signal)] shadow-[0_0_18px_rgba(14,165,233,0.8)]" />
                    <span className="hero-corner hero-corner--tl" />
                    <span className="hero-corner hero-corner--tr" />
                    <span className="hero-corner hero-corner--bl" />
                    <span className="hero-corner hero-corner--br" />

                    <div className="absolute inset-x-0 bottom-0 z-40 bg-gradient-to-t from-black via-black/85 to-transparent px-5 pb-5 pt-16">
                      <p className="font-mono text-[0.6rem] font-black uppercase tracking-[0.18em] text-[var(--signal)]">{card.eyebrow}</p>
                      <p className="mt-2 text-xl font-black tracking-[-0.04em] text-[var(--ink)]">{card.title}</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="hero-floor pointer-events-none absolute bottom-[4.4rem] left-1/2 h-8 w-[58%] -translate-x-1/2 rounded-[50%] bg-sky-400/14 shadow-[0_0_34px_rgba(14,165,233,0.2)]" />

        <div className="pointer-events-none absolute inset-0 z-30" aria-hidden="true">
          <span className="hero-chip hero-chip--one absolute left-3 top-[24%] inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/70 px-3 py-1.5 font-mono text-[0.58rem] font-black uppercase tracking-[0.14em] text-white backdrop-blur-md sm:left-5">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--premium-cyan)] shadow-[0_0_10px_rgba(34,211,238,0.9)]" /> Barcode verified
          </span>
          <span className="hero-chip hero-chip--two absolute right-3 top-[50%] inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/70 px-3 py-1.5 font-mono text-[0.58rem] font-black uppercase tracking-[0.14em] text-white backdrop-blur-md sm:right-5">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--premium-gold)] shadow-[0_0_10px_rgba(250,204,21,0.9)]" /> QR ticket live
          </span>
          <span className="hero-chip hero-chip--three absolute bottom-[22%] left-3 hidden items-center gap-1.5 rounded-full border border-white/15 bg-black/70 px-3 py-1.5 font-mono text-[0.58rem] font-black uppercase tracking-[0.14em] text-white backdrop-blur-md sm:inline-flex lg:left-5">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--premium-magenta)] shadow-[0_0_10px_rgba(236,72,153,0.9)]" /> Tips settled
          </span>
        </div>
      </div>

      <div className="relative z-20 mt-5 rounded-[1.65rem] border border-[var(--line)] bg-[#0a0a14] p-4 shadow-[var(--shadow-soft)]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="font-mono text-[0.68rem] font-black uppercase tracking-[0.16em] text-[var(--muted)]">Official profiles</p>
          <span className="rounded-full border border-[var(--signal)]/25 bg-[var(--signal-soft)] px-3 py-1 font-mono text-[0.56rem] font-black uppercase tracking-[0.14em] text-[var(--signal)]">Move pointer to tilt</span>
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
        .hero-3d-scene[data-hero-motion="paused"] *::after { animation-play-state: paused !important; }
        .hero-scan-stage, .hero-scan-card, .hero-scan-card__shell { transform-style: preserve-3d; }
        .hero-scene-halo {
          background: radial-gradient(circle at var(--hero-glow-x) var(--hero-glow-y), rgb(139 92 246 / 0.26), rgb(0 0 0 / 0.6) 44%, transparent 73%);
          animation: heroHaloPulse 18s ease-in-out infinite;
        }
        .hero-scene-ring {
          width: 82%;
          aspect-ratio: 1;
          transform: translate(-50%, -50%) rotateX(70deg);
          animation: heroRingSpin 62s linear infinite;
        }
        .hero-scene-ring--inner { width: 62%; opacity: 0.72; animation-direction: reverse; animation-duration: 72s; }
        .hero-particle-field span {
          position: absolute;
          width: 0.34rem;
          height: 0.34rem;
          border-radius: 999px;
          background: var(--signal);
          box-shadow: 0 0 14px rgb(14 165 233 / 0.42);
          animation: heroParticleFloat 22s ease-in-out infinite;
        }
        .hero-particle-field span:nth-child(1) { left: 7%; top: 19%; animation-delay: -1.2s; }
        .hero-particle-field span:nth-child(2) { left: 15%; top: 66%; animation-delay: -4.1s; }
        .hero-particle-field span:nth-child(3) { left: 30%; top: 8%; background: var(--gold); animation-delay: -6.2s; }
        .hero-particle-field span:nth-child(4) { right: 9%; top: 25%; animation-delay: -2.6s; }
        .hero-particle-field span:nth-child(5) { right: 18%; top: 72%; background: var(--gold); animation-delay: -5.3s; }
        .hero-particle-field span:nth-child(6) { right: 31%; top: 11%; animation-delay: -0.9s; }
        .hero-scan-card__shell {
          transform: rotateX(var(--hero-tilt-x)) rotateY(var(--hero-tilt-y)) translateZ(0);
          transition: transform 320ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .hero-3d-scene[data-hero-motion="running"] .hero-scan-card__shell { will-change: transform; }
        .hero-scan-card--1 { animation: heroShowFirst 56s cubic-bezier(0.65, 0, 0.35, 1) infinite; }
        .hero-scan-card--2 { animation: heroShowSecond 56s cubic-bezier(0.65, 0, 0.35, 1) infinite; }
        .hero-3d-image { animation: heroImageFloat 18s ease-in-out infinite; }
        .hero-image-aura { background: radial-gradient(circle, rgb(139 92 246 / 0.2), transparent 68%); }
        .hero-orbit {
          width: 68%;
          aspect-ratio: 1;
          transform: translate(-50%, -50%) rotateX(67deg);
          animation: heroInnerOrbit 48s linear infinite;
        }
        .barcode-scan-line { animation: barcodeLineDown 9s cubic-bezier(0.22, 1, 0.36, 1) infinite; }
        .hero-orb { border-radius: 999px; filter: blur(60px); opacity: 0.45; animation: heroOrbPulse 12s ease-in-out infinite; }
        .hero-orb--cyan { left: -12%; top: 4%; width: 56%; aspect-ratio: 1; background: radial-gradient(circle, rgb(34 211 238 / 0.32), transparent 70%); }
        .hero-orb--violet { right: -14%; top: 30%; width: 60%; aspect-ratio: 1; background: radial-gradient(circle, rgb(139 92 246 / 0.3), transparent 70%); animation-delay: -4s; animation-duration: 14s; }
        .hero-orb--magenta { left: 8%; bottom: -8%; width: 52%; aspect-ratio: 1; background: radial-gradient(circle, rgb(236 72 153 / 0.26), transparent 70%); animation-delay: -7s; animation-duration: 16s; }
        @keyframes heroOrbPulse {
          0%, 100% { opacity: 0.32; transform: scale(0.94); }
          50% { opacity: 0.58; transform: scale(1.05); }
        }
        .hero-scene-dash { width: 92%; aspect-ratio: 1; transform: translate(-50%, -50%) rotateX(70deg); animation: heroDashSpin 84s linear infinite; }
        @keyframes heroDashSpin { to { transform: translate(-50%, -50%) rotateX(70deg) rotateZ(-360deg); } }
        .hero-scan-grid {
          background-image: linear-gradient(rgb(34 211 238 / 0.08) 1px, transparent 1px), linear-gradient(90deg, rgb(139 92 246 / 0.08) 1px, transparent 1px);
          background-size: 26px 26px;
          -webkit-mask-image: radial-gradient(circle at 50% 45%, black 30%, transparent 78%);
          mask-image: radial-gradient(circle at 50% 45%, black 30%, transparent 78%);
        }
        .hero-sheen { background: linear-gradient(105deg, transparent 42%, rgb(255 255 255 / 0.13) 50%, transparent 58%); transform: translateX(-135%) skewX(-14deg); animation: heroSheenPass 11s ease-in-out infinite; }
        @keyframes heroSheenPass {
          0%, 55% { transform: translateX(-135%) skewX(-14deg); opacity: 0; }
          70% { opacity: 1; }
          100% { transform: translateX(135%) skewX(-14deg); opacity: 0; }
        }
        .hero-chip { box-shadow: 0 8px 24px rgb(0 0 0 / 0.5); animation: heroChipFloat 7s ease-in-out infinite; }
        .hero-chip--two { animation-duration: 9s; animation-delay: -2.5s; }
        .hero-chip--three { animation-duration: 8s; animation-delay: -5s; }
        @keyframes heroChipFloat {
          0%, 100% { transform: translateY(-7px); }
          50% { transform: translateY(7px); }
        }
        .hero-corner { position: absolute; z-index: 30; width: 2rem; height: 2rem; color: var(--signal); opacity: 0.72; }
        .hero-corner--tl { left: 1rem; top: 1rem; border-left: 2px solid; border-top: 2px solid; border-radius: 0.6rem 0 0; }
        .hero-corner--tr { right: 1rem; top: 1rem; border-right: 2px solid; border-top: 2px solid; border-radius: 0 0.6rem 0 0; }
        .hero-corner--bl { left: 1rem; bottom: 1rem; border-left: 2px solid; border-bottom: 2px solid; border-radius: 0 0 0 0.6rem; }
        .hero-corner--br { right: 1rem; bottom: 1rem; border-right: 2px solid; border-bottom: 2px solid; border-radius: 0 0 0.6rem; }
        @keyframes heroShowFirst {
          0%, 45%, 100% { opacity: 1; transform: translate3d(0, 0, 36px) scale(1); z-index: 2; }
          52%, 94% { opacity: 0; transform: translate3d(-1.15rem, 0.5rem, -54px) rotateY(-4deg) scale(0.975); z-index: 1; }
        }
        @keyframes heroShowSecond {
          0%, 45%, 100% { opacity: 0; transform: translate3d(1.15rem, 0.5rem, -54px) rotateY(4deg) scale(0.975); z-index: 1; }
          52%, 94% { opacity: 1; transform: translate3d(0, 0, 36px) scale(1); z-index: 2; }
        }
        @keyframes barcodeLineDown {
          0% { opacity: 0; transform: translate3d(0, -2rem, 0) scaleX(0.78); }
          12%, 82% { opacity: 0.92; }
          100% { opacity: 0; transform: translate3d(0, 34rem, 0) scaleX(0.78); }
        }
        @keyframes heroImageFloat {
          0%, 100% { transform: translate3d(0, 0.3%, 0) rotateY(-0.6deg) scale(1); }
          50% { transform: translate3d(0, -1.2%, 16px) rotateY(0.8deg) scale(1.012); }
        }
        @keyframes heroHaloPulse {
          0%, 100% { opacity: 0.66; transform: translate(-50%, -50%) scale(0.97); }
          50% { opacity: 0.94; transform: translate(-50%, -50%) scale(1.03); }
        }
        @keyframes heroRingSpin { to { transform: translate(-50%, -50%) rotateX(70deg) rotateZ(360deg); } }
        @keyframes heroInnerOrbit { to { transform: translate(-50%, -50%) rotateX(67deg) rotateZ(360deg); } }
        @keyframes heroParticleFloat {
          0%, 100% { opacity: 0.2; transform: translate3d(0, 0, 0) scale(0.8); }
          50% { opacity: 0.78; transform: translate3d(0, -1.1rem, 18px) scale(1.08); }
        }
        @media (max-width: 640px) {
          .hero-scene-ring { width: 96%; }
          .hero-scene-ring--inner { width: 72%; }
          .hero-scene-dash { width: 104%; }
          .hero-orb { filter: blur(44px); }
          .hero-particle-field span:nth-child(n + 5) { display: none; }
          .hero-scan-card__shell { transform: none; }
          .hero-orbit { animation-duration: 58s; }
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
