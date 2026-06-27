"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

function isRoleDashboardRoot(href: string) {
  const segments = href.split("/").filter(Boolean);
  return segments.length === 2 && segments[0] === "dashboard";
}

export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href || (!isRoleDashboardRoot(href) && pathname.startsWith(href + "/"));

  return (
    <Link
      href={href}
      className={cn(
        "shrink-0 rounded-[var(--radius-md)] border px-3.5 py-2.5 font-mono text-[0.68rem] font-bold uppercase tracking-[0.1em] lg:w-full",
        isActive
          ? "border-[var(--signal)] bg-[var(--signal)] text-white shadow-[var(--shadow-soft)]"
          : "border-transparent text-white/68 hover:border-white/15 hover:bg-white/6 hover:text-white",
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </Link>
  );
}
