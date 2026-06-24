import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ArrowRight, Home, Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Page Not Found",
  description:
    "Return to King Sparkon Tracker's barcode inventory dashboard or landing page.",
};

export default function NotFound() {
  return (
    <main className="crypto-screen relative min-h-screen overflow-hidden bg-[#000510] px-6 py-8 text-white">
      <div className="crypto-grid absolute inset-0 opacity-[0.04]" />
      <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#99E39E]/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#1DC8CD]/16 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl flex-col items-center justify-center text-center">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/80 hover:border-[#99E39E]/50 hover:text-[#99E39E]"
        >
          <Image
            src="/king-sparkon-logo.png"
            alt="King Sparkon Tracker"
            width={30}
            height={30}
            className="h-7 w-7 object-contain"
            priority
          />
          King Sparkon Tracker
        </Link>

        <div className="inline-flex items-center gap-2 rounded-full border border-[#99E39E]/30 bg-[#99E39E]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.32em] text-[#99E39E]">
          <Search className="h-4 w-4" />
          404
        </div>
        <h1 className="mt-6 max-w-3xl text-5xl font-bold leading-tight tracking-normal text-white md:text-7xl">
          This route is not in the inventory map.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-white/62 md:text-lg">
          The page may have moved, or the barcode workflow you need is inside
          your authenticated dashboard.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#99E39E] px-6 py-3 text-sm font-bold text-[#000510] shadow-[0_18px_44px_rgba(153,227,158,0.26)] hover:bg-[#8bd890]"
          >
            Open dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-6 py-3 text-sm font-bold text-white hover:border-[#99E39E]/45 hover:text-[#99E39E]"
          >
            <Home className="h-4 w-4" />
            Back home
          </Link>
        </div>
      </div>
    </main>
  );
}
