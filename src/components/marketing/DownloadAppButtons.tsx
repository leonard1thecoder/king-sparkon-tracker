import Link from "next/link";
import { ArrowRight, Smartphone } from "lucide-react";
import { DOWNLOAD_SECTION_HREF, appDownloadLinks } from "@/lib/app-download";
import { cn } from "@/lib/utils/cn";

/** Teaser button — always scrolls to the landing download section. */
export function DownloadAppButton({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link
      href={DOWNLOAD_SECTION_HREF}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-extrabold text-white hover:bg-[var(--signal-strong)]",
        compact && "min-h-9 px-2.5 text-xs",
        className,
      )}
    >
      <Smartphone className="h-4 w-4" />
      {compact ? "App" : "Download app"}
    </Link>
  );
}

/** The store button for the download section (Android only for now). */
export function StoreButtons({ dark = false }: { dark?: boolean }) {
  const { android, configured } = appDownloadLinks();

  return (
    <div className="grid w-full gap-3">
      <Link
        href={android}
        className={cn(
          "group flex min-h-14 items-center gap-4 rounded-2xl border px-5 py-3 transition",
          dark
            ? "border-white/15 bg-white/[0.06] text-white hover:border-[var(--gold)] hover:bg-white/10"
            : "border-[var(--line-strong)] bg-white text-[var(--ink)] hover:border-[var(--signal)]",
        )}
      >
        <span
          className={cn(
            "grid h-11 shrink-0 place-items-center rounded-xl px-2.5 text-xs font-black uppercase tracking-wider",
            dark ? "bg-[var(--gold)] text-[var(--ink)]" : "bg-[var(--ink)] text-[var(--gold)]",
          )}
        >
          Android
        </span>
        <span className="min-w-0 text-left">
          <span className={cn("block text-[0.65rem] font-extrabold uppercase tracking-[0.14em]", dark ? "text-white/60" : "text-[var(--steel)]")}>
            Google Play
          </span>
          <span className="block truncate text-base font-black tracking-[-0.02em]">
            Download for Android <ArrowRight className="inline h-4 w-4 transition group-hover:translate-x-0.5" />
          </span>
        </span>
      </Link>
      {!configured ? (
        <p className={cn("text-xs font-semibold leading-5", dark ? "text-white/55" : "text-[var(--muted)]")}>
          iOS app coming soon.
        </p>
      ) : null}
    </div>
  );
}

/** Landing section: Download King Sparkon. All teaser buttons land here. */
export function DownloadAppSection() {
  return (
    <section id="download" className="scroll-mt-24 border-t border-[var(--line)] bg-white px-5 py-10 md:px-8 lg:py-14">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[2rem] bg-[var(--ink)] p-6 text-white shadow-[var(--shadow-depth)] md:p-10">
          <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[var(--gold)]/20 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-28 left-10 h-72 w-72 rounded-full bg-[var(--signal)]/20 blur-3xl" aria-hidden="true" />
          <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[var(--gold)]">Native apps</p>
              <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] md:text-5xl">Download King Sparkon.</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/70 md:text-base">
                The user and worker dashboards as native Android and iOS apps: scan barcodes at the counter, buy
                products and tickets, tip workers, track jobs and check UIF — with the same role-safe backend as the web.
              </p>
              <ul className="mt-6 grid gap-2 text-sm font-semibold text-white/75 sm:grid-cols-2">
                {["Counter barcode scanner", "Shop, tickets & tip cart", "Jobs & applications", "UIF status & password"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--gold)]" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <StoreButtons dark />
          </div>
        </div>
      </div>
    </section>
  );
}
