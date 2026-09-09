import { describe, expect, it, vi } from "vitest";
import {
  PayFastPendingTimeoutError,
  isFailedPayFastStatus,
  isTerminalPayFastStatus,
  parsePayFastReturn,
  pollPayFastStatus,
  validatePayFastForm,
  type PayFastStatusSnapshot,
} from "./payfast";

describe("parsePayFastReturn", () => {
  it("reads the merchant payment id and cancelled flag", () => {
    expect(parsePayFastReturn("?m_payment_id=CART-1")).toEqual({ merchantPaymentId: "CART-1", cancelled: false });
    expect(parsePayFastReturn("?m_payment_id=CART-1&cancelled=1")).toEqual({ merchantPaymentId: "CART-1", cancelled: true });
    expect(parsePayFastReturn("")).toEqual({ merchantPaymentId: null, cancelled: false });
  });
});

describe("payfast status helpers", () => {
  it("classifies terminal and failed statuses", () => {
    expect(isTerminalPayFastStatus("COMPLETE")).toBe(true);
    expect(isTerminalPayFastStatus("failed")).toBe(true);
    expect(isTerminalPayFastStatus("CANCELLED")).toBe(true);
    expect(isTerminalPayFastStatus("PROCESSING")).toBe(false);
    expect(isTerminalPayFastStatus("CREATED")).toBe(false);
    expect(isTerminalPayFastStatus(null)).toBe(false);
    expect(isFailedPayFastStatus("FAILED")).toBe(true);
    expect(isFailedPayFastStatus("COMPLETE")).toBe(false);
  });

  it("validates form data before submit", () => {
    const fields = { m_payment_id: "CART-1", amount: "450.00", signature: "abc" };
    expect(validatePayFastForm("https://sandbox.payfast.co.za/eng/process", fields)).toBeNull();
    expect(validatePayFastForm("http://insecure.example.com/process", fields)).not.toBeNull();
    expect(validatePayFastForm("https://sandbox.payfast.co.za/eng/process", { m_payment_id: "CART-1" })).not.toBeNull();
    expect(validatePayFastForm("https://sandbox.payfast.co.za/eng/process", null)).not.toBeNull();
  });
});

describe("pollPayFastStatus", () => {
  const snapshot = (overrides: Partial<PayFastStatusSnapshot> = {}): PayFastStatusSnapshot => ({
    merchantPaymentId: "CART-1",
    paymentStatus: "PROCESSING",
    fulfilled: false,
    ...overrides,
  });

  it("returns once the backend reports a fulfilled COMPLETE payment", async () => {
    const fetchStatus = vi
      .fn()
      .mockResolvedValueOnce(snapshot())
      .mockResolvedValueOnce(snapshot({ paymentStatus: "COMPLETE", fulfilled: true }));

    const result = await pollPayFastStatus(fetchStatus, "CART-1", { attempts: 5, sleep: () => Promise.resolve() });

    expect(result.fulfilled).toBe(true);
    expect(fetchStatus).toHaveBeenCalledTimes(2);
  });

  it("throws without clearing on FAILED so callers keep local state", async () => {
    const fetchStatus = vi.fn().mockResolvedValue(snapshot({ paymentStatus: "FAILED", message: "Card declined." }));

    await expect(pollPayFastStatus(fetchStatus, "CART-1", { attempts: 3, sleep: () => Promise.resolve() })).rejects.toThrow(
      /FAILED/,
    );
    expect(fetchStatus).toHaveBeenCalledTimes(1);
  });

  it("times out into a pending error instead of reporting failure", async () => {
    const fetchStatus = vi.fn().mockResolvedValue(snapshot());

    await expect(
      pollPayFastStatus(fetchStatus, "CART-1", { attempts: 3, sleep: () => Promise.resolve() }),
    ).rejects.toBeInstanceOf(PayFastPendingTimeoutError);
    expect(fetchStatus).toHaveBeenCalledTimes(3);
  });
});
