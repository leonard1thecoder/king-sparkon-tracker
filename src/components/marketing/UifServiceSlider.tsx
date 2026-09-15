"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calculator, Landmark, ShieldCheck, UserCheck } from "lucide-react";
import { UIFCalculator } from "@/components/uif/UIFCalculator";

type SlideKey = "status" | "password" | "calculator";

const SLIDES: { key: SlideKey; label: string; hash: string }[] = [
  { key: "status", label: "Check Status", hash: "#uif-status" },
  { key: "password", label: "Update Password", hash: "#uif-password" },
  { key: "calculator", label: "UIF Calculator", hash: "#uif-calculator" },
];

function slideFromHash(hash: string): SlideKey | null {
  if (hash === "#uif-status") return "status";
  if (hash === "#uif-password") return "password";
  if (hash === "#uif-calculator") return "calculator";
  return null;
}

export function UifServiceSlider() {
  const [active, setActive] = useState<SlideKey>("status");
  const activeIndex = active === "status" ? 0 : active === "password" ? 1 : 2;
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);

  // Deep-link support: /uif#uif-calculator opens the calculator slide.
  // Uses native history API so it stays in sync with Next.js router.
  useEffect(() => {
    const fromHash = slideFromHash(window.location.hash);
    if (fromHash) setActive(fromHash);
    const onHashChange = () => {
      const next = slideFromHash(window.location.hash);
      if (next) setActive(next);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // Collapse the viewport to the active slide's height so shorter slides don't
  // leave empty space below their content (the flex track otherwise stays as
  // tall as the tallest slide — e.g. the calculator — pushing dots/footer down).
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const updateHeight = () => {
      const slide = viewport.querySelector<HTMLElement>(`[data-slide="${active}"]`);
      if (slide) setViewportHeight(slide.offsetHeight);
    };
    updateHeight();
    const slides = Array.from(viewport.querySelectorAll<HTMLElement>("[data-slide]"));
    const observer = new ResizeObserver(updateHeight);
    slides.forEach((slide) => observer.observe(slide));
    window.addEventListener("resize", updateHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, [active]);

  const select = useCallback((key: SlideKey) => {
    setActive(key);
    const hash = SLIDES.find((s) => s.key === key)?.hash ?? "";
    // Update URL without triggering a scroll jump; the slider stays in view
    // and the slide switches on click, mirroring HowItWorksRoleSlider.
    window.history.replaceState(null, "", hash);
  }, []);

  return (
    <div id="uif-services" className="scroll-mt-28">
      <div className="flex flex-wrap justify-center gap-3">
        {SLIDES.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => select(s.key)}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-extrabold transition ${
              active === s.key
                ? "border-[var(--signal)] bg-[var(--signal)] text-white shadow-[var(--shadow-soft)]"
                : "border-[var(--line-strong)] bg-white text-[var(--ink)] hover:border-[var(--signal)] hover:text-[var(--signal-strong)]"
            }`}
            aria-pressed={active === s.key}
          >
            {s.label} {active === s.key ? <ArrowRight className="h-4 w-4" /> : null}
          </button>
        ))}
      </div>

      <div className="mt-8 scroll-mt-28 overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow-soft)]">
        <div ref={viewportRef} className="relative overflow-hidden transition-[height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" style={{ height: viewportHeight ?? undefined }}>
          <div
            className="flex items-start transition-transform duration-[2000ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {/* Status Slide */}
            <div id="uif-status" data-slide="status" className="w-full shrink-0 scroll-mt-28 p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-[var(--line)] bg-[var(--signal-soft)] text-[var(--signal)]">
                  <UserCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--signal-strong)]">UIF Status</p>
                  <h3 className="mt-1 text-2xl font-black tracking-[-0.04em] md:text-3xl">Check UIF status with your SA ID</h3>
                </div>
              </div>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--steel)]">
                Verify benefit application status, claim numbers, and application dates directly using your 13-digit SA ID number. Personal identifiers are processed strictly on-demand under POPIA safeguards.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {[
                  { n: "01", title: "Enter 13-digit ID", copy: "Digits only, validated inline before anything is sent." },
                  { n: "02", title: "Fetch benefit history", copy: "Rows come straight from UIF Online — type, number, date, claim status." },
                  { n: "03", title: "Nothing stored", copy: "No caching, no selling, no third-party sharing of your ID." },
                ].map((s) => (
                  <div key={s.n} className="rounded-xl border border-[var(--line)] bg-white p-5">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-black text-[var(--signal-strong)]">{s.n}</span>
                      <h4 className="font-black">{s.title}</h4>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[var(--steel)]">{s.copy}</p>
                  </div>
                ))}
              </div>
              <Link
                href="/dashboard/user/uif/status"
                className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-extrabold text-white hover:bg-[var(--signal-strong)]"
              >
                Check UIF Status <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Password Slide */}
            <div id="uif-password" data-slide="password" className="w-full shrink-0 scroll-mt-28 p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-[var(--line)] bg-[var(--signal-soft)] text-[var(--signal)]">
                  <Landmark className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--signal-strong)]">UIF Password</p>
                  <h3 className="mt-1 text-2xl font-black tracking-[-0.04em] md:text-3xl">Update your UIF Online password</h3>
                </div>
              </div>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--steel)]">
                Reset or update your UIF Online portal password securely with standard 8-12 character rules (1 uppercase, 1 number, 1 special). A R14.28 service fee is added to cart before payment.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {[
                  { n: "01", title: "Confirm 13-digit ID", copy: "We verify the ID first, then reveal the password step." },
                  { n: "02", title: "Choose strong password", copy: "8-12 chars with live strength and match checks." },
                  { n: "03", title: "Add R14.28 to cart", copy: "Pay via the existing shop cart — then the reset is queued." },
                ].map((s) => (
                  <div key={s.n} className="rounded-xl border border-[var(--line)] bg-white p-5">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-black text-[var(--signal-strong)]">{s.n}</span>
                      <h4 className="font-black">{s.title}</h4>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[var(--steel)]">{s.copy}</p>
                  </div>
                ))}
              </div>
              <Link
                href="/dashboard/user/uif/password"
                className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-extrabold text-white hover:bg-[var(--signal-strong)]"
              >
                Update UIF Password <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Calculator Slide */}
            <div id="uif-calculator" data-slide="calculator" className="w-full shrink-0 scroll-mt-28 p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-[var(--line)] bg-[var(--signal-soft)] text-[var(--signal)]">
                  <Calculator className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--signal-strong)]">UIF Calculator</p>
                  <h3 className="mt-1 text-2xl font-black tracking-[-0.04em] md:text-3xl">Estimate contributions & benefits</h3>
                </div>
              </div>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--steel)]">
                Step through employment dates, income, and contribution history to estimate what you may claim. Click the “UIF Calculator” button above at any time to jump straight here.
              </p>
              <div className="mt-6">
                <UIFCalculator />
              </div>
              <p className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[var(--steel)]">
                <ShieldCheck className="h-4 w-4 text-[var(--signal)]" /> Estimates only — final benefits are confirmed by the Department of Employment and Labour.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 border-t border-[var(--line)] bg-[var(--surface)]/60 px-4 py-3">
          {SLIDES.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => select(s.key)}
              aria-label={`Show ${s.label} slide`}
              aria-current={active === s.key ? "true" : undefined}
              className={`h-2.5 rounded-full transition-all ${
                active === s.key ? "w-8 bg-[var(--signal)]" : "w-2.5 bg-[var(--line)] hover:bg-[var(--line-strong)]"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
