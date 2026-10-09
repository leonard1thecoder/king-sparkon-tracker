"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { UIFCalculator } from "@/components/uif/UIFCalculator";

type ToolKey = "status" | "password" | "calculator";

const TOOLS: { key: ToolKey; label: string; hash: string }[] = [
  { key: "status", label: "Check Status", hash: "#uif-status" },
  { key: "password", label: "Update Password", hash: "#uif-password" },
  { key: "calculator", label: "UIF Calculator", hash: "#uif-calculator" },
];

function toolFromHash(hash: string): ToolKey | null {
  return TOOLS.find((tool) => tool.hash === hash)?.key ?? null;
}

// One tool visible at a time. Hash deep links (/uif#uif-calculator) still open
// the matching tool. Inactive panels stay mounted, so calculator progress is kept.
export function UifTools() {
  const [active, setActive] = useState<ToolKey>("status");

  useEffect(() => {
    const initial = toolFromHash(window.location.hash);
    if (initial) setActive(initial);
    const onHashChange = () => {
      const next = toolFromHash(window.location.hash);
      if (next) setActive(next);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  function select(key: ToolKey) {
    setActive(key);
    const hash = TOOLS.find((tool) => tool.key === key)?.hash ?? "";
    window.history.replaceState(null, "", hash);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="UIF tools">
        {TOOLS.map((tool) => {
          const selected = active === tool.key;
          return (
            <button
              key={tool.key}
              type="button"
              aria-pressed={selected}
              onClick={() => select(tool.key)}
              className={`ks-btn ks-btn-sm ${selected ? "ks-btn-primary" : "ks-btn-secondary"}`}
            >
              {tool.label}
            </button>
          );
        })}
      </div>

      <section
        id="uif-status"
        aria-labelledby="uif-status-title"
        hidden={active !== "status"}
        className="ks-panel ks-surface mt-6 rounded-[18px] border border-[var(--ks-line)] p-6 md:p-8"
      >
        <h2 id="uif-status-title" className="text-2xl font-extrabold tracking-tight text-[var(--ks-ink)]">
          Check your UIF claim status
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ks-muted)]">
          Sign in, then enter your 13-digit SA ID number to see claim numbers and application dates.
        </p>
        <Link href="/dashboard/user/uif/status" className="ks-btn ks-btn-primary mt-6">
          Check status
        </Link>
      </section>

      <section
        id="uif-password"
        aria-labelledby="uif-password-title"
        hidden={active !== "password"}
        className="ks-panel ks-surface mt-6 rounded-[18px] border border-[var(--ks-line)] p-6 md:p-8"
      >
        <h2 id="uif-password-title" className="text-2xl font-extrabold tracking-tight text-[var(--ks-ink)]">
          Update your UIF password
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ks-muted)]">
          Reset your UIF Online portal password. It must be 8 to 12 characters, with one uppercase letter, one number and one special character. A R14.28 service fee is added to your cart before payment.
        </p>
        <Link href="/dashboard/user/uif/password" className="ks-btn ks-btn-primary mt-6">
          Update password
        </Link>
      </section>

      <section
        id="uif-calculator"
        aria-labelledby="uif-calculator-title"
        hidden={active !== "calculator"}
        className="ks-panel mt-6"
      >
        <h2 id="uif-calculator-title" className="text-2xl font-extrabold tracking-tight text-[var(--ks-ink)]">
          Estimate your UIF benefit
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ks-muted)]">
          Three short steps. These are estimates only. The Department of Employment and Labour confirms final benefits.
        </p>
        <div className="mt-6">
          <UIFCalculator />
        </div>
      </section>
    </div>
  );
}
