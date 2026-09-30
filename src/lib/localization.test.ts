import { describe, expect, test } from "vitest";
import { convertZarToUsd, currencyForCountry, formatMoney, isSouthAfrica } from "./localization-utils";

describe("localization helpers", () => {
  test("maps countries to currencies", () => {
    expect(currencyForCountry("SOUTH_AFRICA")).toBe("ZAR");
    expect(currencyForCountry("REST_OF_WORLD")).toBe("USD");
    expect(currencyForCountry(undefined)).toBe("ZAR");
    expect(isSouthAfrica("SOUTH_AFRICA")).toBe(true);
    expect(isSouthAfrica("REST_OF_WORLD")).toBe(false);
  });

  test("converts ZAR to USD at the configured rate", () => {
    expect(convertZarToUsd(185, 18.5)).toBe(10);
    expect(convertZarToUsd(100, 18.5)).toBe(5.41);
    expect(convertZarToUsd(100, 0)).toBe(0);
  });

  test("formats amounts per currency", () => {
    expect(formatMoney(50, "ZAR")).toContain("50,00");
    expect(formatMoney(10, "USD")).toContain("10.00");
  });
});
