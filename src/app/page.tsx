import Link from "next/link";
import type { Metadata } from "next";
import { PublicHeader } from "@/components/public/PublicHeader";
import { Reveal } from "@/components/public/InView";
import { FaqList, type FaqItem } from "@/components/public/FaqList";
import {
  AudienceMap,
  ConvergeScene,
  EventsScene,
  HeroNetwork,
  JobsScene,
  MallScene,
  PlatformNetwork,
  UifScene,
} from "@/components/public/SceneVisuals";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Event Management, Ticketing & Operations Platform",
    description:
      "Run events, move products, connect people and manage opportunities through one connected King Sparkon platform.",
    path: "/",
  }),
  title: { absolute: "King Sparkon | Event Management, Ticketing & Operations Platform" },
};

const faqItems: FaqItem[] = [
  {
    question: "What is King Sparkon?",
    answer:
      "King Sparkon is a platform for running events, selling products and tickets, and managing job posts. These parts are connected in one system.",
  },
  {
    question: "What is King Sparkon Events?",
    answer:
      "Events lets organisers publish an event with its venue, lineup and ticket types. Attendees buy tickets, and each ticket carries a QR code that is checked at the gate.",
  },
  {
    question: "How does King Sparkon Mall work?",
    answer:
      "Mall lists products from businesses. Buyers add items to a cart and check out, and stock and sales records update together.",
  },
  {
    question: "How can I find jobs on King Sparkon?",
    answer:
      "Open job posts appear on the Job Posts page. Read a post and apply from there. Businesses publish and review their own roles.",
  },
  {
    question: "Who can use King Sparkon?",
    answer:
      "Users, artists, businesses and workers all take part in the platform. Each person sees the views that fit their role.",
  },
  {
    question: "What is the Unemployment Insurance Fund section?",
    answer:
      "It explains the UIF-related tools King Sparkon provides and links to official Unemployment Insurance Fund information. King Sparkon is not the Unemployment Insurance Fund.",
  },
];

function SectionHead({ eyebrow, title, text }: { eyebrow?: string; title: string; text?: string }) {
  return (
    <div className="max-w-2xl">
      {eyebrow ? <p className="ks-eyebrow">{eyebrow}</p> : null}
      <h2 className="ks-h2 mt-3">{title}</h2>
      {text ? <p className="ks-lead mt-4">{text}</p> : null}
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <PublicHeader />
      <main className="ks-public">
        <section className="ks-section overflow-hidden">
          <div className="ks-wrap grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-[var(--ks-line)] ks-surface px-3 py-1 text-xs font-bold tracking-[0.12em] text-[var(--ks-ink)]">
                <span className="h-2 w-2 rounded-full bg-[var(--ks-gold)]" aria-hidden="true" />
                King Sparkon · Make your move.
              </p>
              <h1 className="ks-h1 mt-6">Event Management, Ticketing &amp; Operations Platform</h1>
              <p className="ks-lead mt-6">
                Run events, move products, connect people and manage opportunities through one connected King Sparkon platform.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/events" className="ks-btn ks-btn-primary">Explore Events</Link>
                <Link href="/register" className="ks-btn ks-btn-secondary">Get Started</Link>
              </div>
            </div>
            <div className="mx-auto w-full max-w-xl">
              <HeroNetwork />
            </div>
          </div>
        </section>

        <section className="ks-section border-t border-[var(--ks-line)]">
          <div className="ks-wrap grid items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <SectionHead title="Everything moves together." text="Events, commerce and opportunities connected in one place." />
            </Reveal>
            <Reveal>
              <PlatformNetwork />
            </Reveal>
          </div>
        </section>

        <section id="events" className="ks-section border-t border-[var(--ks-line)]">
          <div className="ks-wrap">
            <Reveal>
              <SectionHead
                eyebrow="Events"
                title="King Sparkon Events"
                text="Discover events, manage experiences and keep every moving part connected."
              />
            </Reveal>
            <div className="mt-14">
              <EventsScene />
            </div>
            <div className="mt-12">
              <Link href="/events" className="ks-btn ks-btn-primary">Explore Events</Link>
            </div>
          </div>
        </section>

        <section id="mall" className="ks-section border-t border-[var(--ks-line)]">
          <div className="ks-wrap">
            <Reveal>
              <SectionHead
                eyebrow="Mall"
                title="King Sparkon Mall"
                text="Products, orders and event commerce in one connected experience."
              />
            </Reveal>
            <div className="mt-14">
              <MallScene />
            </div>
            <div className="mt-12">
              <Link href="/mall" className="ks-btn ks-btn-primary">Explore Mall</Link>
            </div>
          </div>
        </section>

        <section id="jobs" className="ks-section border-t border-[var(--ks-line)]">
          <div className="ks-wrap">
            <Reveal>
              <SectionHead
                eyebrow="Job Posts"
                title="King Sparkon Job Posts"
                text="Discover opportunities, connect with employers and keep work moving."
              />
            </Reveal>
            <div className="mt-14">
              <JobsScene />
            </div>
            <div className="mt-12">
              <Link href="/jobs" className="ks-btn ks-btn-primary">Explore Jobs</Link>
            </div>

            <div className="mt-20 grid items-center gap-10 border-t border-[var(--ks-line)] pt-16 lg:grid-cols-[1fr_1.2fr]">
              <Reveal>
                <p className="ks-eyebrow">Employment support, when you need it.</p>
                <h3 className="mt-3 text-2xl font-extrabold md:text-3xl">Unemployment Insurance Fund</h3>
                <p className="ks-lead mt-4">
                  See how King Sparkon supports UIF-related records and tools, and where to find official information.
                </p>
                <Link href="/jobs/unemployment-insurance-fund" className="ks-btn ks-btn-secondary mt-6">Learn about UIF</Link>
              </Reveal>
              <UifScene />
            </div>
          </div>
        </section>

        <section className="ks-section border-t border-[var(--ks-line)]">
          <div className="ks-wrap grid gap-12">
            <Reveal>
              <SectionHead
                title="One platform. Many ways to participate."
                text="Users, artists, businesses and workers each take part in the way that fits their role."
              />
            </Reveal>
            <AudienceMap />
          </div>
        </section>

        <section className="ks-section border-t border-[var(--ks-line)]">
          <Reveal className="ks-wrap text-center">
            <p className="text-2xl font-extrabold md:text-4xl">Built around connected operations.</p>
            <p className="mt-2 text-xl font-semibold text-[var(--ks-muted)] md:text-2xl">Designed for real-world movement.</p>
          </Reveal>
        </section>

        <section className="ks-section border-t border-[var(--ks-line)]">
          <div className="ks-wrap">
            <Reveal>
              <h2 className="ks-h2 text-center">Questions?</h2>
            </Reveal>
            <div className="mt-10">
              <FaqList items={faqItems} />
            </div>
          </div>
        </section>

        <section className="ks-section border-t border-[var(--ks-line)] pb-24">
          <div className="ks-wrap text-center">
            <Reveal>
              <h2 className="ks-h2">Everything moves from here.</h2>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href="/events" className="ks-btn ks-btn-primary">Explore Events</Link>
                <Link href="/register" className="ks-btn ks-btn-secondary">Get Started</Link>
              </div>
            </Reveal>
            <div className="mt-10">
              <ConvergeScene />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
