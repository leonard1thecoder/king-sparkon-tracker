"use client";

import Image from "next/image";
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
  cardClassName: string;
};

function ScanTerminalCard({ imageSrc, eyebrow, title, subtitle, cardClassName }: TerminalCardProps) {
  return (
    <div className={`hero-scan-card absolute inset-0 ${cardClassName}`}>
      <div className="relative rounded-[2.25rem] border border-[var(--line)] bg-white p-3 shadow-[var(--shadow-depth)] [transform:rotateX(2deg)_rotateY(-3deg)]">
        <div className="pointer-events-none absolute inset-x-8 top-2 z-20 h-5 rounded-full bg-gradient-to-b from-white via-white/72 to-transparent blur-[1px]" aria-hidden="true" />
        <div className="relative overflow-hidden rounded-[1.85rem] border border-[var(--line)] bg-[var(--ink)] scan-grid">
          <div className="relative z-10 flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
            <div>
              <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[var(--gold)]">{eyebrow}</p>
              <p className="mt-1 text-sm font-semibold text-white/62">{subtitle}</p>
            </div>
            <span className="rounded-full border border-[var(--confirm)]/40 bg-[var(--confirm)]/20 px-3 py-1 text-xs font-black text-white">4 scans</span>
          </div>

          <div className="relative z-10 grid gap-4 p-5">
            <div className="grid gap-3 sm:grid-cols-3">
              {previewTerminalMetrics.map(([label, value]) => (
                <div key={label} className="rounded-[1.25rem] border border-white/10 bg-white/[0.06] p-3 shadow-[var(--shadow-soft)] backdrop-blur">
                  <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-white/38">{label}</p>
                  <p className="money mt-1 text-lg font-black text-white">{value}</p>
                </div>
              ))}
            </div>

            <div className="relative mx-auto my-3 w-full overflow-hidden rounded-[1.8rem] border border-white/18 bg-[var(--ink)] text-white shadow-[0_28px_80px_rgba(0,0,0,0.38)]">
              <div className="hero-scan-window relative aspect-square w-full overflow-hidden bg-[radial-gradient(circle_at_50%_40%,rgba(255,210,90,0.18),rgba(7,19,31,0.98)_62%)]">
                <Image
                  src={imageSrc}
                  alt={title}
                  fill
                  priority
                  unoptimized
                  sizes="(min-width: 1280px) 640px, (min-width: 1024px) 52vw, 94vw"
                  className="transform-gpu object-contain [backface-visibility:hidden] [image-rendering:auto]"
                />
                <div className="logo-reflection-wick pointer-events-none absolute inset-0 z-10" aria-hidden="true" />
                <div className="barcode-scan-beam pointer-events-none absolute left-0 right-0 z-20 h-24 bg-gradient-to-b from-transparent via-[var(--signal)]/18 to-transparent" aria-hidden="true" />
                <div className="barcode-scan-line pointer-events-none absolute left-4 right-4 z-30 h-1.5 rounded-full bg-[var(--signal)] shadow-[0_0_22px_var(--signal),0_0_52px_var(--signal)]" aria-hidden="true" />
                <div className="pointer-events-none absolute left-4 right-4 top-0 z-20 h-full border-x border-[var(--signal)]/18" aria-hidden="true" />
              </div>
              <div className="absolute inset-x-0 bottom-0 z-40 bg-gradient-to-t from-[rgba(7,19,31,0.92)] via-[rgba(7,19,31,0.52)] to-transparent px-5 pb-5 pt-16 text-white">
                <p className="font-mono text-[0.62rem] font-black uppercase tracking-[0.18em] text-[var(--gold)]">New official logo</p>
                <p className="mt-2 text-xl font-black tracking-[-0.04em]">{title}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ScanLoop() {
  return (
    <div className="relative mx-auto w-full max-w-2xl [perspective:1400px]">
      <div className="hero-scan-stage relative min-h-[34rem] sm:min-h-[42rem] lg:min-h-[45rem]">
        <ScanTerminalCard
          imageSrc={HERO_3D_IMAGE}
          eyebrow="King Sparkon brand terminal"
          subtitle="Barcode line scans down 4 times"
          title="King Sparkon Tracker"
          cardClassName="hero-scan-card--first"
        />
        <ScanTerminalCard
          imageSrc={SECOND_3D_IMAGE}
          eyebrow="King Sparkon second terminal"
          subtitle="Second card scans down 4 times"
          title="Badge-level 3D showcase"
          cardClassName="hero-scan-card--second"
        />
      </div>

      <div className="mt-10 rounded-[1.65rem] border border-[var(--line)] bg-white/88 p-4 shadow-[var(--shadow-soft)] backdrop-blur">
        <p className="mb-3 font-mono text-[0.68rem] font-black uppercase tracking-[0.16em] text-[var(--muted)]">Official profiles</p>
        <SocialLinks variant="light" />
      </div>

      <style jsx global>{`
        .hero-scan-stage {
          transform-style: preserve-3d;
        }

        .hero-scan-card {
          backface-visibility: hidden;
          will-change: opacity, filter, transform;
        }

        .hero-scan-card--first {
          animation: showFirstScanCard 16s linear infinite;
        }

        .hero-scan-card--second {
          animation: showSecondScanCard 16s linear infinite;
        }

        .barcode-scan-line,
        .barcode-scan-beam {
          top: -6rem;
          animation: barcodeLineDown 2s cubic-bezier(0.22, 1, 0.36, 1) infinite;
        }

        .barcode-scan-line {
          mix-blend-mode: screen;
        }

        .barcode-scan-beam {
          animation-name: barcodeBeamDown;
        }

        @keyframes showFirstScanCard {
          0%, 49.6% {
            opacity: 1;
            filter: blur(0);
            transform: translate3d(0, 0, 0) scale(1);
            z-index: 2;
          }
          50%, 99.6% {
            opacity: 0;
            filter: blur(5px);
            transform: translate3d(0, 14px, -42px) scale(0.985);
            z-index: 1;
          }
          100% {
            opacity: 1;
            filter: blur(0);
            transform: translate3d(0, 0, 0) scale(1);
            z-index: 2;
          }
        }

        @keyframes showSecondScanCard {
          0%, 49.6% {
            opacity: 0;
            filter: blur(5px);
            transform: translate3d(0, 14px, -42px) scale(0.985);
            z-index: 1;
          }
          50%, 99.6% {
            opacity: 1;
            filter: blur(0);
            transform: translate3d(0, 0, 0) scale(1);
            z-index: 2;
          }
          100% {
            opacity: 0;
            filter: blur(5px);
            transform: translate3d(0, 14px, -42px) scale(0.985);
            z-index: 1;
          }
        }

        @keyframes barcodeLineDown {
          0% {
            opacity: 0;
            top: -1.5rem;
            transform: scaleX(0.72);
          }
          8% {
            opacity: 1;
            top: -0.4rem;
            transform: scaleX(1);
          }
          78% {
            opacity: 1;
            top: calc(100% - 0.4rem);
            transform: scaleX(1);
          }
          100% {
            opacity: 0;
            top: calc(100% + 1.5rem);
            transform: scaleX(0.72);
          }
        }

        @keyframes barcodeBeamDown {
          0% {
            opacity: 0;
            top: -6rem;
          }
          12% {
            opacity: 0.72;
            top: -3rem;
          }
          78% {
            opacity: 0.62;
            top: calc(100% - 4rem);
          }
          100% {
            opacity: 0;
            top: calc(100% + 1rem);
          }
        }
      `}</style>
    </div>
  );
}
