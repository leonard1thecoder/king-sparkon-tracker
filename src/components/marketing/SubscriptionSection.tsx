"use client";

import { type FormEvent, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Crown,
  Loader2,
  Mail,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { Subscription3DVisual } from "@/components/marketing/Landing3DVisuals";
import { subscribe, type SubscribePayload } from "@/lib/api/subscribers";

type SubscriptionStatus = {
  tone: "success" | "error" | "warning";
  message: string;
};

type SubscriptionResponse = {
  message?: string;
  error?: string;
  detail?: string;
};

const inputClasses =
  "h-12 rounded-lg border border-[var(--line)] bg-white px-4 text-[var(--ink)] shadow-[var(--shadow-soft)] outline-none placeholder:text-[var(--muted)] hover:border-[var(--signal)] focus:border-[var(--signal)] focus:ring-4 focus:ring-[rgba(14,165,233,0.14)]";

const subscribeAsOptions = [
  "Free User",
  "Business Owner",
  "Affiliate",
  "Dev Hub Client",
] as const;

const interestOptions = [
  "Job posts",
  "Barcode inventory",
  "King Sparkon Tuck Shop",
  "My Tickets",
] as const;

const subscriptionNotes = [
  {
    icon: ShieldCheck,
    title: "Build notes",
    copy: "What changed and why it matters.",
  },
  {
    icon: Mail,
    title: "Feature drops",
    copy: "New scanner, QR, and dashboard releases.",
  },
  {
    icon: Crown,
    title: "Founder signal",
    copy: "Product direction from the King Sparkon roadmap.",
  },
] as const;

type SubscribeAsOption = (typeof subscribeAsOptions)[number];
type InterestOption = (typeof interestOptions)[number];

function subscriptionPayload(
  contact: string,
  subscribeAs: SubscribeAsOption,
): SubscribePayload {
  const isAffiliate = subscribeAs === "Affiliate";

  return {
    contact,
    subscriberType: isAffiliate ? "AFFILIATE" : "KINGSPARKON_SUBSCRIBER",
    preferredChannel: "EMAIL",
    affiliateRegistered: false,
  };
}

function fieldValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function statusClasses(tone: SubscriptionStatus["tone"]) {
  if (tone === "success") {
    return "border-[var(--confirm)]/40 bg-[var(--confirm)]/10 text-[var(--confirm)]";
  }
  if (tone === "warning") {
    return "border-[var(--signal)]/40 bg-[var(--signal-soft)] text-[var(--signal-strong)]";
  }
  return "border-red-300 bg-red-50 text-red-700";
}

function toggleClasses(active: boolean) {
  return active
    ? "border-[var(--signal)] bg-[var(--signal-soft)] text-[var(--signal-strong)] shadow-[var(--shadow-soft)]"
    : "border-[var(--line)] bg-white text-[var(--steel)] hover:border-[var(--accent-hover)] hover:text-[var(--accent-hover)]";
}

export function SubscriptionSection() {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscribeAs, setSubscribeAs] =
    useState<SubscribeAsOption>("Business Owner");
  const [interest, setInterest] =
    useState<InterestOption>("Barcode inventory");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setIsSubmitting(true);

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      const email = fieldValue(formData, "email");
      if (!email || !email.includes("@")) {
        setStatus({
          tone: "error",
          message:
            "Enter a valid email address before joining the King Sparkon updates.",
        });
        return;
      }

      const responseBody = (await subscribe(
        subscriptionPayload(email, subscribeAs),
      )) as SubscriptionResponse;
      setStatus({
        tone: "success",
        message:
          responseBody.message ??
          `Subscribed as ${subscribeAs} for ${interest} updates.`,
      });
      form.reset();
    } catch (error) {
      const responseBody = (
        error as { response?: { data?: SubscriptionResponse } }
      ).response?.data;
      setStatus({
        tone: "error",
        message:
          responseBody?.message ??
          responseBody?.error ??
          responseBody?.detail ??
          "Unable to reach the subscription API. Check that the backend is running.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section
      id="subscribe"
      className="scroll-mt-28 border-t border-[var(--line)] bg-white px-5 py-16 md:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]">
              Subscription
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.055em] md:text-6xl">
              Subscribe for focused product updates.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--steel)]">
              Get scanner, tickets, worker tips, affiliate, Dev Hub,
              dashboard, and capacity updates without digging through the
              whole platform.
            </p>
          </div>

          <Subscription3DVisual />
        </div>

        <div
          className="mt-12 grid gap-5 md:grid-cols-3"
          aria-label="King Sparkon subscription update types"
        >
          {subscriptionNotes.map(({ icon: Icon, title, copy }, index) => (
            <article
              key={title}
              className="relative flex min-h-[17rem] flex-col overflow-visible rounded-2xl border border-[var(--line-strong)] bg-white p-7 shadow-[0_18px_45px_rgba(14,165,233,0.12)] md:p-8"
            >
              <div className="flex items-start justify-between gap-5">
                <span className="text-4xl font-black tracking-[-0.06em] text-[var(--signal-strong)]">
                  0{index + 1}
                </span>
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-[var(--line)] bg-[var(--signal-soft)] text-[var(--signal)] shadow-[var(--shadow-soft)]">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
              </div>

              <div className="mt-auto pt-10">
                <h3 className="text-2xl font-black tracking-[-0.04em] text-[var(--ink)] md:text-3xl">
                  {title}
                </h3>
                <p className="mt-4 max-w-sm text-base font-medium leading-8 text-[var(--steel)]">
                  {copy}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="relative mt-12 border border-[var(--line-strong)] bg-white p-5 shadow-[var(--shadow-soft)] md:p-8">
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full border border-[var(--line)] bg-[var(--signal-soft)] text-[var(--signal)] shadow-[var(--shadow-soft)]">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-[var(--signal-strong)]">
                  King Sparkon inbox
                </p>
                <h3 className="mt-1 text-2xl font-black tracking-[-0.04em]">
                  Join the update list
                </h3>
              </div>
            </div>

            <form className="mt-7 grid gap-4" onSubmit={handleSubmit}>
              <label className="grid gap-2 text-sm font-black text-[var(--ink)]">
                Name
                <input
                  name="name"
                  className={inputClasses}
                  placeholder="Example: Sizolwakhe"
                  autoComplete="name"
                />
              </label>
              <label className="grid gap-2 text-sm font-black text-[var(--ink)]">
                Email address
                <input
                  name="email"
                  required
                  type="email"
                  className={inputClasses}
                  placeholder="owner@sparkonstore.co.za"
                  autoComplete="email"
                />
              </label>

              <div className="grid gap-3 border border-[var(--line)] bg-white p-4">
                <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-[var(--signal-strong)]">
                  Subscribe as
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {subscribeAsOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSubscribeAs(option)}
                      className={`min-h-11 rounded-lg border px-4 text-xs font-black transition ${toggleClasses(option === subscribeAs)}`}
                      aria-pressed={option === subscribeAs}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 border border-[var(--line)] bg-white p-4">
                <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-[var(--signal-strong)]">
                  Interested in
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {interestOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setInterest(option)}
                      className={`min-h-11 rounded-lg border px-4 text-xs font-black transition ${toggleClasses(option === interest)}`}
                      aria-pressed={option === interest}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {status ? (
                <div
                  className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm font-semibold leading-6 ${statusClasses(status.tone)}`}
                  role={status.tone === "error" ? "alert" : "status"}
                >
                  {status.tone === "success" ? (
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0"
                      aria-hidden="true"
                    />
                  ) : (
                    <TriangleAlert
                      className="mt-0.5 h-4 w-4 shrink-0"
                      aria-hidden="true"
                    />
                  )}
                  <span>{status.message}</span>
                </div>
              ) : null}

              <button
                data-orange-hover="true"
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-[var(--signal)] bg-[var(--signal)] px-6 font-black text-white shadow-[var(--shadow-soft)] hover:border-[var(--accent-hover)] hover:bg-[var(--accent-hover)] focus:ring-4 focus:ring-[rgba(14,165,233,0.16)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                )}
                {isSubmitting ? "Subscribing..." : "Subscribe"}
              </button>
            </form>

            <div className="mt-6 flex items-center gap-3 border-t border-[var(--line)] pt-5 text-sm leading-6 text-[var(--steel)]">
              <Crown className="h-5 w-5 shrink-0 text-[var(--signal)]" />
              No spam. Just product discipline, launch notes, Dev Hub notes,
              and practical King Sparkon updates.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
