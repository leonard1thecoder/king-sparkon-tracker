import { StatusPill } from "./StatusPill";

export function Toast({ message, tone = "neutral" }: { message: string; tone?: "neutral" | "signal" | "confirm" | "warning" }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm border border-[var(--line)] bg-[var(--paper)] p-4 shadow-[var(--shadow-ledger)]">
      <StatusPill label={tone === "confirm" ? "OK" : tone === "signal" ? "ACTION" : "NOTICE"} tone={tone} />
      <p className="mt-3 text-sm leading-6 text-[var(--steel)]">{message}</p>
    </div>
  );
}
