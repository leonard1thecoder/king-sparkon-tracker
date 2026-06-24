import { describe, expect, it } from "vitest";
import { formatMoney } from "./money";

describe("formatMoney", () => {
  it("formats South African rand values", () => {
    expect(formatMoney(50)).toContain("50.00");
  });
});
