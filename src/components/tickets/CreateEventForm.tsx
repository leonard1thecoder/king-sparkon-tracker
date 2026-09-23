"use client";

import { type FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Calendar, CheckCircle2, Image as ImageIcon, MapPin, Plus } from "lucide-react";
import { createEvent, uploadEventBanner } from "@/services/ticketService";
import type { CreateTicketEventPayload, EventStatus, TicketType } from "@/types/tickets";

const ticketTypes: TicketType[] = ["REGULAR", "VIP", "VVIP"];
const statusOptions: EventStatus[] = ["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"];

type TicketTypeInput = {
  price: string;
  capacity: string;
};

type FormState = {
  name: string;
  description: string;
  eventDate: string;
  eventTime: string;
  location: string;
  status: EventStatus;
  ticketTypes: Record<TicketType, TicketTypeInput>;
  earlyBirdEnabled: boolean;
  earlyBirdPercent: string;
  earlyBirdEndsAt: string;
  marketplaceHubEnabled: boolean;
  marketplaceHubPrice: string;
};

const initialState: FormState = {
  name: "",
  description: "",
  eventDate: "",
  eventTime: "",
  location: "",
  status: "PUBLISHED",
  ticketTypes: {
    REGULAR: { price: "0", capacity: "100" },
    VIP: { price: "0", capacity: "50" },
    VVIP: { price: "0", capacity: "20" },
  },
  earlyBirdEnabled: false,
  earlyBirdPercent: "",
  earlyBirdEndsAt: "",
  marketplaceHubEnabled: false,
  marketplaceHubPrice: "",
};

function todayValue() {
  return new Date().toISOString().slice(0, 10);
}

function labelFromType(type: TicketType) {
  return type === "REGULAR" ? "Regular" : type;
}

export function CreateEventForm() {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>(initialState);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalCapacity = useMemo(
    () => ticketTypes.reduce((sum, type) => sum + Number(formState.ticketTypes[type].capacity || 0), 0),
    [formState.ticketTypes],
  );

  function updateField<K extends keyof Omit<FormState, "ticketTypes">>(key: K, value: FormState[K]) {
    setFormState((current) => ({ ...current, [key]: value }));
  }

  function updateTicketType(type: TicketType, field: keyof TicketTypeInput, value: string) {
    setFormState((current) => ({
      ...current,
      ticketTypes: {
        ...current.ticketTypes,
        [type]: { ...current.ticketTypes[type], [field]: value },
      },
    }));
  }

  function validate() {
    if (!formState.name.trim()) return "Event name is required.";
    if (!formState.description.trim()) return "Event description is required.";
    if (!formState.eventDate) return "Event date is required.";
    if (!formState.eventTime) return "Event time is required.";
    if (!formState.location.trim()) return "Location is required.";

    const selectedDateTime = new Date(`${formState.eventDate}T${formState.eventTime}`);
    if (selectedDateTime < new Date()) return "Date must not be in the past.";

    for (const type of ticketTypes) {
      const price = Number(formState.ticketTypes[type].price);
      const capacity = Number(formState.ticketTypes[type].capacity);
      if (Number.isNaN(price) || price < 0) return `${labelFromType(type)} ticket price must be zero or positive.`;
      if (!Number.isInteger(capacity) || capacity <= 0) return `${labelFromType(type)} ticket capacity must be positive.`;
    }

    if (formState.earlyBirdEnabled) {
      const percent = Number(formState.earlyBirdPercent);
      if (!Number.isFinite(percent) || percent < 1 || percent > 90) return "Early bird percent must be between 1 and 90.";
      if (!formState.earlyBirdEndsAt) return "Early bird end date is required.";
      const endsAt = new Date(formState.earlyBirdEndsAt);
      if (endsAt <= new Date()) return "Early bird end must be in the future.";
    }

    if (formState.marketplaceHubEnabled) {
      const hubPrice = Number(formState.marketplaceHubPrice);
      if (!Number.isFinite(hubPrice) || hubPrice < 0) return "Marketplace Hub price must be zero or positive.";
    }

    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage(null);
    const validationError = validate();
    if (validationError) {
      setStatusMessage({ tone: "error", message: validationError });
      return;
    }

    const payload: CreateTicketEventPayload = {
      name: formState.name,
      description: formState.description,
      location: formState.location,
      eventDate: formState.eventDate,
      eventTime: formState.eventTime,
      status: formState.status,
      ticketTypes: ticketTypes.map((type) => ({
        type,
        price: Number(formState.ticketTypes[type].price),
        capacity: Number(formState.ticketTypes[type].capacity),
      })),
      earlyBirdEnabled: formState.earlyBirdEnabled,
      earlyBirdPercent: formState.earlyBirdEnabled ? Number(formState.earlyBirdPercent) : undefined,
      earlyBirdEndsAt: formState.earlyBirdEnabled ? new Date(formState.earlyBirdEndsAt).toISOString() : undefined,
      marketplaceHubEnabled: formState.marketplaceHubEnabled,
      marketplaceHubPrice: formState.marketplaceHubEnabled ? Number(formState.marketplaceHubPrice) : undefined,
    };

    try {
      setIsSubmitting(true);
      const createdEvent = await createEvent(payload);
      const eventWithBanner = bannerFile ? await uploadEventBanner(createdEvent.id, bannerFile) : createdEvent;
      setBannerFile(null);
      const visibility = payload.status === "PUBLISHED" ? "It is now visible to users." : "It remains a draft and is visible only to owners.";
      setStatusMessage({ tone: "success", message: `${eventWithBanner.name} was created successfully. ${visibility} Opening your ticket list in a moment.` });
      router.refresh();
      window.setTimeout(() => router.push("/dashboard/owner/tickets"), 2200);
    } catch (error) {
      setStatusMessage({ tone: "error", message: error instanceof Error ? error.message : "Unable to create event." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 rounded-[2.35rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-ledger)] md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[var(--signal)]">Create event</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] md:text-5xl">Event details and ticket capacity</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--steel)]">Build events with Regular, VIP, and VVIP classes. Capacity and availability are calculated from the ticket rules.</p>
        </div>
        <div className="rounded-[1.45rem] border border-[var(--line)] bg-[var(--surface)] px-5 py-4 text-center">
          <p className="font-mono text-[0.66rem] font-black uppercase tracking-[0.16em] text-[var(--muted)]">Total capacity</p>
          <p className="money mt-1 text-3xl font-black text-[var(--ink)]">{totalCapacity}</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-black">Event name</span>
          <input value={formState.name} onChange={(event) => updateField("name", event.target.value)} placeholder="Example: King Sparkon Barcode Summit" className="min-h-13 rounded-[1.35rem] border border-[var(--line)] bg-white px-4 text-sm font-bold outline-none placeholder:text-[var(--muted)] focus:border-[var(--signal)] focus:shadow-[var(--focus-ring)]" />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-black">Location</span>
          <span className="flex min-h-13 items-center gap-3 rounded-[1.35rem] border border-[var(--line)] bg-white px-4 focus-within:border-[var(--signal)] focus-within:shadow-[var(--focus-ring)]">
            <MapPin className="h-4 w-4 text-[var(--signal)]" />
            <input value={formState.location} onChange={(event) => updateField("location", event.target.value)} placeholder="Example: Johannesburg Expo Centre, Nasrec" className="w-full bg-transparent text-sm font-bold outline-none placeholder:text-[var(--muted)]" />
          </span>
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-black">Event date</span>
          <span className="flex min-h-13 items-center gap-3 rounded-[1.35rem] border border-[var(--line)] bg-white px-4 focus-within:border-[var(--signal)] focus-within:shadow-[var(--focus-ring)]">
            <Calendar className="h-4 w-4 text-[var(--signal)]" />
            <input type="date" min={todayValue()} value={formState.eventDate} onChange={(event) => updateField("eventDate", event.target.value)} className="w-full bg-transparent text-sm font-bold outline-none" />
          </span>
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-black">Event time</span>
          <input type="time" value={formState.eventTime} onChange={(event) => updateField("eventTime", event.target.value)} className="min-h-13 rounded-[1.35rem] border border-[var(--line)] bg-white px-4 text-sm font-bold outline-none focus:border-[var(--signal)] focus:shadow-[var(--focus-ring)]" />
        </label>
        <label className="grid gap-2 lg:col-span-2">
          <span className="text-sm font-black">Banner image</span>
          <span className="flex min-h-13 items-center gap-3 rounded-[1.35rem] border border-[var(--line)] bg-white px-4 focus-within:border-[var(--signal)] focus-within:shadow-[var(--focus-ring)]">
            <ImageIcon className="h-4 w-4 text-[var(--signal)]" />
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => setBannerFile(event.target.files?.[0] ?? null)} className="w-full bg-transparent text-sm font-bold outline-none file:mr-3 file:rounded-full file:border-0 file:bg-[var(--signal-soft)] file:px-3 file:py-2 file:font-black file:text-[var(--signal-strong)]" />
          </span>
        </label>
        <label className="grid gap-2 lg:col-span-2">
          <span className="text-sm font-black">Description</span>
          <textarea value={formState.description} onChange={(event) => updateField("description", event.target.value)} placeholder="Describe the event, audience, access rules, and what ticket holders should expect." className="min-h-32 resize-none rounded-[1.65rem] border border-[var(--line)] bg-white px-4 py-4 text-sm font-bold leading-6 outline-none placeholder:text-[var(--muted)] focus:border-[var(--signal)] focus:shadow-[var(--focus-ring)]" />
        </label>
        <label className="grid gap-2 lg:col-span-2">
          <span className="text-sm font-black">Event status</span>
          <select value={formState.status} onChange={(event) => updateField("status", event.target.value as EventStatus)} className="min-h-13 rounded-[1.35rem] border border-[var(--line)] bg-white px-4 text-sm font-black outline-none focus:border-[var(--signal)] focus:shadow-[var(--focus-ring)]">
            {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {ticketTypes.map((type) => (
          <fieldset key={type} className="rounded-[1.8rem] border border-[var(--line)] bg-[var(--surface)] p-4">
            <legend className="px-2 font-mono text-[0.68rem] font-black uppercase tracking-[0.16em] text-[var(--signal)]">{labelFromType(type)}</legend>
            <label className="mt-3 grid gap-2">
              <span className="text-sm font-black">{labelFromType(type)} ticket price</span>
              <input type="number" min="0" step="0.01" value={formState.ticketTypes[type].price} onChange={(event) => updateTicketType(type, "price", event.target.value)} placeholder="Example: 180" className="min-h-12 rounded-[1.25rem] border border-[var(--line)] bg-white px-4 text-sm font-bold outline-none placeholder:text-[var(--muted)] focus:border-[var(--signal)] focus:shadow-[var(--focus-ring)]" />
            </label>
            <label className="mt-3 grid gap-2">
              <span className="text-sm font-black">{labelFromType(type)} ticket capacity</span>
              <input type="number" min="1" step="1" value={formState.ticketTypes[type].capacity} onChange={(event) => updateTicketType(type, "capacity", event.target.value)} placeholder="Example: 100" className="min-h-12 rounded-[1.25rem] border border-[var(--line)] bg-white px-4 text-sm font-bold outline-none placeholder:text-[var(--muted)] focus:border-[var(--signal)] focus:shadow-[var(--focus-ring)]" />
            </label>
          </fieldset>
        ))}
      </div>

      <div className="rounded-[1.8rem] border border-[var(--line)] bg-white p-4">
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={formState.earlyBirdEnabled} onChange={(e) => setFormState((c) => ({ ...c, earlyBirdEnabled: e.target.checked }))} className="h-5 w-5 rounded border-[var(--line)] accent-[var(--signal)]" />
          <span className="text-sm font-black">Enable Early Bird</span>
          <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-black text-orange-600 border border-orange-200">Early bird starts when event is created</span>
        </label>
        {formState.earlyBirdEnabled ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-black">Early bird percent (1-90)</span>
              <input type="number" min={1} max={90} value={formState.earlyBirdPercent} onChange={(e) => setFormState((c) => ({ ...c, earlyBirdPercent: e.target.value.replace(/\D/g, "") }))} placeholder="e.g. 20" className="min-h-12 rounded-[1.25rem] border border-[var(--line)] bg-white px-4 text-sm font-bold outline-none placeholder:text-[var(--muted)] focus:border-[var(--signal)] focus:shadow-[var(--focus-ring)]" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-black">Early bird ends at</span>
              <input type="datetime-local" value={formState.earlyBirdEndsAt} onChange={(e) => setFormState((c) => ({ ...c, earlyBirdEndsAt: e.target.value }))} className="min-h-12 rounded-[1.25rem] border border-[var(--line)] bg-white px-4 text-sm font-bold outline-none focus:border-[var(--signal)] focus:shadow-[var(--focus-ring)]" />
            </label>
          </div>
        ) : null}
        <p className="mt-2 text-xs font-semibold text-[var(--muted)]">Early bird discount from original ticket price, active from creation until end, then reverts.</p>
      </div>

      <div className="rounded-[1.8rem] border border-[var(--line)] bg-white p-4">
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={formState.marketplaceHubEnabled} onChange={(e) => setFormState((c) => ({ ...c, marketplaceHubEnabled: e.target.checked }))} className="h-5 w-5 rounded border-[var(--line)] accent-[var(--signal)]" />
          <span className="text-sm font-black">Create Marketplace Hub</span>
          <span className="rounded-full bg-[var(--signal-soft)] px-2.5 py-1 text-xs font-black text-[var(--signal-strong)]">Business products appear in event details</span>
        </label>
        {formState.marketplaceHubEnabled ? (
          <label className="mt-4 grid gap-2">
            <span className="text-sm font-black">Marketplace Hub price (R)</span>
            <input type="number" min="0" step="0.01" value={formState.marketplaceHubPrice} onChange={(event) => updateField("marketplaceHubPrice", event.target.value.replace(/[^0-9.]/g, ""))} placeholder="Example: 250" className="min-h-12 rounded-[1.25rem] border border-[var(--line)] bg-white px-4 text-sm font-bold outline-none placeholder:text-[var(--muted)] focus:border-[var(--signal)] focus:shadow-[var(--focus-ring)]" />
          </label>
        ) : null}
        <p className="mt-2 text-xs font-semibold text-[var(--muted)]">When enabled, this business&apos;s products are listed inside the ticket event details for buyers.</p>
      </div>

      {statusMessage ? (
        <div role={statusMessage.tone === "error" ? "alert" : "status"} className={`flex gap-3 rounded-[1.5rem] border px-4 py-3 text-sm font-semibold leading-6 ${statusMessage.tone === "error" ? "border-[var(--danger)]/25 bg-[var(--danger)]/10 text-[var(--danger)]" : "border-[var(--confirm)]/25 bg-[var(--confirm)]/10 text-[var(--confirm)]"}`}>
          {statusMessage.tone === "error" ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
          <span>{statusMessage.message}</span>
        </div>
      ) : null}

      <button type="submit" disabled={isSubmitting} className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-6 text-sm font-black text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ember)]">
        <Plus className="h-4 w-4" /> {isSubmitting ? "Creating event..." : "Create event"}
      </button>
    </form>
  );
}
