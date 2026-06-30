"use client";

import { type FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, TriangleAlert } from "lucide-react";

type ContactStatus = {
  tone: "success" | "warning" | "error";
  message: string;
};

type ContactResponse = {
  status?: "RECEIVED" | "EMAIL_SENT" | "EMAIL_FAILED";
  confirmationEmailSent?: boolean;
  notificationEmailSent?: boolean;
  message?: string;
  error?: string;
  detail?: string;
};

const inputClasses = "h-12 rounded-[var(--radius-lg)] border border-[var(--line)] bg-white px-4 text-[var(--ink)] shadow-[var(--shadow-soft)] outline-none placeholder:text-[var(--muted)] hover:border-[var(--line-strong)] focus:border-[var(--signal)] focus:ring-4 focus:ring-[rgba(242,100,42,0.14)]";
const labelClasses = "grid gap-2 text-sm font-black text-[var(--ink)]";

function fieldValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function statusClasses(tone: ContactStatus["tone"]) {
  if (tone === "success") {
    return "border-[var(--confirm)]/40 bg-[var(--confirm)]/10 text-[var(--confirm)]";
  }

  if (tone === "warning") {
    return "border-[var(--gold)]/50 bg-[var(--gold)]/12 text-[var(--warning)]";
  }

  return "border-[var(--signal)]/45 bg-[var(--signal)]/10 text-[var(--ember)]";
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

function successMessage(responseBody: ContactResponse) {
  if (responseBody.confirmationEmailSent && responseBody.notificationEmailSent) {
    return responseBody.message ?? "Thanks. We sent your confirmation email and notified King Sparkon Tracker support.";
  }

  return responseBody.message ?? "Thanks. We received your message and sent a confirmation email.";
}

function warningMessage(responseBody: ContactResponse) {
  if (responseBody.confirmationEmailSent && !responseBody.notificationEmailSent) {
    return "Your message was saved and your confirmation email was sent, but King Sparkon Tracker support notification failed.";
  }

  if (!responseBody.confirmationEmailSent && responseBody.notificationEmailSent) {
    return "Your message was saved and King Sparkon Tracker support was notified, but your confirmation email failed.";
  }

  return responseBody.message ?? "Your message was saved, but email delivery failed. Please try again or contact support.";
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
        message: deliveryFailed ? warningMessage(responseBody) : successMessage(responseBody),
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
    <form className="grid gap-4 rounded-[2rem] bg-white p-0 text-[var(--ink)]" onSubmit={handleSubmit}>
      <div className="rounded-[1.35rem] border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm font-semibold leading-6 text-[var(--steel)]">
        Successful submissions send two emails: one confirmation to you and one notification to King Sparkon Tracker support.
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClasses}>
          Contact name
          <input name="contactName" className={inputClasses} placeholder="Example: Sizolwakhe Nkosi" autoComplete="name" />
        </label>
        <label className={labelClasses}>
          Phone number
          <input name="phoneNumber" className={inputClasses} placeholder="Example: +27 82 123 4567" autoComplete="tel" />
        </label>
      </div>
      <label className={labelClasses}>
        Business name
        <input name="businessName" required className={inputClasses} placeholder="Example: Sparkon Retail Store" autoComplete="organization" />
      </label>
      <label className={labelClasses}>
        Email address
        <input name="emailAddress" required className={inputClasses} placeholder="Example: owner@sparkonstore.co.za" type="email" autoComplete="email" />
      </label>
      <label className={labelClasses}>
        Barcode workflow
        <textarea
          name="message"
          required
          maxLength={2000}
          className="min-h-32 rounded-[var(--radius-lg)] border border-[var(--line)] bg-white px-4 py-3 text-[var(--ink)] shadow-[var(--shadow-soft)] outline-none placeholder:text-[var(--muted)] hover:border-[var(--line-strong)] focus:border-[var(--signal)] focus:ring-4 focus:ring-[rgba(242,100,42,0.14)]"
          placeholder="Example: We need to track products, branches, workers, stock movement, QR tips, and barcode scan reports."
        />
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
        className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-lg)] bg-[var(--signal)] px-6 font-bold text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ember)] focus:ring-4 focus:ring-[rgba(242,100,42,0.18)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        {isSubmitting ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
