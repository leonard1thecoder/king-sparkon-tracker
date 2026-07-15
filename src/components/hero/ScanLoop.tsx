"use client";

import Image from "next/image";
import type { PointerEvent } from "react";
import { ScanLine } from "lucide-react";

const HERO_3D_IMAGE =
  "https://veizbtzugssszhxabzrv.supabase.co/storage/v1/object/public/king-sparkon-logo/ChatGPT%20Image%20Jun%2029,%202026,%2001_23_49%20PM.png";

const SECOND_3D_IMAGE =
  "https://veizbtzugssszhxabzrv.supabase.co/storage/v1/object/public/king-sparkon-logo/XSX.png";

export function ScanLoop() {
  function updateSceneTilt(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;

    const scene = event.currentTarget;
    const bounds = scene.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    scene.style.setProperty("--hero-tilt-x", `${((0.5 - y) * 5).toFixed(2)}deg`);
    scene.style.setProperty("--hero-tilt-y", `${((x - 0.5) * 6).toFixed(2)}deg`);
  }

  function resetSceneTilt(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.style.setProperty("--hero-tilt-x", "0deg");
    event.currentTarget.style.setProperty("--hero-tilt-y", "0deg");
  }

  return (
    <div
      className="hero-circle-scene relative isolate mx-auto aspect-square w-full max-w-[28rem] overflow-hidden rounded-full border border-[var(--line-strong)] bg-white shadow-[0_20px_52px_rgba(14,165,233,0.13)] [perspective:1200px]"
      onPointerMove={updateSceneTilt}
      onPointerLeave={resetSceneTilt}
    >
      <div className="hero-circle-halo pointer-events-none absolute inset-[7%] rounded-full bg-[var(--signal-soft)]" aria-hidden="true" />
      <div className="hero-circle-ring hero-circle-ring-one pointer-events-none absolute inset-[8%] rounded-full border border-[var(--line-strong)]" aria-hidden="true" />
      <div className="hero-circle-ring hero-circle-ring-two pointer-events-none absolute inset-[19%] rounded-full border border-[var(--line)]" aria-hidden="true" />

      <div className="hero-circle-content absolute inset-[12%] overflow-hidden rounded-full border border-[var(--line)] bg-white shadow-[0_16px_36px_rgba(14,165,233,0.11)]">
        <Image
          src={HERO_3D_IMAGE}
          alt="King Sparkon Tracker 3D scanner visual"
          fill
          priority
          unoptimized
          sizes="(min-width: 1024px) 28rem, 86vw"
          className="hero-circle-image hero-circle-image-primary object-contain p-[8%]"
        />
        <Image
          src={SECOND_3D_IMAGE}
          alt="King Sparkon 3D platform visual"
          fill
          unoptimized
          sizes="(min-width: 1024px) 28rem, 86vw"
          className="hero-circle-image hero-circle-image-secondary object-contain p-[8%]"
        />
        <div className="hero-circle-scan pointer-events-none absolute inset-x-[8%] h-16" aria-hidden="true" />
      </div>

      <div className="absolute left-1/2 top-[8%] z-20 -translate-x-1/2 rounded-lg border border-[var(--line-strong)] bg-white px-3 py-1.5 text-center shadow-[var(--shadow-soft)]">
        <p className="text-[0.58rem] font-extrabold uppercase tracking-[0.13em] text-[var(--signal-strong)]">Live scanner</p>
      </div>

      <div className="absolute bottom-[8%] left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-[var(--line-strong)] bg-white px-3 py-1.5 shadow-[var(--shadow-soft)]">
        <ScanLine className="h-4 w-4 text-[var(--signal)]" />
        <span className="whitespace-nowrap text-xs font-extrabold text-[var(--ink)]">Scan · Sell · Track · Prove</span>
      </div>

      <style jsx global>{`
        .hero-circle-scene {
          --hero-tilt-x: 0deg;
          --hero-tilt-y: 0deg;
        }

        .hero-circle-content {
          transform: rotateX(var(--hero-tilt-x)) rotateY(var(--hero-tilt-y));
          transform-style: preserve-3d;
          transition: transform 180ms ease-out;
        }

        .hero-circle-halo {
          animation: heroCirclePulse 5s ease-in-out infinite;
        }

        .hero-circle-ring-one {
          animation: heroCircleSpin 18s linear infinite;
        }

        .hero-circle-ring-two {
          animation: heroCircleSpinReverse 13s linear infinite;
        }

        .hero-circle-image {
          transition: opacity 700ms ease;
        }

        .hero-circle-image-primary {
          animation: heroCircleSwapPrimary 10s ease-in-out infinite;
        }

        .hero-circle-image-secondary {
          animation: heroCircleSwapSecondary 10s ease-in-out infinite;
        }

        .hero-circle-scan {
          top: -18%;
          background: linear-gradient(to bottom, transparent, rgb(14 165 233 / 0.2), transparent);
          border-bottom: 2px solid var(--signal);
          animation: heroCircleScan 3.4s ease-in-out infinite;
        }

        @keyframes heroCirclePulse {
          0%, 100% { transform: scale(0.96); opacity: 0.7; }
          50% { transform: scale(1.04); opacity: 1; }
        }

        @keyframes heroCircleSpin {
          to { transform: rotate(360deg); }
        }

        @keyframes heroCircleSpinReverse {
          to { transform: rotate(-360deg); }
        }

        @keyframes heroCircleSwapPrimary {
          0%, 42% { opacity: 1; transform: scale(1); }
          50%, 92% { opacity: 0; transform: scale(0.94); }
          100% { opacity: 1; transform: scale(1); }
        }

        @keyframes heroCircleSwapSecondary {
          0%, 42% { opacity: 0; transform: scale(0.94); }
          50%, 92% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.94); }
        }

        @keyframes heroCircleScan {
          0%, 100% { top: -18%; opacity: 0; }
          12% { opacity: 1; }
          72% { top: 102%; opacity: 1; }
          82% { opacity: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-circle-halo,
          .hero-circle-ring,
          .hero-circle-image,
          .hero-circle-scan {
            animation: none !important;
          }

          .hero-circle-image-primary { opacity: 1 !important; }
          .hero-circle-image-secondary { opacity: 0 !important; }
        }
      `}</style>
    </div>
  );
}
