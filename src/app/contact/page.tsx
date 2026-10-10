import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicBreadcrumb } from "@/components/public/Breadcrumb";
import { ContactForm } from "@/components/public/ContactForm";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact King Sparkon | Implementation & Support Inquiries",
  description:
    "Contact King Sparkon for implementation inquiries, support questions, billing, and affiliate or worker setup. Get guidance on barcode inventory, QR tickets and role-safe operations.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PublicHeader />
      <main className="ks-public">
        <PublicBreadcrumb items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />

        <section className="ks-section pt-4">
          <div className="ks-wrap grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="ks-eyebrow">Contact</p>
              <h1 className="ks-h1 mt-3">Tell us what your operation needs to prove.</h1>
              <p className="ks-lead mt-5">
                Describe the roles, products, ticket flow or transaction problem you need the platform to manage. We reply with a concrete implementation path — not marketing fluff.
              </p>

              <div className="mt-8 grid gap-4">
                <div className="ks-card flex gap-4 p-5">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[var(--ks-line)] bg-[var(--ks-white)] text-[var(--ks-ink)]">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-[var(--ks-ink)]">Implementation inquiry</p>
                    <p className="text-sm leading-6 text-[var(--ks-muted)]">Share business name, location, and which jobs (inventory, tickets, tips) you need first.</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-sm font-semibold text-[var(--ks-muted)]">
                  <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" /> South Africa ready</span>
                  <span className="inline-flex items-center gap-2"><Phone className="h-4 w-4" /> Use the form — no phone queue</span>
                </div>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/how-it-works" className="ks-btn ks-btn-secondary">
                  How it works <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/faq" className="ks-btn ks-btn-secondary">
                  Read FAQ
                </Link>
              </div>
            </div>

            <div className="ks-card p-6 md:p-8">
              <h2 className="text-xl font-black text-[var(--ks-ink)]">Send an inquiry</h2>
              <p className="mt-1 text-sm leading-6 text-[var(--ks-muted)]">We store inquiries via POST /api/contact-inquiries through the frontend proxy. No secrets are exposed to the browser.</p>
              <div className="mt-6">
                <ContactForm />
              </div>
            </div>
          </div>
        </section>

        <section className="ks-section pt-0 pb-24">
          <div className="ks-wrap grid gap-5 md:grid-cols-2">
            <div className="ks-card p-6">
              <h3 className="font-black text-[var(--ks-ink)]">What to include</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--ks-muted)]">Operation type (retail, events, tuck-shop), number of workers, whether you need tickets, tips or affiliates.</p>
            </div>
            <div className="ks-card p-6">
              <h3 className="font-black text-[var(--ks-ink)]">Response</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--ks-muted)]">A role map, recommended first guides, and whether Free Trial, Plus or Pro fits your worker count.</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
