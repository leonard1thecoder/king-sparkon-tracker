export function retryAfterSecondsFromHeader(value: string | null | undefined) {
  if (!value) {
    return undefined;
  }

  const seconds = Number(value);
  if (Number.isFinite(seconds)) {
    return seconds;
  }

  const date = Date.parse(value);
  if (!Number.isFinite(date)) {
    return undefined;
  }

  return Math.max(0, Math.ceil((date - Date.now()) / 1000));
}

export function cooldownLabel(seconds?: number) {
  if (!seconds || seconds <= 0) {
    return "Try again shortly.";
  }

  return `Try again in ${seconds} second${seconds === 1 ? "" : "s"}.`;
}
