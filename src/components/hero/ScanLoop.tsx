"use client";

import Image from "next/image";
import { Sparkles } from "lucide-react";

const previewTerminalMetrics = [
  ["Brand view", "4K"],
  ["Logo status", "Live"],
  ["Tab icon", "Synced"],
] as const;

export function ScanLoop() {
  return (
    <div className="relative mx-auto w-full max-w-xl [perspective:1200px]">
      <div className="absolute -inset-5 rounded-[3rem] bg-gradient-to-br from-[var(--gold)]/32 via-white to-[var(--ember)]/18 blur-2xl" />
      <div className="relative rounded-[2.25rem] border border-[var(--line)] bg-white p-3 shadow-[var(--shadow-depth)] [transform:rotateX(4deg)_rotateY(-7deg)]">
        <div className="relative overflow-hidden rounded-[1.85rem] border border-[var(--line)] bg-[var(--ink)] scan-grid">
          <div className="relative z-20 flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
            <div>
              <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[var(--gold)]">Brand hero preview</p>
              <p className="mt-1 text-sm font-semibold text-white/62">King Sparkon Tracker crown logo</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--confirm)]/40 bg-[var(--confirm)]/20 px-3 py-1 text-xs font-black text-white">
              <Sparkles className="h-3.5 w-3.5 text-[var(--gold)]" /> Live
            </span>
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

            <div className="relative mx-auto my-3 w-full overflow-hidden rounded-[1.85rem] border border-white/18 bg-white shadow-[0_28px_80px_rgba(0,0,0,0.38)]">
              <div className="relative aspect-[4/5] w-full">
                <Image
                  src="/king-sparkon-logo.png"
                  alt="King Sparkon Tracker Lego king crown logo"
                  fill
                  priority
                  sizes="(min-width: 1024px) 520px, 92vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(7,19,31,0.9)] via-[rgba(7,19,31,0.42)] to-transparent p-5 text-white">
                <p className="font-mono text-[0.62rem] font-black uppercase tracking-[0.18em] text-[var(--gold)]">Final brand touch</p>
                <p className="mt-2 text-2xl font-black tracking-[-0.04em]">Logo, browser tab, and hero are now one identity.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
