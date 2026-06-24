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

function fieldValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function statusClasses(tone: ContactStatus["tone"]) {
  if (tone === "success") {
    return "border-[#99e39e]/30 bg-[#99e39e]/10 text-[#c8fad6]";
  }

  if (tone === "warning") {
    return "border-[#ffab00]/30 bg-[#ffab00]/10 text-[#ffd666]";
  }

  return "border-[#ff5630]/30 bg-[#ff5630]/10 text-[#ffac82]";
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
        <input
          name="contactName"
          className="h-12 rounded-lg border border-white/12 bg-[#000510]/45 px-4 text-white outline-none transition placeholder:text-white/34 hover:border-[#99e39e]/45 hover:bg-[#000510]/70 hover:text-white focus:border-[#99e39e] focus:bg-[#000510]/70 focus:ring-4 focus:ring-[#99e39e]/15"
          placeholder="Your name"
          autoComplete="name"
        />
        <input
          name="phoneNumber"
          className="h-12 rounded-lg border border-white/12 bg-[#000510]/45 px-4 text-white outline-none transition placeholder:text-white/34 hover:border-[#99e39e]/45 hover:bg-[#000510]/70 hover:text-white focus:border-[#99e39e] focus:bg-[#000510]/70 focus:ring-4 focus:ring-[#99e39e]/15"
          placeholder="Phone number"
          autoComplete="tel"
        />
      </div>
      <input
        name="businessName"
        required
        className="h-12 rounded-lg border border-white/12 bg-[#000510]/45 px-4 text-white outline-none transition placeholder:text-white/34 hover:border-[#99e39e]/45 hover:bg-[#000510]/70 hover:text-white focus:border-[#99e39e] focus:bg-[#000510]/70 focus:ring-4 focus:ring-[#99e39e]/15"
        placeholder="Business name"
        autoComplete="organization"
      />
      <input
        name="emailAddress"
        required
        className="h-12 rounded-lg border border-white/12 bg-[#000510]/45 px-4 text-white outline-none transition placeholder:text-white/34 hover:border-[#99e39e]/45 hover:bg-[#000510]/70 hover:text-white focus:border-[#99e39e] focus:bg-[#000510]/70 focus:ring-4 focus:ring-[#99e39e]/15"
        placeholder="Email address"
        type="email"
        autoComplete="email"
      />
      <textarea
        name="message"
        required
        maxLength={2000}
        className="min-h-32 rounded-lg border border-white/12 bg-[#000510]/45 px-4 py-3 text-white outline-none transition placeholder:text-white/34 hover:border-[#99e39e]/45 hover:bg-[#000510]/70 hover:text-white focus:border-[#99e39e] focus:bg-[#000510]/70 focus:ring-4 focus:ring-[#99e39e]/15"
        placeholder="Tell us what products and barcode workflow you need to track."
      />

      {status ? (
        <div
          className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm leading-6 ${statusClasses(status.tone)}`}
          role={status.tone === "error" ? "alert" : "status"}
        >
          {status.tone === "success" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          ) : (
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          )}
          <span>{status.message}</span>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#99e39e] px-6 font-semibold text-[#000510] transition hover:bg-transparent hover:text-[#99e39e] hover:ring-1 hover:ring-[#99e39e] focus:outline-none focus:ring-4 focus:ring-[#99e39e]/20 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        {isSubmitting ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
