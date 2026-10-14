import Link from "next/link";
import type { BookingOpportunity } from "@/lib/public/booking-opportunities";

/*
 * Booking opportunity card. All strings are produced on the server and passed
 * down as props (same pattern as EventCard) to avoid hydration mismatches.
 */
export function BookingOpportunityCard({ opportunity }: { opportunity: BookingOpportunity }) {
  const loginHref = `/login?next=${encodeURIComponent("/dashboard/artist/sets")}`;
  return (
    <article className="ks-card flex h-full flex-col">
      <div className="relative -mx-5 -mt-5 mb-5 aspect-[16/9] overflow-hidden rounded-t-[var(--ks-radius)] bg-gradient-to-br from-[var(--ks-light-green)] via-[var(--ks-yellow)] to-[var(--ks-sky)]">
        {opportunity.imageUrl ? (
          <img
            src={opportunity.imageUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <span aria-hidden="true" className="absolute inset-0 grid place-items-center">
            <span className="rounded-[10px] border-2 border-[var(--ks-ink)] bg-white/85 px-4 py-2 text-xs font-black tracking-[0.18em]">
              BOOKINGS
            </span>
          </span>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-black/55 px-3 py-1 text-[0.7rem] font-bold text-white backdrop-blur-sm">
          {opportunity.openSets} {opportunity.openSets === 1 ? "open set" : "open sets"}
        </span>
      </div>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--ks-muted)]">
        {[opportunity.dateLabel, opportunity.timeLabel].filter(Boolean).join(" · ") || "Date to be announced"}
      </p>
      <h3 className="mt-2 text-xl font-extrabold leading-tight">{opportunity.eventName}</h3>
      {opportunity.location ? <p className="mt-2 text-sm text-[var(--ks-muted)]">{opportunity.location}</p> : null}
      <div className="mt-4 flex items-center justify-between gap-3 text-sm">
        <span className="font-bold">{opportunity.priceLabel ?? "Price on request"}</span>
        <span className="rounded-full bg-[var(--ks-light-green)] px-3 py-1 text-xs font-bold">Open for bookings</span>
      </div>
      <div className="mt-auto flex flex-wrap gap-2 pt-6">
        <Link href={opportunity.href} className="ks-btn ks-btn-secondary">
          View Opportunity
        </Link>
        <Link href={loginHref} className="ks-btn ks-btn-primary">
          Apply for Set
        </Link>
      </div>
    </article>
  );
}
