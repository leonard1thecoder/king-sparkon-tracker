// Worker tip QR parsing — port of web `parseWorkerTipQr`
// (`src/components/tips/WorkerTipQrScanner.tsx`) so mobile scans
// the same QR formats: KST-WORKER-TIP- prefix, JSON, tip URLs, raw IDs.

export type WorkerQrResult = {
  workerId: string;
  source: "URL" | "JSON" | "RAW";
  rawValue: string;
};

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function cleanWorkerId(value: string) {
  return safeDecode(value).trim().replace(/^@+/, "");
}

function readWorkerFromJson(value: string): string | null {
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    const candidates = [parsed.workerId, parsed.worker_id, parsed.tipWorkerId, parsed.id, parsed.userId];
    const nestedWorker = parsed.worker && typeof parsed.worker === "object" ? (parsed.worker as Record<string, unknown>) : null;
    if (nestedWorker) {
      candidates.push(nestedWorker.id, nestedWorker.workerId, nestedWorker.worker_id);
    }
    const match = candidates.find((candidate) => typeof candidate === "string" && (candidate as string).trim());
    return typeof match === "string" ? cleanWorkerId(match) : null;
  } catch {
    return null;
  }
}

function readWorkerFromUrl(value: string): string | null {
  try {
    const url = new URL(value, "https://tips.local");
    const pathMatch = url.pathname.match(/\/(?:dashboard\/user\/tips\/workers|tips\/workers)\/([^/?#]+)/i);
    if (pathMatch?.[1]) {
      return cleanWorkerId(pathMatch[1]);
    }
    const queryMatch =
      url.searchParams.get("workerId") ||
      url.searchParams.get("worker") ||
      url.searchParams.get("tipWorkerId") ||
      url.searchParams.get("w");
    return queryMatch ? cleanWorkerId(queryMatch) : null;
  } catch {
    return null;
  }
}

export function parseWorkerTipQr(rawValue: string): WorkerQrResult | null {
  const raw = rawValue.trim();
  if (!raw) return null;

  const prefixedValue = raw.match(/^(KST[-_:]?)?(WORKER[-_:]?TIP|TIP[-_:]?WORKER)[-_:](.+)$/i)?.[3];
  const decoded = cleanWorkerId(prefixedValue ? prefixedValue.trim() : raw);

  const jsonWorkerId = readWorkerFromJson(decoded);
  if (jsonWorkerId) return { workerId: jsonWorkerId, source: "JSON", rawValue: raw };

  const urlWorkerId = readWorkerFromUrl(decoded);
  if (urlWorkerId) return { workerId: urlWorkerId, source: "URL", rawValue: raw };

  if (/^[a-z0-9][a-z0-9._:-]{2,80}$/i.test(decoded)) {
    return { workerId: decoded, source: "RAW", rawValue: raw };
  }

  return null;
}

export function numericWorkerId(value: string): number | null {
  const direct = Number(value);
  if (Number.isSafeInteger(direct) && direct > 0) return direct;
  const match = value.match(/\d+/);
  if (!match) return null;
  const parsed = Number(match[0]);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}
