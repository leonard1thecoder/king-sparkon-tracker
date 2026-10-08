import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicBreadcrumb } from "@/components/public/Breadcrumb";
import { EventCard, toEventCardData } from "@/components/public/EventCard";
import { EventsExplorer } from "@/components/public/EventsExplorer";
import { Reveal, Scene } from "@/components/public/InView";
import { getPublishedEvents } from "@/lib/public/data";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "King Sparkon Events | Discover Events & Tickets",
    description:
      "Discover events on King Sparkon, explore event details, artists, tickets and experiences.",
    path: "/events",
  }),
  title: { absolute: "King Sparkon Events | Discover Events & Tickets" },
};

export const revalidate = 300;

function EmptyEvents() {
  return (
    <Scene className="rounded-[var(--ks-radius)] border border-dashed border-[var(--ks-line)] px-6 py-16 text-center">
      <div className="ks-float mx-auto flex h-20 w-44 items-center justify-center rounded-[12px] border-2 border-[var(--ks-gold)] ks-surface text-sm font-bold tracking-[0.12em]">
        TICKET
      </div>
      <p className="mt-8 text-xl font-extrabold">No published events yet.</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--ks-muted)]">
        Events appear here once organisers publish them. Check back soon, or register to be notified when the first events go live.
      </p>
      <Link href="/register" className="ks-btn ks-btn-secondary mt-6">Register</Link>
    </Scene>
  );
}

export default async function EventsPage() {
  const events = await getPublishedEvents();
  const cards = events.map(toEventCardData);
  const featured = [...cards].sort((a, b) => a.sortKey.localeCompare(b.sortKey)).slice(0, 3);

  return (
    <>
      <PublicHeader />
      <main className="ks-public">
        <PublicBreadcrumb items={[{ label: "Home", href: "/" }, { label: "Events" }]} />

        <section className="ks-section pt-4">
          <div className="ks-wrap grid items-end gap-10 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <p className="ks-eyebrow">Events</p>
              <h1 className="ks-h1 mt-3">King Sparkon Events</h1>
              <p className="ks-lead mt-5">
                Find events, check the details and get tickets in one place. Use search and sorting to narrow the list.
              </p>
            </div>
            <Scene className="grid grid-cols-3 gap-3" >
              {["Tickets", "Venues", "Artists"].map((label, index) => (
                <div key={label} className="ks-float ks-card text-center" style={{ animationDelay: `${-index * 1.4}s` }}>
                  <span className="mx-auto block h-1.5 w-10 rounded-full bg-[var(--ks-yellow)]" aria-hidden="true" />
                  <span className="mt-4 block text-sm font-bold">{label}</span>
                </div>
              ))}
            </Scene>
          </div>
        </section>

        {events.length === 0 ? (
          <section className="ks-section border-t border-[var(--ks-line)]">
            <div className="ks-wrap">
              <EmptyEvents />
            </div>
          </section>
        ) : (
          <>
            <section className="ks-section border-t border-[var(--ks-line)]">
              <div className="ks-wrap">
                <Reveal>
                  <h2 className="ks-h2">Featured Events</h2>
                </Reveal>
                <ul className="mt-8 grid gap-5 md:grid-cols-3">
                  {featured.map((event) => (
                    <li key={event.id}>
                      <EventCard event={event} />
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="ks-section border-t border-[var(--ks-line)]">
              <div className="ks-wrap">
                <Reveal>
                  <h2 className="ks-h2">Upcoming Events</h2>
                </Reveal>
                <div className="mt-8">
                  <EventsExplorer events={cards} />
                </div>
              </div>
            </section>
          </>
        )}

        <section className="ks-section border-t border-[var(--ks-line)] pb-24">
          <div className="ks-wrap grid gap-10 md:grid-cols-3">
            <Reveal>
              <p className="ks-eyebrow">How it works</p>
              <h2 className="ks-h2 mt-3">Events, from listing to entry.</h2>
            </Reveal>
            <Reveal>
              <p className="font-bold">Publish</p>
              <p className="mt-2 text-sm leading-6 text-[var(--ks-muted)]">Organisers add the date, venue, lineup and ticket types.</p>
            </Reveal>
            <Reveal>
              <p className="font-bold">Attend</p>
              <p className="mt-2 text-sm leading-6 text-[var(--ks-muted)]">Tickets are issued with a QR code that is checked at the gate.</p>
            </Reveal>
          </div>
        </section>
      </main>
    </>
  );
}
