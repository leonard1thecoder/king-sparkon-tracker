import Link from "next/link";
import { BadgeCheck } from "lucide-react";

const highlightedTrustText = "rounded-[0.16em] bg-[var(--gold)] px-[0.08em] text-[#000]";

export function FounderVerificationCard() {
  return (
    <div className="mt-5 max-w-2xl text-center">
      <p className="truncate whitespace-nowrap text-[0.47rem] font-black uppercase tracking-[0.1em] text-[var(--ink)] sm:text-[0.54rem] lg:text-[0.6rem]">
        <span className={highlightedTrustText}>King</span> <span className={highlightedTrustText}>Sparkon</span> <span className={highlightedTrustText}>is</span> trademark of <span className={highlightedTrustText}>Sizolwakhe</span> <span className={highlightedTrustText}>Leonard</span> <span className={highlightedTrustText}>Mthimunye</span> <span className={highlightedTrustText}>AND</span>
      </p>

      <p className="mt-2 truncate whitespace-nowrap text-[0.42rem] font-black uppercase tracking-[0.08em] text-[var(--ink)] sm:text-[0.49rem] lg:text-[0.55rem]">
        <span className={highlightedTrustText}>is</span> a <span className={highlightedTrustText}>innovative</span> <span className={highlightedTrustText}>software</span> <span className={highlightedTrustText}>developer</span>, verified by Oracle University. click <span className={highlightedTrustText}>BADGE</span> <span className={highlightedTrustText}>THAT!</span> to verify badge
      </p>

      <img src="/oracle-certified-associate-badge.svg" alt="Oracle Certified Associate badge" className="mx-auto mt-4 h-28 w-auto drop-shadow-[0_22px_34px_rgba(88,28,135,0.22)] sm:h-32" />

      <Link href="#verify-sizolwakhe-mthimunye" className="mx-auto mt-3 inline-flex min-h-9 items-center justify-center gap-1.5 rounded-[999px] border border-white/70 bg-white/70 px-4 text-xs font-black uppercase tracking-[0.12em] text-[var(--ink)] shadow-[0_16px_36px_rgba(88,28,135,0.18)] backdrop-blur-xl hover:border-[var(--gold)] hover:bg-[var(--gold)]/80">
        <BadgeCheck className="h-3.5 w-3.5" />
        BADGE THAT!
      </Link>
    </div>
  );
}
