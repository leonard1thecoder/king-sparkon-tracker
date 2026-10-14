import Link from "next/link";
import { Reveal } from "@/components/public/InView";
import { BookingOpportunityCard } from "@/components/public/BookingOpportunityCard";
import { SampleBadge } from "@/components/public/SampleBadge";
import { getBookingOpportunities } from "@/lib/public/data";

/*
 * "Open for Bookings" — artist booking opportunities derived from OPEN sets
 * on DRAFT parents (explicit owner opt-in). Fully-booked events (zero OPEN
 * sets) never appear here. Artists continue in the existing authenticated
 * workflow at /dashboard/artist/sets; anonymous visitors sign in first.
 */
export async function OpenForBookings() {
  const { opportunities, isDemo } = await getBookingOpportunities();

  return (
    <section className="ks-section border-t border-[var(--ks-line)]" aria-labelledby="open-for-bookings">
      <div className="ks-wrap">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="ks-eyebrow">Artists</p>
            <h2 id="open-for-bookings" className="ks-h2 mt-3">
              Open for Bookings
            </h2>
            <p className="ks-lead mx-auto mt-4">
              Drafted events whose owners opened performance sets for artist applications.
              Counts and prices come straight from the available sets.
            </p>
            {isDemo && opportunities.length > 0 ? <SampleBadge /> : null}
          </div>
        </Reveal>

        {opportunities.length === 0 ? (
          <Reveal>
            <p className="mx-auto mt-8 max-w-xl rounded-[var(--ks-radius)] border border-dashed border-[var(--ks-line)] p-8 text-center text-sm text-[var(--ks-muted)]">
              No open bookings right now. Owners list performance sets here when they open a drafted event for
              applications — check back soon, or sign in as an artist to track new sets.
            </p>
            <div className="mt-6 flex justify-center">
              <Link href="/login?next=%2Fdashboard%2Fartist%2Fsets" className="ks-btn ks-btn-secondary">
                Sign in as artist
              </Link>
            </div>
          </Reveal>
        ) : (
          <>
            <ul className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {opportunities.map((opportunity) => (
                <li key={opportunity.eventId}>
                  <BookingOpportunityCard opportunity={opportunity} />
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/dashboard/artist/sets" className="ks-btn ks-btn-primary">
                Open artist bookings
              </Link>
              <Link href="/login?next=%2Fdashboard%2Fartist%2Fsets" className="ks-btn ks-btn-secondary">
                Sign in to apply
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
