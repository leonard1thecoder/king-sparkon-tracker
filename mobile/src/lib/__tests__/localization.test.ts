import { describe, expect, test } from "vitest";
import { convertZarToUsd, currencyForCountry, formatMoney, isSouthAfrica } from "../localization-utils";

describe("mobile localization helpers", () => {
  test("maps countries to currencies", () => {
    expect(currencyForCountry("SOUTH_AFRICA")).toBe("ZAR");
    expect(currencyForCountry("REST_OF_WORLD")).toBe("USD");
    expect(isSouthAfrica("REST_OF_WORLD")).toBe(false);
  });

  test("converts and formats", () => {
    expect(convertZarToUsd(185, 18.5)).toBe(10);
    expect(formatMoney(50, "ZAR")).toBe("R50.00");
    expect(formatMoney(10, "USD")).toBe("$10.00");
  });
});
