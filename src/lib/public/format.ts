const zar = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  maximumFractionDigits: 2,
});

export function formatZar(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return null;
  return zar.format(Number(value));
}

// Dates are pinned to South Africa time. Without a fixed zone the server and
// the browser can format the same instant differently, which causes a
// hydration mismatch on client components.
const SA_TIME_ZONE = "Africa/Johannesburg";

export function formatEventDate(eventDate: string) {
  const date = new Date(`${eventDate}T12:00:00+02:00`);
  if (Number.isNaN(date.getTime())) return eventDate;
  return new Intl.DateTimeFormat("en-ZA", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: SA_TIME_ZONE,
  }).format(date);
}

export function formatEventTime(eventTime: string) {
  return eventTime.slice(0, 5);
}

// South Africa (SAST) is UTC+2 with no daylight saving, so a fixed offset is correct.
export function eventStartIso(eventDate: string, eventTime: string) {
  const time = eventTime.length === 5 ? `${eventTime}:00` : eventTime;
  return `${eventDate}T${time}+02:00`;
}
