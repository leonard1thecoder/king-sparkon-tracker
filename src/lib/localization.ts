import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { DEFAULT_LOCALIZATION, type LocalizationConfig } from "./localization-utils";

export type { LocalizationConfig, LocalizationCountry, SupportedCurrency } from "./localization-utils";
export { convertZarToUsd, currencyForCountry, formatMoney, isSouthAfrica } from "./localization-utils";

let cachedConfig: LocalizationConfig | null = null;
let inflight: Promise<LocalizationConfig> | null = null;

export async function fetchLocalization(): Promise<LocalizationConfig> {
  if (cachedConfig) return cachedConfig;
  if (!inflight) {
    inflight = apiClient
      .get<LocalizationConfig>("/v1/localization")
      .then((response) => {
        cachedConfig = { ...DEFAULT_LOCALIZATION, ...response.data };
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

  return { ...config, loading };
}
