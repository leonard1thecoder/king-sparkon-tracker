/**
 * PayFast redirect-flow helpers.
 *
 * The browser never computes amounts, never decides success, and never sees
 * the merchant passphrase. It only POSTs server-signed fields to PayFast and
 * polls the backend for the authoritative payment status.
 */

export type PayFastFields = Record<string, string>;

export type PayFastReturnState = {
  merchantPaymentId: string | null;
  cancelled: boolean;
};

const TERMINAL_STATUSES = ["COMPLETE", "FAILED", "CANCELLED"] as const;

export function parsePayFastReturn(search: string): PayFastReturnState {
  const params = new URLSearchParams(search.startsWith("?") ? search : `?${search}`);
  const merchantPaymentId = params.get("m_payment_id")?.trim() || null;
  const cancelled =
    params.get("cancelled") === "1" ||
    params.get("cancel") === "1" ||
    params.get("status")?.toLowerCase() === "cancelled";
  return { merchantPaymentId, cancelled };
}

export function isTerminalPayFastStatus(status: string | null | undefined): boolean {
  if (!status) return false;
  return (TERMINAL_STATUSES as readonly string[]).includes(status.toUpperCase());
}

export function isFailedPayFastStatus(status: string | null | undefined): boolean {
  if (!status) return false;
  const normalized = status.toUpperCase();
  return normalized === "FAILED" || normalized === "CANCELLED";
}

export function validatePayFastForm(processUrl: string, fields: PayFastFields | null | undefined): string | null {
  if (!processUrl || !processUrl.startsWith("https://")) {
    return "The PayFast checkout URL is missing or invalid.";
  }
  if (!fields || typeof fields !== "object" || !fields.m_payment_id || !fields.signature || !fields.amount) {
    return "The PayFast payment fields are incomplete.";
  }
  return null;
}

/**
 * Builds and submits the hidden PayFast form. Redirects the customer away
 * from the app to PayFast. Must only be called with server-issued fields.
 */
export function submitPayFastForm(processUrl: string, fields: PayFastFields): void {
  const problem = validatePayFastForm(processUrl, fields);
  if (problem) {
    throw new Error(problem);
  }

  const form = document.createElement("form");
  form.method = "POST";
  form.action = processUrl;
  form.style.display = "none";

  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
}

export type PayFastStatusSnapshot = {
  merchantPaymentId: string;
  paymentStatus: string;
  fulfilled: boolean;
  message?: string | null;
};

export class PayFastPendingTimeoutError extends Error {
  readonly merchantPaymentId: string;

  constructor(merchantPaymentId: string, attempts: number) {
    super(
      `The payment is still being confirmed after ${attempts} checks. Keep this page open and refresh shortly; nothing has been cleared or charged twice.`,
    );
    this.name = "PayFastPendingTimeoutError";
    this.merchantPaymentId = merchantPaymentId;
  }
}

/**
 * Polls the backend for the authoritative payment status until it turns
 * terminal. Throws on FAILED/CANCELLED so callers keep local state (the
 * cart is only cleared on COMPLETE).
 */
export async function pollPayFastStatus(
  fetchStatus: (merchantPaymentId: string) => Promise<PayFastStatusSnapshot>,
  merchantPaymentId: string,
  options: { attempts?: number; intervalMs?: number; sleep?: (ms: number) => Promise<void> } = {},
): Promise<PayFastStatusSnapshot> {
  const attempts = options.attempts ?? 45;
  const intervalMs = options.intervalMs ?? 1000;
  const sleep = options.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));

  let latest: PayFastStatusSnapshot | null = null;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    latest = await fetchStatus(merchantPaymentId);

    if (latest.fulfilled && latest.paymentStatus.toUpperCase() === "COMPLETE") {
      return latest;
    }

    if (isFailedPayFastStatus(latest.paymentStatus)) {
      throw new Error(
        `PayFast reported the payment as ${latest.paymentStatus}. Nothing has been cleared.${latest.message ? ` ${latest.message}` : ""}`,
      );
    }

    if (attempt < attempts - 1) {
      await sleep(intervalMs);
    }
  }

  throw new PayFastPendingTimeoutError(merchantPaymentId, attempts);
}
