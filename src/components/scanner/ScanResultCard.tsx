import { StatusPill } from "@/components/ui/StatusPill";

export function ScanResultCard({ barcode, status, detail }: { barcode?: string; status?: string; detail?: string }) {
  return (
    <div className="border border-[var(--line)] bg-white/45 p-5">
      <StatusPill label={status ?? "WAITING"} tone={status === "VERIFIED" ? "confirm" : "neutral"} />
      <p className="code mt-4 break-all text-2xl font-black">{barcode ?? "No scan yet"}</p>
      <p className="mt-3 text-sm leading-6 text-[var(--steel)]">{detail ?? "Aim the scanner at a product barcode or QR code."}</p>
    </div>
  );
}
