"use client";

import { type FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2, Crown, Loader2, Mail, ShieldCheck, TriangleAlert } from "lucide-react";

type SubscriptionStatus = {
  tone: "success" | "error" | "warning";
  message: string;
};

type SubscriptionResponse = {
  message?: string;
  error?: string;
  detail?: string;
};

const inputClasses = "h-12 rounded-[var(--radius-lg)] border border-white/14 bg-white/10 px-4 text-white shadow-[var(--shadow-soft)] outline-none placeholder:text-white/42 hover:border-[var(--gold)] focus:border-[var(--gold)] focus:ring-4 focus:ring-[rgba(255,217,102,0.18)]";

function fieldValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function statusClasses(tone: SubscriptionStatus["tone"]) {
  if (tone === "success") {
    return "border-[var(--confirm)]/40 bg-[var(--confirm)]/10 text-[var(--confirm)]";
  }

  if (tone === "warning") {
    return "border-[var(--gold)]/50 bg-[var(--gold)]/12 text-[var(--gold)]";
  }

  return "border-[var(--signal)]/45 bg-[var(--signal)]/10 text-[var(--gold)]";
}

export function SubscriptionSection() {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setIsSubmitting(true);

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      const email = fieldValue(formData, "email");
      const name = fieldValue(formData, "name");

      if (!email || !email.includes("@")) {
        setStatus({ tone: "error", message: "Enter a valid email address before joining the King Sparkon updates." });
        return;
      }

      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, name }),
      });
      const responseBody = (await response.json().catch(() => ({}))) as SubscriptionResponse;

      if (!response.ok) {
        setStatus({
          tone: "error",
          message: responseBody.message ?? responseBody.error ?? responseBody.detail ?? "The backend rejected this subscription request.",
        });
        return;
      }

      setStatus({ tone: "success", message: responseBody.message ?? "You are subscribed to King Sparkon product updates." });
      form.reset();
    } catch {
      setStatus({ tone: "error", message: "Unable to reach the subscription API. Check that the backend is running." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="subscribe" className="scroll-mt-28 px-5 py-16 md:px-8 lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-8 overflow-hidden rounded-[2.75rem] bg-[var(--ink)] p-5 text-white shadow-[var(--shadow-depth)] enterprise-grid md:p-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">12 / subscription</p>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.055em] md:text-6xl">Subscribe for King Sparkon product updates.</h2>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/68 md:text-base">
            Get scanner, tickets, worker tips, affiliate, Dev Hub, dashboard, and capacity updates without digging through the whole platform.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {[
              ["Build notes", "What changed and why it matters."],
              ["Feature drops", "New scanner, QR, and dashboard releases."],
              ["Founder signal", "Product direction from the King Sparkon roadmap."],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-[1.35rem] border border-white/10 bg-white/[0.06] p-4 text-sm leading-6 text-white/70">
                <ShieldCheck className="mb-3 h-5 w-5 text-[var(--gold)]" />
                <p className="font-black text-white">{title}</p>
                <p className="mt-1">{copy}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-white/[0.07] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.36)] backdrop-blur-xl md:p-8">
          <div className="pointer-events-none absolute inset-0 scan-grid opacity-70" />
          <div className="contact-dashboard-glow pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--gold)]/24 blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-[1.1rem] bg-[var(--gold)] text-[var(--ink)] shadow-[var(--shadow-soft)]">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="font-mono text-[0.62rem] font-black uppercase tracking-[0.18em] text-[var(--gold)]">King Sparkon inbox</p>
                <h3 className="mt-1 text-2xl font-black tracking-[-0.04em]">Join the update list</h3>
              </div>
            </div>

            <form className="mt-7 grid gap-4" onSubmit={handleSubmit}>
              <label className="grid gap-2 text-sm font-black text-white">
                Name
                <input name="name" className={inputClasses} placeholder="Example: Sizolwakhe" autoComplete="name" />
              </label>
              <label className="grid gap-2 text-sm font-black text-white">
                Email address
                <input name="email" required type="email" className={inputClasses} placeholder="owner@sparkonstore.co.za" autoComplete="email" />
              </label>

              {status ? (
                <div className={`flex items-start gap-3 rounded-[var(--radius-lg)] border px-4 py-3 text-sm font-semibold leading-6 ${statusClasses(status.tone)}`} role={status.tone === "error" ? "alert" : "status"}>
                  {status.tone === "success" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> : <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />}
                  <span>{status.message}</span>
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-lg)] bg-[var(--gold)] px-6 font-black text-[var(--ink)] shadow-[var(--shadow-soft)] hover:bg-white focus:ring-4 focus:ring-[rgba(255,217,102,0.22)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ArrowRight className="h-4 w-4" aria-hidden="true" />}
                {isSubmitting ? "Subscribing..." : "Subscribe"}
              </button>
            </form>

            <div className="mt-6 flex items-center gap-3 rounded-[1.35rem] border border-white/10 bg-white/[0.06] p-4 text-sm leading-6 text-white/64">
              <Crown className="h-5 w-5 shrink-0 text-[var(--gold)]" />
              No spam. Just product discipline, launch notes, Dev Hub notes, and practical King Sparkon updates.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
