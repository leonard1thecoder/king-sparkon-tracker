import { BadgeCheck } from "lucide-react";

const highlightedTrustText = "rounded-[0.16em] bg-[var(--gold)] px-[0.08em] text-[#000]";
const badgeUrl = "https://veizbtzugssszhxabzrv.supabase.co/storage/v1/object/public/king-sparkon-logo/ChatGPT%20Image%20Jul%202,%202026,%2001_29_39%20AM.png";

export function FounderVerificationCard() {
  return (
    <div className="mt-3 max-w-2xl text-center" aria-label="Sparkon trademark and Oracle University verification">
      <p className="truncate whitespace-nowrap bg-gradient-to-r from-[var(--gold)] via-purple-600 to-orange-500 bg-clip-text text-[0.46rem] font-black uppercase tracking-[0.1em] text-transparent sm:text-[0.53rem] lg:text-[0.59rem]">
        <span className={highlightedTrustText}>Sparkon</span> <span className={highlightedTrustText}>is</span> trademark of <span className={highlightedTrustText}>Sizolwakhe</span> <span className={highlightedTrustText}>Leonard</span> <span className={highlightedTrustText}>Mthimunye</span> <span className={highlightedTrustText}>AND</span>
      </p>

      <p className="mt-2 truncate whitespace-nowrap bg-gradient-to-r from-purple-600 via-[var(--gold)] to-orange-500 bg-clip-text text-[0.39rem] font-black uppercase tracking-[0.07em] text-transparent sm:text-[0.47rem] lg:text-[0.52rem]">
        <span className={highlightedTrustText}>is</span> a <span className={highlightedTrustText}>innovative</span> <span className={highlightedTrustText}>software</span> <span className={highlightedTrustText}>developer</span>, verified by Oracle University. click <span className={highlightedTrustText}>BADGE</span> <span className={highlightedTrustText}>THAT!</span> to verify badge
      </p>

      <img src={badgeUrl} alt="Oracle University verification badge for Sizolwakhe Leonard Mthimunye, known as King Sparkon" loading="lazy" decoding="async" className="mx-auto mt-4 h-28 w-auto drop-shadow-[0_22px_34px_rgba(88,28,135,0.22)] sm:h-32" />

      <a href={badgeUrl} target="_blank" rel="noopener noreferrer" className="mx-auto mt-3 inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--gold)] bg-gradient-to-r from-[var(--gold)] via-orange-400 to-purple-500 px-4 text-xs font-black uppercase tracking-[0.12em] text-[var(--ink)] shadow-[var(--shadow-soft)] hover:border-[var(--ink)]">
        <BadgeCheck className="h-3.5 w-3.5" />
        BADGE THAT!
      </a>
    </div>
  );
}
