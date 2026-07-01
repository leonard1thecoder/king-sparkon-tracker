import Link from "next/link";
import { BadgeCheck } from "lucide-react";

export function FounderVerificationCard() {
  return (
    <div className="mt-5 max-w-2xl">
      <div className="overflow-hidden rounded-full border border-[var(--gold)]/35 bg-white/42 px-3 py-2 shadow-[var(--shadow-soft)] backdrop-blur-xl">
        <p className="truncate whitespace-nowrap bg-gradient-to-r from-[var(--gold)] via-purple-600 to-orange-500 bg-clip-text text-[0.55rem] font-black uppercase tracking-[0.13em] text-transparent sm:text-[0.63rem] lg:text-[0.69rem]">
          King Sparkon is trademark of Sizolwakhe Leonard Mthimyunye and King Sparkon Tracker service maintained by King Sparkon.
        </p>
      </div>

      <div className="mt-3 overflow-hidden rounded-[1.75rem] border border-purple-500/20 bg-gradient-to-br from-white/52 via-[var(--gold)]/12 to-orange-500/10 p-4 shadow-[var(--shadow-soft)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-[1.35rem] border border-[var(--gold)]/45 bg-gradient-to-br from-[var(--gold)]/28 via-purple-500/14 to-orange-500/20 text-center shadow-inner">
            <span className="font-mono text-[0.62rem] font-black uppercase tracking-[0.16em] text-[var(--ink)]">
              Photo
              <br />
              placeholder
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--steel)]/72">
              To verify Sizolwakhe Mthimunye, click the Verify button below.
            </p>
            <Link href="#verify-sizolwakhe-mthimunye" className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--gold)] bg-gradient-to-r from-[var(--gold)] via-orange-400 to-purple-500 px-5 text-sm font-black text-[var(--ink)] shadow-[var(--shadow-soft)] hover:border-[var(--ink)]">
              <BadgeCheck className="h-4 w-4" />
              Verify
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
