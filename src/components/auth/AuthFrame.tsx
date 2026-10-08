import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

// Focused single-column frame for /login and /register. No marketing panels,
// no feature copy, no footer. The card is the only thing on the screen.
// Bottom padding on small screens keeps the primary button clear of the cookie
// consent banner, which is fixed to the bottom of the viewport.
export function AuthFrame({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[var(--surface)] px-5 pb-48 pt-12 text-[var(--ink)] md:pb-12">
      <div className="w-full max-w-[22rem]">
        <Link href="/" aria-label="King Sparkon home" className="mb-10 flex justify-center">
          <Image src="/king-sparkon-logo.svg" alt="King Sparkon" width={150} height={66} priority />
        </Link>
        {children}
      </div>
    </main>
  );
}
