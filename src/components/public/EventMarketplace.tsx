import Link from "next/link";
import { Reveal } from "@/components/public/InView";
import { SampleBadge } from "@/components/public/SampleBadge";
import { getMarketplaceHubEvents, isDemoId } from "@/lib/public/data";
import { buildSlug } from "@/lib/public/slug";
import { formatEventDate, formatZar } from "@/lib/public/format";

/*
 * "Event Marketplace" — businesses supplying, promoting or selling products
 * at participating events. Participation is gated by the existing
 * TicketEvent.marketplaceHubEnabled flag (owner opt-in per event); fees come
 * from marketplaceHubPrice. Catalogue, stock and approvals reuse the existing
 * product endpoints — a submission is never auto-approved and stock is never
 * oversold beyond the catalogue quantity.
 */
export async function EventMarketplace() {
  const events = await getMarketplaceHubEvents();
  const showingDemo = events.length > 0 && isDemoId(events[0].id);

  return (
    <section className="ks-section border-t border-[var(--ks-line)]" aria-labelledby="event-marketplace">
      <div className="ks-wrap">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="ks-eyebrow">Businesses</p>
            <h2 id="event-marketplace" className="ks-h2 mt-3">
              Event Marketplace
            </h2>
            <p className="ks-lead mx-auto mt-4">
              Supply, promote or sell products at participating events. Owners enable participation per event and
              review every submission — nothing is approved automatically.
            </p>
            {showingDemo ? <SampleBadge /> : null}
          </div>
        </Reveal>

        {events.length === 0 ? (
          <Reveal>
            <p className="mx-auto mt-8 max-w-xl rounded-[var(--ks-radius)] border border-dashed border-[var(--ks-line)] p-8 text-center text-sm text-[var(--ks-muted)]">
              No events are accepting business products right now. Owners enable the marketplace hub per event; once
              they do, participation rules, fees and inventory requirements appear here.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/dashboard/owner/products" className="ks-btn ks-btn-secondary">
                Manage business catalogue
              </Link>
            </div>
          </Reveal>
        ) : (
          <>
            <ul className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <li key={event.id} className="ks-card flex h-full flex-col">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--ks-muted)]">
                    {formatEventDate(event.eventDate)}
                  </p>
                  <h3 className="mt-2 text-xl font-extrabold leading-tight">{event.name}</h3>
                  <p className="mt-2 text-sm text-[var(--ks-muted)]">{event.location}</p>
                  <dl className="mt-4 grid gap-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-[var(--ks-muted)]">Participation fee</dt>
                      <dd className="font-bold">
                        {event.marketplaceHubPrice != null ? (formatZar(event.marketplaceHubPrice) ?? "On request") : "On request"}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-[var(--ks-muted)]">Inventory</dt>
                      <dd className="font-bold">From your catalogue stock</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-[var(--ks-muted)]">Approval</dt>
                      <dd className="font-bold">Owner review required</dd>
                    </div>
                  </dl>
                  <p className="mt-4 text-sm leading-6 text-[var(--ks-muted)]">
                    Select products from your authorised catalogue, submit for this event, then track submission,
                    approval, inventory allocation and sales in your dashboard. Ticket buying and artist bookings stay
                    separate.
                  </p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-6">
                    <Link href={`/events/${buildSlug(event.name, event.id)}`} className="ks-btn ks-btn-secondary">
                      View event
                    </Link>
                    <Link href="/dashboard/owner/products" className="ks-btn ks-btn-primary">
                      Manage catalogue
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/dashboard/owner/tickets" className="ks-btn ks-btn-secondary">
                Review submissions as owner
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
