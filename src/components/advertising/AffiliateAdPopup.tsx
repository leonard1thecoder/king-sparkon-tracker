"use client";

import { ArrowRight, X } from "lucide-react";
import type { AffiliateAd } from "./affiliate-ads";

type AffiliateAdPopupProps = {
  ad: AffiliateAd;
  onClose: () => void;
  onAffiliateClick: () => void;
};

export function AffiliateAdPopup({ ad, onClose, onAffiliateClick }: AffiliateAdPopupProps) {
  return (
    <div
      role="region"
      aria-label={`Sponsored advertisement for ${ad.advertiser}`}
      className="affiliate-ad-root pointer-events-none fixed inset-x-3 bottom-3 z-[75] sm:inset-auto sm:bottom-6 sm:left-1/2 sm:w-[400px] sm:max-w-[calc(100vw-48px)] sm:-translate-x-1/2"
    >
      <div className="affiliate-ad-card pointer-events-auto relative flex max-h-[min(88vh,640px)] w-full flex-col overflow-hidden rounded-[20px] border border-[var(--line)] bg-white shadow-[0_16px_48px_rgba(15,23,42,0.14),0_4px_12px_rgba(15,23,42,0.08)]">
        {/* Header – sponsored + close */}
        <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-3 sm:px-5 sm:pt-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--signal-soft)] px-2.5 py-1 font-mono text-[0.62rem] font-black uppercase tracking-[0.14em] text-[var(--signal-strong)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--signal)]" aria-hidden="true" />
            {ad.label}
          </span>

          <button
            type="button"
            aria-label="Close advertisement"
            onClick={onClose}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)] focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Image – contain, no crop, preserves advertiser creative */}
        <div className="relative w-full bg-slate-50 px-3 pb-1 sm:px-4">
          <div className="overflow-hidden rounded-[14px] border border-slate-100 bg-white">
            <img
              src={ad.imageUrl}
              alt={ad.alt}
              width={800}
              height={600}
              loading="lazy"
              decoding="async"
              className="h-auto max-h-[280px] w-full object-contain sm:max-h-[300px]"
              style={{ aspectRatio: "auto" }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="grid gap-3 px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4">
          <div className="grid gap-1">
            <p className="text-[13px] font-extrabold tracking-[-0.02em] text-[var(--ink)] sm:text-[14px]">
              {ad.advertiser}
            </p>
            <p className="text-[12.5px] font-semibold leading-5 text-[var(--steel)]">
              Discover your next pair of designer glasses.
            </p>
          </div>

          <a
            href={ad.affiliateUrl}
            target="_blank"
            rel="sponsored noopener noreferrer"
            onClick={onAffiliateClick}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[var(--signal)] bg-[var(--signal)] px-5 py-3 text-center text-sm font-black text-white shadow-[0_8px_20px_rgba(14,165,233,0.22)] transition hover:-translate-y-px hover:border-[var(--signal-strong)] hover:bg-[var(--signal-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)] focus-visible:ring-offset-2 active:translate-y-0"
          >
            {ad.ctaText}
            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          </a>

          <p className="text-center font-mono text-[0.58rem] font-semibold uppercase tracking-[0.08em] text-slate-400">
            Affiliate advertisement · Opens in new tab
          </p>
        </div>
      </div>

      <style jsx>{`
        .affiliate-ad-root {
          animation: affiliateSlideIn 260ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .affiliate-ad-card {
          animation: affiliateSlideIn 260ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes affiliateSlideIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .affiliate-ad-root,
          .affiliate-ad-card {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
