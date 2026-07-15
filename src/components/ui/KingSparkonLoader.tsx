"use client";

import { Crown } from "lucide-react";
import type { CSSProperties } from "react";

type KingSparkonLoaderProps = {
  compact?: boolean;
  label?: string;
  message?: string;
};

const BAR_HEIGHTS = [44, 70, 52, 84, 62, 92, 58, 78, 48, 88, 66, 76] as const;

export function KingSparkonLoader({
  compact = false,
  label = "King Sparkon loading",
  message = "Preparing the operating crown.",
}: KingSparkonLoaderProps) {
  return (
    <div
      className={compact
        ? "grid min-h-72 place-items-center px-6 py-10 text-center text-white"
        : "grid min-h-screen place-items-center bg-white px-5 text-[var(--ink)] enterprise-grid"}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className={compact
        ? "relative w-full max-w-sm overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.26)] backdrop-blur-xl"
        : "relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-[var(--line)] bg-white/92 p-8 text-center shadow-[var(--shadow-depth)] backdrop-blur-xl"}
      >
        <div className="king-loader-aura pointer-events-none absolute left-1/2 top-20 h-44 w-44 -translate-x-1/2 rounded-full bg-[var(--gold)]/24 blur-3xl" aria-hidden="true" />

        <div className="relative mx-auto grid h-24 w-24 place-items-center rounded-[1.9rem] border border-[var(--gold)]/70 bg-[#8e3f68] text-[var(--gold)] shadow-[0_24px_70px_rgba(7,19,31,0.24)]">
          <Crown className="king-loader-crown h-12 w-12" strokeWidth={1.8} />
          <span className="king-loader-orbit absolute inset-2 rounded-[1.45rem] border border-[var(--gold)]/40" aria-hidden="true" />
        </div>

        <div className="relative mx-auto mt-7 h-20 max-w-xs overflow-hidden rounded-[1.25rem] border border-current/10 bg-black/8 px-5 py-3">
          <div className="flex h-full items-end justify-center gap-1.5" aria-hidden="true">
            {BAR_HEIGHTS.map((height, index) => (
              <span
                key={`${height}-${index}`}
                className="king-loader-bar block w-2 rounded-t-sm bg-[var(--gold)] shadow-[0_0_16px_rgba(255,179,107,0.28)]"
                style={{
                  height: `${height}%`,
                  "--king-loader-delay": `${index * 70}ms`,
                } as CSSProperties}
              />
            ))}
          </div>
          <span className="king-loader-scan absolute inset-x-3 top-2 h-0.5 rounded-full bg-[var(--signal)] shadow-[0_0_14px_var(--signal),0_0_32px_var(--signal)]" aria-hidden="true" />
        </div>

        <p className={`mt-6 font-mono text-xs font-black uppercase tracking-[0.18em] ${compact ? "text-[var(--gold)]" : "text-[var(--signal)]"}`}>
          {label}
        </p>
        <p className={`mt-3 text-xl font-black tracking-[-0.04em] ${compact ? "text-white" : "text-[var(--ink)]"}`}>
          {message}
        </p>
        <p className={`mx-auto mt-3 max-w-sm text-sm leading-6 ${compact ? "text-white/55" : "text-[var(--steel)]"}`}>
          Loading the scene, camera timeline, scanner geometry, and responsive controls.
        </p>
      </div>

      <style jsx global>{`
        @keyframes kingLoaderCrownFloat {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-7px) rotate(2deg); }
        }

        @keyframes kingLoaderOrbit {
          to { transform: rotate(360deg); }
        }

        @keyframes kingLoaderBarPulse {
          0%, 100% { opacity: 0.38; transform: scaleY(0.72); transform-origin: bottom; }
          50% { opacity: 1; transform: scaleY(1); transform-origin: bottom; }
        }

        @keyframes kingLoaderScan {
          0% { transform: translateY(0); opacity: 0; }
          12% { opacity: 1; }
          88% { opacity: 1; }
          100% { transform: translateY(3.75rem); opacity: 0; }
        }

        @keyframes kingLoaderAura {
          0%, 100% { opacity: 0.5; transform: translateX(-50%) scale(0.9); }
          50% { opacity: 1; transform: translateX(-50%) scale(1.08); }
        }

        .king-loader-crown { animation: kingLoaderCrownFloat 2.4s ease-in-out infinite; }
        .king-loader-orbit { animation: kingLoaderOrbit 7s linear infinite; }
        .king-loader-bar {
          animation: kingLoaderBarPulse 1.3s ease-in-out infinite;
          animation-delay: var(--king-loader-delay);
        }
        .king-loader-scan { animation: kingLoaderScan 1.9s ease-in-out infinite; }
        .king-loader-aura { animation: kingLoaderAura 3.2s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .king-loader-crown,
          .king-loader-orbit,
          .king-loader-bar,
          .king-loader-scan,
          .king-loader-aura {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
