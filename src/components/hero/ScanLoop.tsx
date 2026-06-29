"use client";

import Image from "next/image";
import { SocialLinks } from "@/components/social/SocialLinks";

const HERO_3D_IMAGE =
  "https://veizbtzugssszhxabzrv.supabase.co/storage/v1/object/public/king-sparkon-logo/king-sparkon-lego-logo-4k-high-quality.png";

const previewTerminalMetrics = [
  ["Brand logo", "LEGO"],
  ["Scan sweep", "Looping"],
  ["Hero view", "4K"],
] as const;

export function ScanLoop() {
  return (
    <div className="relative mx-auto w-full max-w-2xl [perspective:1200px]">
      <div className="relative rounded-[2.25rem] border border-[var(--line)] bg-white p-3 shadow-[var(--shadow-depth)] [transform:rotateX(2deg)_rotateY(-3deg)]">
        <div className="relative overflow-hidden rounded-[1.85rem] border border-[var(--line)] bg-[var(--ink)] scan-grid">
          <div className="relative z-10 flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
            <div>
              <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[var(--gold)]">King Sparkon brand terminal</p>
              <p className="mt-1 text-sm font-semibold text-white/62">4K LEGO logo scan reflection</p>
            </div>
            <span className="rounded-full border border-[var(--confirm)]/40 bg-[var(--confirm)]/20 px-3 py-1 text-xs font-black text-white">Looping</span>
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
              <div className="relative aspect-square w-full overflow-hidden bg-[radial-gradient(circle_at_50%_40%,rgba(255,210,90,0.18),rgba(7,19,31,0.98)_62%)]">
                <Image
                  src={HERO_3D_IMAGE}
                  alt="King Sparkon Tracker LEGO crown logo"
                  fill
                  priority
                  unoptimized
                  sizes="(min-width: 1280px) 640px, (min-width: 1024px) 52vw, 94vw"
                  className="transform-gpu object-contain [backface-visibility:hidden] [image-rendering:auto]"
                />
                <div className="logo-reflection-wick pointer-events-none absolute inset-0" aria-hidden="true" />
                <div className="scan-sweep-logo pointer-events-none absolute left-4 right-4 h-1.5 rounded-full bg-[var(--signal)] shadow-[0_0_34px_var(--signal)]" aria-hidden="true" />
                <div className="pointer-events-none absolute left-4 right-4 top-0 h-full border-x border-[var(--signal)]/18" aria-hidden="true" />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(7,19,31,0.92)] via-[rgba(7,19,31,0.52)] to-transparent px-5 pb-5 pt-16 text-white">
                <p className="font-mono text-[0.62rem] font-black uppercase tracking-[0.18em] text-[var(--gold)]">New official logo</p>
                <p className="mt-2 text-xl font-black tracking-[-0.04em]">King Sparkon Tracker</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-[1.65rem] border border-[var(--line)] bg-white/88 p-4 shadow-[var(--shadow-soft)] backdrop-blur">
        <p className="mb-3 font-mono text-[0.68rem] font-black uppercase tracking-[0.16em] text-[var(--muted)]">Official profiles</p>
        <SocialLinks variant="light" />
      </div>
    </div>
  );
}
