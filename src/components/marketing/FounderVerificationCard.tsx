import Link from "next/link";
import { BadgeCheck } from "lucide-react";

export function FounderVerificationCard() {
  return (
    <div className="mt-5 max-w-2xl">
      <p className="truncate whitespace-nowrap bg-gradient-to-r from-[var(--gold)] via-purple-600 to-orange-500 bg-clip-text text-[0.58rem] font-black uppercase tracking-[0.13em] text-transparent sm:text-[0.66rem] lg:text-[0.74rem]">
        King Sparkon is trademark of Sizolwakhe Leonard Mthimyunye and King Sparkon...
      </p>

      <p className="mt-2 whitespace-nowrap bg-gradient-to-r from-purple-600 via-[var(--gold)] to-orange-500 bg-clip-text text-[0.48rem] font-black uppercase tracking-[0.12em] text-transparent sm:text-[0.56rem] lg:text-[0.62rem]">
        King Sparkon is innovative software developer, verified by Oracle University. View badge by verify below the badge.
      </p>

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
            <Link href="#verify-sizolwakhe-mthimunye" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--gold)] bg-gradient-to-r from-[var(--gold)] via-orange-400 to-purple-500 px-5 text-sm font-black text-[var(--ink)] shadow-[var(--shadow-soft)] hover:border-[var(--ink)]">
              <BadgeCheck className="h-4 w-4" />
              Verify
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
