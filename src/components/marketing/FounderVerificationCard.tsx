import { BadgeCheck } from "lucide-react";

const badgeUrl = "https://veizbtzugssszhxabzrv.supabase.co/storage/v1/object/public/king-sparkon-logo/ChatGPT%20Image%20Jul%202,%202026,%2001_29_39%20AM.png";

export function FounderVerificationCard() {
  return (
    <div className="mt-6 flex max-w-2xl items-center gap-4 border-l-2 border-[var(--line-strong)] pl-4" aria-label="Founder and Oracle University verification">
      <img src={badgeUrl} alt="Oracle University verification badge for Sizolwakhe Leonard Mthimunye" loading="lazy" decoding="async" className="h-16 w-16 shrink-0 rounded-lg border border-[var(--line)] bg-white object-contain p-1" />
      <div>
        <p className="text-sm font-extrabold text-[var(--ink)]">Built by Sizolwakhe Leonard Mthimunye</p>
        <p className="mt-1 text-xs leading-5 text-[var(--steel)]">King Sparkon founder and Oracle University verified software developer.</p>
        <a href={badgeUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-2 text-xs font-extrabold text-[var(--signal-strong)] hover:text-[var(--accent-hover)]">
          <BadgeCheck className="h-3.5 w-3.5" /> Verify badge
        </a>
      </div>
    </div>
  );
}
