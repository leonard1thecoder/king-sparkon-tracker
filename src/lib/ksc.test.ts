import { describe, expect, it } from "vitest";
import {
  canSpendKsc,
  formatKsc,
  formatKscZar,
  kscEntryLabel,
  kscEntrySign,
  kscTotals,
  validateTopUpAmount,
} from "./ksc";
import type { KscWallet } from "@/lib/types/backend";

function wallet(overrides: Partial<KscWallet> = {}): KscWallet {
  return {
    id: 1,
    currency: "KSC",
    availableBalance: 800,
    reservedBalance: 200,
    totalBalance: 1000,
    zarEquivalent: 1000,
    status: "ACTIVE",
    ...overrides,
  };
}

describe("ksc helpers", () => {
  it("formats KSC without merging it into ZAR", () => {
    expect(formatKsc(500)).toBe("500.00 KSC");
    expect(formatKsc(null)).toBe("0.00 KSC");
    expect(formatKscZar(500)).toContain("R");
    expect(formatKscZar(500)).not.toContain("KSC");
  });

  it("keeps available, reserved and total separate", () => {
    expect(kscTotals(wallet())).toEqual({ available: 800, reserved: 200, total: 1000 });
    expect(kscTotals(null)).toEqual({ available: 0, reserved: 0, total: 0 });
  });

  it("only allows spending from available balance", () => {
    expect(canSpendKsc(wallet(), 800)).toBe(true);
    expect(canSpendKsc(wallet(), 801)).toBe(false);
    expect(canSpendKsc(wallet(), 0)).toBe(false);
    expect(canSpendKsc(null, 10)).toBe(false);
  });

  it("validates top-up bounds", () => {
    expect(validateTopUpAmount(9.99)).toContain("at least");
    expect(validateTopUpAmount(50001)).toContain("exceed");
    expect(validateTopUpAmount(500)).toBeNull();
  });

  it("labels ledger entries and signs", () => {
    expect(kscEntryLabel("TOP_UP_CREDIT")).toBe("Wallet top-up");
    expect(kscEntryLabel("PAYMENT_CAPTURE")).toBe("Payment captured");
    expect(kscEntryLabel("UNKNOWN_X")).toBe("unknown x");
    expect(kscEntrySign({ amount: -250 } as never)).toBe(-1);
    expect(kscEntrySign({ amount: 500 } as never)).toBe(1);
  });
});
