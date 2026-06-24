export function formatMoney(value: number | string | null | undefined, currency = "ZAR") {
  const amount = typeof value === "string" ? Number(value) : value ?? 0;

  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}
