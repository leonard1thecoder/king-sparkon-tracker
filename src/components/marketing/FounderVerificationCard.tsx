import Link from "next/link";
import { BadgeCheck } from "lucide-react";

export function FounderVerificationCard() {
  return (
    <div className="mt-6 max-w-2xl overflow-hidden rounded-[1.75rem] border border-[var(--gold)]/35 bg-white/58 p-4 shadow-[var(--shadow-soft)] backdrop-blur-xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="grid h-20 w-20 shrink-0 place-items-center rounded-[1.35rem] border border-[var(--gold)]/45 bg-[var(--gold)]/24 text-center shadow-inner">
          <span className="font-mono text-[0.62rem] font-black uppercase tracking-[0.16em] text-[var(--ink)]">
            Photo
            <br />
            placeholder
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm leading-7 text-[var(--ink)]/70">
            <span className="font-black text-[var(--ink)]">King Sparkon</span> is trademark of Sizolwakhe Leonard Mthimyunye and King Sparkon Tracker service maintained by King Sparkon.
          </p>
          <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--steel)]/72">
            To verify Sizolwakhe Mthimunye, click the Verify button below.
          </p>
          <Link href="#verify-sizolwakhe-mthimunye" className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--gold)] bg-[var(--gold)] px-5 text-sm font-black text-[var(--ink)] shadow-[var(--shadow-soft)] hover:border-[var(--ink)]">
            <BadgeCheck className="h-4 w-4" />
            Verify
          </Link>
        </div>
      </div>
    </div>
  );
}
