import Link from "next/link";
import type { ReactNode } from "react";

export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="border border-transparent px-3 py-2 font-mono text-xs font-bold uppercase tracking-[0.1em] text-white/70 hover:border-white/15 hover:bg-white/5 hover:text-white">
      {children}
    </Link>
  );
}
