import { useEffect, useState } from "react";
import { apiGet } from "./api-client";
import { useAuth } from "@/store/auth-context";
import {
  DEFAULT_LOCALIZATION,
  currencyForCountry,
  type LocalizationConfig,
  type LocalizationCountry,
} from "./localization-utils";

export type { LocalizationConfig, LocalizationCountry, SupportedCurrency } from "./localization-utils";
export { convertZarToUsd, currencyForCountry, formatMoney, isSouthAfrica } from "./localization-utils";

let cachedConfig: LocalizationConfig | null = null;
let inflight: Promise<LocalizationConfig> | null = null;

export async function fetchLocalization(): Promise<LocalizationConfig> {
  if (cachedConfig) return cachedConfig;
  if (!inflight) {
    inflight = apiGet<LocalizationConfig>("/v1/localization")
      .then((data) => {
        cachedConfig = { ...DEFAULT_LOCALIZATION, ...data };
        return cachedConfig;
      })
      .catch(() => DEFAULT_LOCALIZATION)
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export function useLocalization() {
  const { user } = useAuth();
  const [config, setConfig] = useState<LocalizationConfig>(cachedConfig ?? DEFAULT_LOCALIZATION);
  const [loading, setLoading] = useState(!cachedConfig);

  useEffect(() => {
    let mounted = true;
    fetchLocalization()
      .then((next) => {
        if (mounted) setConfig(next);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const country = (user?.localizationCountry as LocalizationCountry | undefined) ?? config.localizationCountry;
  return { ...config, localizationCountry: country, currency: currencyForCountry(country), loading };
}
