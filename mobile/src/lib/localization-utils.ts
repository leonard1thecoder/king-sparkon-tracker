export type LocalizationCountry = "SOUTH_AFRICA" | "REST_OF_WORLD";
export type SupportedCurrency = "ZAR" | "USD";

export type LocalizationConfig = {
  localizationCountry: LocalizationCountry;
  currency: SupportedCurrency;
  usdToZarRate: number;
  payfastEnabled: boolean;
  paypalCheckoutEnabled: boolean;
};

export const DEFAULT_LOCALIZATION: LocalizationConfig = {
  localizationCountry: "SOUTH_AFRICA",
  currency: "ZAR",
  usdToZarRate: 18.5,
  payfastEnabled: true,
  paypalCheckoutEnabled: false,
};

export function currencyForCountry(country?: string | null): SupportedCurrency {
  return country === "REST_OF_WORLD" ? "USD" : "ZAR";
}

export function isSouthAfrica(country?: string | null) {
  return (country ?? "SOUTH_AFRICA") === "SOUTH_AFRICA";
}

export function convertZarToUsd(zarAmount: number, rate: number) {
  if (!Number.isFinite(zarAmount) || !Number.isFinite(rate) || rate <= 0) return 0;
  return Math.round((zarAmount / rate) * 100) / 100;
}

export function formatMoney(amount: number | null | undefined, currency: SupportedCurrency = "ZAR") {
  const value = Number.isFinite(Number(amount)) ? Number(amount) : 0;
  return currency === "USD" ? `$${value.toFixed(2)}` : `R${value.toFixed(2)}`;
}
