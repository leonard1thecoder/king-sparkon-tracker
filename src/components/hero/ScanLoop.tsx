"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Copy, ExternalLink, QrCode, RotateCw, Share2, Sparkles } from "lucide-react";

const previewTerminalMetrics = [
  ["Preview products", "18.4K"],
  ["QR shares", "426K"],
  ["Preview alerts", "07"],
] as const;

const socialShareLinks: Array<{ label: string; shortLabel: string; buildHref: (url: string) => string }> = [
  { label: "Facebook", shortLabel: "f", buildHref: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
  { label: "X", shortLabel: "X", buildHref: (url) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent("King Sparkon Tracker - scan, track, verify, and report smarter.")}` },
  { label: "LinkedIn", shortLabel: "in", buildHref: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
  { label: "WhatsApp", shortLabel: "WA", buildHref: (url) => `https://wa.me/?text=${encodeURIComponent(`King Sparkon Tracker: ${url}`)}` },
  { label: "GitHub", shortLabel: "GH", buildHref: (url) => `https://github.com/leonard1thecoder/king-sparkon-tracker?ref=${encodeURIComponent(url)}` },
];

const defaultShareUrl = "https://king-sparkon-tracker.vercel.app";

export function ScanLoop() {
  const [shareUrl, setShareUrl] = useState(defaultShareUrl);
  const [qrActive, setQrActive] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setShareUrl(window.location.origin || defaultShareUrl);
  }, []);

  const qrImageUrl = useMemo(() => {
    const encodedWebsiteUrl = encodeURIComponent(shareUrl);
    return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=14&ecc=H&data=${encodedWebsiteUrl}`;
  }, [shareUrl]);

  const handleCopyWebsite = async () => {
    setQrActive(true);

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-xl [perspective:1200px]">
      <div className="relative rounded-[2.25rem] border border-[var(--line)] bg-white p-3 shadow-[var(--shadow-depth)] [transform:rotateX(4deg)_rotateY(-7deg)]">
        <div className="relative overflow-hidden rounded-[1.85rem] border border-[var(--line)] bg-[var(--ink)] scan-grid">
          <div className="relative z-10 flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
            <div>
              <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[var(--gold)]">QR share terminal</p>
              <p className="mt-1 text-sm font-semibold text-white/62">Website-ready scan view</p>
            </div>
            <span className="rounded-full border border-[var(--confirm)]/40 bg-[var(--confirm)]/20 px-3 py-1 text-xs font-black text-white">Online</span>
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

            <div className="relative mx-auto my-3 w-[88%] min-w-0">
              <div className="relative min-h-[26rem] [transform-style:preserve-3d]">
                <div
                  className={`absolute inset-0 rounded-[1.65rem] border border-white/18 bg-white p-5 text-[var(--ink)] shadow-[0_28px_80px_rgba(0,0,0,0.38)] transition-transform duration-700 [backface-visibility:hidden] ${qrActive ? "[transform:rotateY(180deg)]" : "[transform:rotateY(0deg)]"}`}
                  aria-hidden={qrActive}
                >
                  <div className="flex items-center justify-between gap-3 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[var(--steel)]">
                    <span>DEMO-QR-SHARE</span>
                    <span className="rounded-full bg-[rgba(21,128,61,0.1)] px-2.5 py-1 font-black text-[var(--confirm)]">Ready</span>
                  </div>

                  <div className="relative my-5 overflow-hidden rounded-[1.35rem] border border-[var(--line)] bg-[var(--surface)] p-4">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(40,214,198,0.20),transparent_12rem),radial-gradient(circle_at_80%_70%,rgba(249,115,22,0.14),transparent_10rem)]" />
                    <div className="relative mx-auto grid aspect-square max-w-[13rem] grid-cols-5 gap-2 rounded-[1.25rem] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-soft)]">
                      {Array.from({ length: 25 }).map((_, index) => {
                        const isAnchor = index === 0 || index === 4 || index === 20;
                        const isFilled = [1, 3, 5, 7, 8, 11, 12, 16, 17, 19, 21, 22, 24].includes(index);

                        return (
                          <span
                            key={index}
                            className={`rounded-[0.35rem] ${isAnchor ? "border-[0.35rem] border-[var(--ink)] bg-white" : isFilled ? "bg-[var(--ink)]" : "bg-[var(--surface)]"}`}
                          />
                        );
                      })}
                    </div>
                    <div className="scan-sweep pointer-events-none absolute left-5 right-5 top-5 h-1 rounded-full bg-[var(--signal)] shadow-[0_0_30px_var(--signal)]" />
                  </div>

                  <button
                    type="button"
                    onClick={() => setQrActive(true)}
                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ink)]"
                  >
                    <Share2 className="h-4 w-4" />
                    Scan to share
                  </button>

                  <div className="mt-4 grid grid-cols-5 gap-2" aria-label="Share King Sparkon Tracker on social platforms">
                    {socialShareLinks.map(({ label, shortLabel, buildHref }) => (
                      <a
                        key={label}
                        href={buildHref(shareUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="group grid min-h-11 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[0.68rem] font-black uppercase tracking-[0.08em] text-[var(--steel)] hover:border-[var(--gold)] hover:bg-white hover:text-[var(--ink)]"
                        aria-label={`Share on ${label}`}
                        title={label}
                      >
                        {shortLabel}
                      </a>
                    ))}
                  </div>
                </div>

                <div
                  className={`absolute inset-0 rounded-[1.65rem] border border-white/18 bg-white p-5 text-[var(--ink)] shadow-[0_28px_80px_rgba(0,0,0,0.38)] transition-transform duration-700 [backface-visibility:hidden] ${qrActive ? "[transform:rotateY(0deg)]" : "[transform:rotateY(-180deg)]"}`}
                  aria-hidden={!qrActive}
                >
                  <div className="flex items-center justify-between gap-3 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[var(--steel)]">
                    <span>LIVE-WEBSITE-QR</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(21,128,61,0.1)] px-2.5 py-1 font-black text-[var(--confirm)]"><CheckCircle2 className="h-3.5 w-3.5" />Real QR</span>
                  </div>

                  <div className="my-5 rounded-[1.45rem] border border-[var(--line)] bg-[var(--surface)] p-3 shadow-[var(--shadow-soft)]">
                    <div className="rounded-[1.15rem] border border-[var(--line)] bg-white p-3">
                      <img src={qrImageUrl} alt={`QR code to open ${shareUrl}`} className="mx-auto aspect-square w-full max-w-[15rem] rounded-[0.75rem]" loading="lazy" />
                    </div>
                    <p className="mt-3 break-all text-center font-mono text-[0.64rem] font-bold uppercase tracking-[0.08em] text-[var(--steel)]">{shareUrl}</p>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={handleCopyWebsite}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-4 text-sm font-black text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ink)]"
                    >
                      <Copy className="h-4 w-4" />
                      {copied ? "Copied" : "Copy link"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setQrActive(false)}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 text-sm font-black text-[var(--ink)] shadow-[var(--shadow-soft)] hover:border-[var(--gold)]"
                    >
                      <RotateCw className="h-4 w-4" />
                      Back
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-[0.64rem] uppercase tracking-[0.14em] text-white/55">
                <span className="inline-flex items-center gap-1"><QrCode className="h-3.5 w-3.5" />QR</span>
                <span className="inline-flex items-center gap-1"><Sparkles className="h-3.5 w-3.5" />Share</span>
                <span className="inline-flex items-center gap-1"><ExternalLink className="h-3.5 w-3.5" />Socials</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
