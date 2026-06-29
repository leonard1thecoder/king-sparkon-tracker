"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Copy, ExternalLink, QrCode, RotateCw, Share2, Sparkles } from "lucide-react";

const previewTerminalMetrics = [
  ["Products", "18.4K"],
  ["QR shares", "426K"],
  ["Alerts", "07"],
] as const;

const brandSocialLinks = [
  { label: "Facebook", href: "https://www.facebook.com/KingSparkonTracker" },
  { label: "Instagram", href: "https://www.instagram.com/kingsparkontracker/" },
  { label: "X", href: "https://x.com/KingSparkon" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/king-sparkon-tracker/" },
  { label: "GitHub", href: "https://github.com/leonard1thecoder" },
] as const;

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
    <div className="relative mx-auto w-full max-w-lg [perspective:1200px]">
      <div className="relative rounded-[2rem] border border-[var(--line)] bg-white p-2 shadow-[var(--shadow-depth)] [transform:rotateX(3deg)_rotateY(-4deg)] sm:p-3">
        <div className="relative overflow-hidden rounded-[1.65rem] border border-[var(--line)] bg-[var(--ink)] scan-grid">
          <div className="relative z-10 flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <div>
              <p className="font-mono text-[0.58rem] font-bold uppercase tracking-[0.18em] text-[var(--gold)]">QR share terminal</p>
              <p className="mt-1 text-xs font-semibold text-white/62 sm:text-sm">Website-ready scan view</p>
            </div>
            <span className="rounded-full border border-[var(--confirm)]/40 bg-[var(--confirm)]/20 px-2.5 py-1 text-[0.68rem] font-black text-white">Online</span>
          </div>

          <div className="relative z-10 grid gap-3 p-4">
            <div className="grid gap-2 sm:grid-cols-3">
              {previewTerminalMetrics.map(([label, value]) => (
                <div key={label} className="rounded-[1.05rem] border border-white/10 bg-white/[0.06] p-2.5 shadow-[var(--shadow-soft)] backdrop-blur">
                  <p className="font-mono text-[0.52rem] uppercase tracking-[0.14em] text-white/38">{label}</p>
                  <p className="money mt-1 text-base font-black text-white">{value}</p>
                </div>
              ))}
            </div>

            <div className="relative mx-auto my-2 w-full max-w-sm min-w-0 sm:max-w-md">
              <div className="relative min-h-[23.5rem] [transform-style:preserve-3d] sm:min-h-[24rem]">
                <div
                  className={`absolute inset-0 rounded-[1.45rem] border border-white/18 bg-white p-4 text-[var(--ink)] shadow-[0_24px_70px_rgba(0,0,0,0.34)] transition-transform duration-700 [backface-visibility:hidden] ${qrActive ? "[transform:rotateY(180deg)]" : "[transform:rotateY(0deg)]"}`}
                  aria-hidden={qrActive}
                >
                  <div className="flex items-center justify-between gap-3 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-[var(--steel)]">
                    <span>DEMO-QR-SHARE</span>
                    <span className="rounded-full bg-[rgba(21,128,61,0.1)] px-2.5 py-1 font-black text-[var(--confirm)]">Ready</span>
                  </div>

                  <div className="relative my-4 overflow-hidden rounded-[1.2rem] border border-[var(--line)] bg-[var(--surface)] p-3">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(40,214,198,0.20),transparent_12rem),radial-gradient(circle_at_80%_70%,rgba(249,115,22,0.14),transparent_10rem)]" />
                    <div className="relative mx-auto grid aspect-square max-w-[10.25rem] grid-cols-5 gap-1.5 rounded-[1rem] border border-[var(--line)] bg-white p-3 shadow-[var(--shadow-soft)]">
                      {Array.from({ length: 25 }).map((_, index) => {
                        const isAnchor = index === 0 || index === 4 || index === 20;
                        const isFilled = [1, 3, 5, 7, 8, 11, 12, 16, 17, 19, 21, 22, 24].includes(index);

                        return (
                          <span
                            key={index}
                            className={`rounded-[0.28rem] ${isAnchor ? "border-[0.3rem] border-[var(--ink)] bg-white" : isFilled ? "bg-[var(--ink)]" : "bg-[var(--surface)]"}`}
                          />
                        );
                      })}
                    </div>
                    <div className="qr-scan-sweep pointer-events-none absolute left-3 right-3 h-1 rounded-full bg-[var(--signal)] shadow-[0_0_30px_var(--signal)]" />
                  </div>

                  <button
                    type="button"
                    onClick={() => setQrActive(true)}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ink)]"
                  >
                    <Share2 className="h-4 w-4" />
                    Scan to share
                  </button>

                  <div className="mt-3 rounded-[1.15rem] border border-[var(--line)] bg-[var(--surface)] p-2.5">
                    <p className="mb-2 font-mono text-[0.55rem] font-black uppercase tracking-[0.16em] text-[var(--signal)]">King Sparkon Tracker socials</p>
                    <div className="flex flex-wrap gap-1.5" aria-label="King Sparkon Tracker social links">
                      {brandSocialLinks.map(({ label, href }) => (
                        <a
                          key={label}
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-h-8 items-center justify-center rounded-full border border-[var(--line)] bg-white px-2.5 text-[0.66rem] font-black text-[var(--steel)] hover:border-[var(--gold)] hover:text-[var(--ink)]"
                          aria-label={`Open King Sparkon Tracker on ${label}`}
                        >
                          {label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                <div
                  className={`absolute inset-0 rounded-[1.45rem] border border-white/18 bg-white p-4 text-[var(--ink)] shadow-[0_24px_70px_rgba(0,0,0,0.34)] transition-transform duration-700 [backface-visibility:hidden] ${qrActive ? "[transform:rotateY(0deg)]" : "[transform:rotateY(-180deg)]"}`}
                  aria-hidden={!qrActive}
                >
                  <div className="flex items-center justify-between gap-3 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-[var(--steel)]">
                    <span>LIVE-WEBSITE-QR</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(21,128,61,0.1)] px-2.5 py-1 font-black text-[var(--confirm)]"><CheckCircle2 className="h-3.5 w-3.5" />Real QR</span>
                  </div>

                  <div className="relative my-4 overflow-hidden rounded-[1.25rem] border border-[var(--line)] bg-[var(--surface)] p-3 shadow-[var(--shadow-soft)]">
                    <div className="rounded-[1rem] border border-[var(--line)] bg-white p-2.5">
                      <img src={qrImageUrl} alt={`QR code to open ${shareUrl}`} className="mx-auto aspect-square w-full max-w-[11.75rem] rounded-[0.65rem]" loading="lazy" />
                    </div>
                    <div className="qr-scan-sweep pointer-events-none absolute left-3 right-3 h-1 rounded-full bg-[var(--signal)] shadow-[0_0_30px_var(--signal)]" />
                    <p className="mt-3 break-all text-center font-mono text-[0.58rem] font-bold uppercase tracking-[0.08em] text-[var(--steel)]">{shareUrl}</p>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={handleCopyWebsite}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-4 text-xs font-black text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ink)] sm:text-sm"
                    >
                      <Copy className="h-4 w-4" />
                      {copied ? "Copied" : "Copy link"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setQrActive(false)}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 text-xs font-black text-[var(--ink)] shadow-[var(--shadow-soft)] hover:border-[var(--gold)] sm:text-sm"
                    >
                      <RotateCw className="h-4 w-4" />
                      Back
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-2 grid grid-cols-3 gap-2 text-[0.6rem] uppercase tracking-[0.14em] text-white/55">
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
