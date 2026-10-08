import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicBreadcrumb, breadcrumbJsonLd } from "@/components/public/Breadcrumb";
import { EventCard, toEventCardData } from "@/components/public/EventCard";
import { getPublishedEventById, getPublishedEvents } from "@/lib/public/data";
import { buildSlug, idFromSlug } from "@/lib/public/slug";
import { eventStartIso, formatEventDate, formatEventTime, formatZar } from "@/lib/public/format";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

const siteUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://king-sparkon-tracker.com").replace(/\/$/, "");

const ticketAcronyms = new Set(["VIP", "VVIP"]);

function ticketLabel(type: string) {
  const normalised = type.replace(/_/g, " ").trim().toUpperCase();
  if (ticketAcronyms.has(normalised)) return normalised;
  const text = normalised.toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const id = idFromSlug(slug);
  const event = id ? await getPublishedEventById(id) : null;
  if (!event) {
    return { title: "Event not found", robots: { index: false, follow: true } };
  }
  const path = `/events/${buildSlug(event.name, event.id)}`;
  const description =
    event.description?.trim().slice(0, 160) || `Event details, tickets and timing for ${event.name} on King Sparkon.`;
  return pageMetadata({
    title: `${event.name} | Events`,
    description,
    path,
  });
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const id = idFromSlug(slug);
  const event = id ? await getPublishedEventById(id) : null;
  if (!event) notFound();

  const path = `/events/${buildSlug(event.name, event.id)}`;
  const canonicalUrl = `${siteUrl}${path}`;
  const related = (await getPublishedEvents()).filter((item) => item.id !== event.id).slice(0, 3);

  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    description: event.description || undefined,
    startDate: eventStartIso(event.eventDate, event.eventTime),
    ...(event.eventEndTime ? { endDate: eventStartIso(event.eventDate, event.eventEndTime) } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: { "@type": "Place", name: event.location, address: event.location },
    url: canonicalUrl,
    ...(event.ticketTypes.length > 0
      ? {
          offers: event.ticketTypes.map((ticket) => ({
            "@type": "Offer",
            name: ticketLabel(ticket.type),
            price: Number(ticket.price),
            priceCurrency: "ZAR",
            availability: Number(ticket.available) > 0 ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
            url: canonicalUrl,
          })),
        }
      : {}),
  };

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Events", href: "/events" },
    { label: event.name },
  ];

  return (
    <>
      <PublicHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(crumbs, siteUrl)).replace(/</g, "\\u003c") }} />
      <main className="ks-public">
        <PublicBreadcrumb items={crumbs} />

        <section className="ks-section pt-4">
          <div className="ks-wrap grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="ks-eyebrow">Event</p>
              <h1 className="ks-h1 mt-3">{event.name}</h1>
              <dl className="mt-8 grid gap-4 text-sm sm:grid-cols-2">
                <div className="ks-card">
                  <dt className="ks-eyebrow">Date</dt>
                  <dd className="mt-2 font-bold">{formatEventDate(event.eventDate)}</dd>
                </div>
                <div className="ks-card">
                  <dt className="ks-eyebrow">Time</dt>
                  <dd className="mt-2 font-bold">
                    {formatEventTime(event.eventTime)}
                    {event.eventEndTime ? ` – ${formatEventTime(event.eventEndTime)}` : ""}
                  </dd>
                </div>
                <div className="ks-card sm:col-span-2">
                  <dt className="ks-eyebrow">Location</dt>
                  <dd className="mt-2 font-bold">{event.location}</dd>
                </div>
              </dl>
              {event.description ? (
                <div className="mt-10">
                  <h2 className="text-xl font-extrabold">About this event</h2>
                  <p className="mt-4 whitespace-pre-line leading-7 text-[var(--ks-muted)]">{event.description}</p>
                </div>
              ) : null}
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="ks-card">
                <h2 className="text-lg font-extrabold">Tickets</h2>
                {event.ticketTypes.length > 0 ? (
                  <ul className="mt-4 divide-y divide-[var(--ks-line)]">
                    {event.ticketTypes.map((ticket) => (
                      <li key={ticket.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                        <span className="font-semibold">{ticketLabel(ticket.type)}</span>
                        <span className="text-right">
                          <span className="block font-bold">{formatZar(ticket.price) ?? "Price on request"}</span>
                          <span className="block text-xs text-[var(--ks-muted)]">
                            {Number(ticket.available) > 0 ? `${ticket.available} available` : "Sold out"}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-[var(--ks-muted)]">Ticket types are not published yet.</p>
                )}
                <Link
                  href={`/login?next=${encodeURIComponent(path)}`}
                  className="ks-btn ks-btn-primary mt-6 w-full justify-center"
                >
                  Sign in to get tickets
                </Link>
              </div>
            </aside>
          </div>
        </section>

        {related.length > 0 ? (
          <section className="ks-section border-t border-[var(--ks-line)] pb-24">
            <div className="ks-wrap">
              <h2 className="ks-h2">More events</h2>
              <ul className="mt-8 grid gap-5 md:grid-cols-3">
                {related.map((item) => (
                  <li key={item.id}>
                    <EventCard event={toEventCardData(item)} />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}
      </main>
    </>
  );
}
