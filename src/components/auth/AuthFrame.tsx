import type { ReactNode } from "react";
import { PublicHeader } from "@/components/public/PublicHeader";

// Auth screens share the marketing palette and header. The card is the only
// content, centred under the header. Bottom padding on small screens keeps the
// primary button clear of the cookie consent banner, which is fixed to the viewport.
export function AuthFrame({ children }: { children: ReactNode }) {
  return (
    <>
      <PublicHeader />
      <main className="ks-public flex min-h-[calc(100dvh-4.5rem)] items-start justify-center px-5 pb-48 pt-10 md:items-center md:pb-16 md:pt-12">
        <div className="w-full max-w-[24rem]">{children}</div>
      </main>
    </>
  );
}
