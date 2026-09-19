import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Home, Search } from "lucide-react";

export const metadata: Metadata = { title: "Page Not Found", description: "Return to King Sparkon Tracker." };

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white px-6 py-8 text-[var(--ink)]">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl flex-col items-center justify-center text-center">
        <Link href="/" className="mb-10 inline-flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--steel)] hover:border-[var(--accent-hover)] hover:text-[var(--accent-hover)] transition-all duration-200">
          <Image src="/king-sparkon-logo.svg" alt="King Sparkon logo" width={102} height={45} className="h-10 w-auto object-contain" />
        </Link>
        <div className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--line-strong)] bg-[var(--signal-soft)] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--signal-strong)]"><Search className="h-4 w-4" />404</div>
        <h1 className="mt-6 max-w-3xl text-5xl font-black leading-tight tracking-[-0.05em] md:text-7xl">This route is not in the inventory map.</h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--steel)] md:text-lg">The page may have moved, or the workflow you need is inside your authenticated dashboard.</p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link data-orange-hover="true" href="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--signal)] bg-[var(--signal)] px-6 py-3 text-sm font-extrabold text-white hover:border-[var(--accent-hover)] hover:bg-[var(--accent-hover)] transition-all duration-200">Open dashboard <ArrowRight className="h-4 w-4" /></Link>
          <Link href="/" className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--line-strong)] bg-white px-6 py-3 text-sm font-extrabold text-[var(--ink)] hover:border-[var(--accent-hover)] hover:text-[var(--accent-hover)] transition-all duration-200"><Home className="h-4 w-4" />Back home</Link>
        </div>
      </div>
    </main>
  );
}
