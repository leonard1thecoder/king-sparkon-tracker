"use client";

import { type FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, TriangleAlert } from "lucide-react";

type ContactStatus = {
  tone: "success" | "warning" | "error";
  message: string;
};

type ContactResponse = {
  status?: "RECEIVED" | "EMAIL_SENT" | "EMAIL_FAILED";
  message?: string;
  error?: string;
  detail?: string;
};

const inputClasses = "h-12 rounded-[var(--radius-md)] border border-white/12 bg-white/[0.06] px-4 text-white outline-none placeholder:text-white/34 hover:border-white/24 hover:bg-white/[0.08] focus:border-[var(--gold)] focus:ring-4 focus:ring-[rgba(247,183,49,0.16)]";

function fieldValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function statusClasses(tone: ContactStatus["tone"]) {
  if (tone === "success") {
    return "border-[var(--confirm)]/40 bg-[var(--confirm)]/12 text-white";
  }

  if (tone === "warning") {
    return "border-[var(--gold)]/40 bg-[var(--gold)]/12 text-white";
  }

  return "border-[var(--signal)]/40 bg-[var(--signal)]/12 text-white";
}

function validatePayload(payload: Record<string, string>) {
  if (!payload.businessName || !payload.emailAddress || !payload.message) {
    return "Business name, email address, and message are required.";
  }

  if (!payload.emailAddress.includes("@")) {
    return "Enter a valid email address so we can confirm the inquiry.";
  }

  if (payload.message.length > 2000) {
    return "Message must be 2,000 characters or less.";
  }

  return null;
}

export function ContactForm() {
  const [status, setStatus] = useState<ContactStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setIsSubmitting(true);

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      const payload = {
        contactName: fieldValue(formData, "contactName"),
        businessName: fieldValue(formData, "businessName"),
        emailAddress: fieldValue(formData, "emailAddress"),
        phoneNumber: fieldValue(formData, "phoneNumber"),
        message: fieldValue(formData, "message"),
      };
      const validationError = validatePayload(payload);

      if (validationError) {
        setStatus({ tone: "error", message: validationError });
        return;
      }

      const response = await fetch("/api/contact-inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const responseBody = (await response.json().catch(() => ({}))) as ContactResponse;

      if (!response.ok) {
        setStatus({
          tone: "error",
          message: responseBody.message ?? responseBody.error ?? responseBody.detail ?? "The backend rejected this contact request.",
        });
        return;
      }

      const deliveryFailed = responseBody.status === "EMAIL_FAILED";
      setStatus({
        tone: deliveryFailed ? "warning" : "success",
        message:
          responseBody.message ??
          (deliveryFailed
            ? "Your message was saved, but email delivery failed. Please try again or contact support."
            : "Thanks. We received your message and sent a confirmation email."),
      });

      if (!deliveryFailed) {
        form.reset();
      }
    } catch {
      setStatus({
        tone: "error",
        message: "Unable to reach the contact API. Check that the backend is running.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-white/80">
          Contact name
          <input name="contactName" className={inputClasses} placeholder="Your name" autoComplete="name" />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-white/80">
          Phone number
          <input name="phoneNumber" className={inputClasses} placeholder="+27 00 000 0000" autoComplete="tel" />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-semibold text-white/80">
        Business name
        <input name="businessName" required className={inputClasses} placeholder="Your business" autoComplete="organization" />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-white/80">
        Email address
        <input name="emailAddress" required className={inputClasses} placeholder="you@company.com" type="email" autoComplete="email" />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-white/80">
        Barcode workflow
        <textarea
          name="message"
          required
          maxLength={2000}
          className="min-h-32 rounded-[var(--radius-md)] border border-white/12 bg-white/[0.06] px-4 py-3 text-white outline-none placeholder:text-white/34 hover:border-white/24 hover:bg-white/[0.08] focus:border-[var(--gold)] focus:ring-4 focus:ring-[rgba(247,183,49,0.16)]"
          placeholder="Tell us what products, branches, workers, and barcode flow you need to track."
        />
      </label>

      {status ? (
        <div className={`flex items-start gap-3 rounded-[var(--radius-md)] border px-4 py-3 text-sm leading-6 ${statusClasses(status.tone)}`} role={status.tone === "error" ? "alert" : "status"}>
          {status.tone === "success" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> : <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />}
          <span>{status.message}</span>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--gold)] px-6 font-bold text-[var(--ink)] shadow-[var(--shadow-soft)] hover:bg-white focus:ring-4 focus:ring-[rgba(247,183,49,0.18)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        {isSubmitting ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
