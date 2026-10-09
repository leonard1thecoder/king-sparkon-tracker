"use client";

import { type FormEvent, useState } from "react";
import { StatusNote } from "@/components/auth/AuthFields";

// Same endpoint and payload as the /contact page form.
type Status = { tone: "success" | "warning" | "error"; message: string } | null;

type ContactResponse = {
  status?: "RECEIVED" | "EMAIL_QUEUED" | "EMAIL_SENT" | "EMAIL_FAILED";
  message?: string;
  error?: string;
  detail?: string;
};

const labelClass = "grid gap-2 text-sm font-semibold text-[var(--ks-ink)]";

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export function ContactForm() {
  const [status, setStatus] = useState<Status>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      contactName: field(formData, "contactName"),
      businessName: field(formData, "businessName"),
      emailAddress: field(formData, "emailAddress"),
      phoneNumber: field(formData, "phoneNumber"),
      message: field(formData, "message"),
    };

    if (!payload.businessName || !payload.emailAddress || !payload.message) {
      setStatus({ tone: "error", message: "Business name, email address and message are required." });
      return;
    }
    if (!payload.emailAddress.includes("@")) {
      setStatus({ tone: "error", message: "Enter a valid email address so we can confirm the inquiry." });
      return;
    }
    if (payload.message.length > 2000) {
      setStatus({ tone: "error", message: "Message must be 2,000 characters or less." });
      return;
    }

    setSubmitting(true);
    setStatus(null);
    try {
      const response = await fetch("/api/contact-inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json().catch(() => ({}))) as ContactResponse;

      if (!response.ok) {
        setStatus({ tone: "error", message: body.message ?? body.error ?? body.detail ?? "The backend rejected this contact request." });
        return;
      }

      const deliveryFailed = body.status === "EMAIL_FAILED";
      setStatus({
        tone: deliveryFailed ? "warning" : "success",
        message:
          body.message ??
          (deliveryFailed
            ? "Your message was saved, but email delivery failed. Please try again or contact support."
            : "Thanks. We received your message and queued your confirmation email."),
      });
      if (!deliveryFailed) form.reset();
    } catch {
      setStatus({ tone: "error", message: "Unable to reach the contact service. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          Contact name
          <input name="contactName" autoComplete="name" placeholder="Sizolwakhe Nkosi" className="ks-input" />
        </label>
        <label className={labelClass}>
          Phone number
          <input name="phoneNumber" type="tel" autoComplete="tel" placeholder="+27 82 123 4567" className="ks-input" />
        </label>
      </div>
      <label className={labelClass}>
        Business name
        <input name="businessName" autoComplete="organization" required placeholder="Sparkon Retail Store" className="ks-input" />
      </label>
      <label className={labelClass}>
        Email address
        <input name="emailAddress" type="email" autoComplete="email" required placeholder="owner@sparkonstore.co.za" className="ks-input" />
      </label>
      <label className={labelClass}>
        What do you need to manage?
        <textarea name="message" required maxLength={2000} placeholder="Describe the roles, products or ticket flow you need to manage" className="ks-textarea" />
      </label>

      {status ? <StatusNote tone={status.tone === "success" ? "success" : "error"} message={status.message} /> : null}

      <button type="submit" disabled={submitting} className="ks-btn ks-btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">
        {submitting ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
