import { describe, expect, it } from "vitest";
import { idempotencyKey } from "../api-client";
import { getUserRoles, isWorkerLike, normalizeList, normalizeUifRows, uifRowSummary } from "../types";
import { numericWorkerId, parseWorkerTipQr } from "../tip-qr";

describe("mobile contracts", () => {
  it("normalizes paged and array product lists", () => {
    expect(normalizeList(null)).toEqual([]);
    expect(normalizeList([{ id: 1 } as never])).toHaveLength(1);
    expect(normalizeList({ content: [{ id: 2 }] } as never)).toHaveLength(1);
  });

  it("detects worker-like roles for tab gating", () => {
    expect(isWorkerLike(null)).toBe(false);
    expect(isWorkerLike({ id: 1, username: "u", emailAddress: "u@x.com", roles: ["User"] })).toBe(false);
    expect(isWorkerLike({ id: 2, username: "w", emailAddress: "w@x.com", roles: ["Worker"] })).toBe(true);
    expect(getUserRoles({ id: 3, username: "o", emailAddress: "o@x.com", privilege: "Owner" })).toContain("Owner");
  });

  it("creates scoped idempotency keys", () => {
    const key = idempotencyKey("tip");
    expect(key.startsWith("tip:")).toBe(true);
    expect(key.length).toBeGreaterThan(10);
  });

  it("normalizes UIF benefit rows across backend shapes", () => {
    expect(normalizeUifRows(null)).toEqual([]);
    expect(normalizeUifRows([{ benefitType: "UNEMPLOYMENT" }])).toHaveLength(1);
    expect(normalizeUifRows({ records: [{ benefit_type: "ILLNESS" }] })).toHaveLength(1);
    expect(normalizeUifRows({ benefits: [] })).toEqual([]);
  });

  it("summarizes UIF rows with snake/camel case fields", () => {
    const summary = uifRowSummary({ benefit_type: "MATERNITY", application_number: "A1", claim_status_display: "PAID" });
    expect(summary.benefitType).toBe("MATERNITY");
    expect(summary.applicationNumber).toBe("A1");
    expect(summary.claimStatus).toBe("PAID");
  });

  it("parses worker tip QR formats like web", () => {
    expect(parseWorkerTipQr("KST-WORKER-TIP-123")?.workerId).toBe("123");
    expect(parseWorkerTipQr("https://app.example/dashboard/user/tips/workers/123")?.source).toBe("URL");
    expect(parseWorkerTipQr(JSON.stringify({ workerId: "123" }))?.source).toBe("JSON");
    expect(parseWorkerTipQr("123")?.source).toBe("RAW");
    expect(parseWorkerTipQr("")).toBeNull();
    expect(numericWorkerId("12")).toBe(12);
    expect(numericWorkerId("worker-12")).toBe(12);
    expect(numericWorkerId("abc")).toBeNull();
  });
});
