"use client";

import { type FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Calendar, CheckCircle2, Image as ImageIcon, MapPin, Plus } from "lucide-react";
import { createEvent } from "@/services/ticketService";
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
  bannerUrl: string;
  status: EventStatus;
  ticketTypes: Record<TicketType, TicketTypeInput>;
};

const initialState: FormState = {
  name: "",
  description: "",
  eventDate: "",
  eventTime: "",
  location: "",
  bannerUrl: "",
  status: "DRAFT",
  ticketTypes: {
    REGULAR: { price: "0", capacity: "100" },
    VIP: { price: "0", capacity: "50" },
    VVIP: { price: "0", capacity: "20" },
  },
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
      bannerUrl: formState.bannerUrl,
      status: formState.status,
      ticketTypes: ticketTypes.map((type) => ({
        type,
        price: Number(formState.ticketTypes[type].price),
        capacity: Number(formState.ticketTypes[type].capacity),
      })),
    };

    try {
      setIsSubmitting(true);
      await createEvent(payload);
      setStatusMessage({ tone: "success", message: "Event created. Redirecting to owner dashboard." });
      window.setTimeout(() => router.push("/tickets/owner"), 450);
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
          <span className="text-sm font-black">Banner image URL / file placeholder</span>
          <span className="flex min-h-13 items-center gap-3 rounded-[1.35rem] border border-[var(--line)] bg-white px-4 focus-within:border-[var(--signal)] focus-within:shadow-[var(--focus-ring)]">
            <ImageIcon className="h-4 w-4 text-[var(--signal)]" />
            <input value={formState.bannerUrl} onChange={(event) => updateField("bannerUrl", event.target.value)} placeholder="Example: https://images.unsplash.com/event-banner.jpg" className="w-full bg-transparent text-sm font-bold outline-none placeholder:text-[var(--muted)]" />
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

      {statusMessage ? (
        <div className={`flex gap-3 rounded-[1.5rem] border px-4 py-3 text-sm font-semibold leading-6 ${statusMessage.tone === "error" ? "border-[var(--danger)]/25 bg-[var(--danger)]/10 text-[var(--danger)]" : "border-[var(--confirm)]/25 bg-[var(--confirm)]/10 text-[var(--confirm)]"}`}>
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
