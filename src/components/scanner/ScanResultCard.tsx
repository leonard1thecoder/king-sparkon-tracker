import { CheckCircle2, CircleDot, ScanLine } from "lucide-react";
import { StatusPill } from "@/components/ui/StatusPill";

function toneForStatus(status?: string) {
  return status === "VERIFIED" ? "confirm" : status === "SCANNING" ? "signal" : "neutral";
}

export function ScanResultCard({ barcode, status, detail }: { barcode?: string; status?: string; detail?: string }) {
  const verified = status === "VERIFIED";

  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--surface-strong)] p-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <StatusPill label={status ?? "WAITING"} tone={toneForStatus(status)} />
          <p className="code mt-4 break-all text-2xl font-black text-[var(--ink)] md:text-3xl">{barcode ?? "No barcode captured"}</p>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-[var(--radius-md)] bg-[var(--paper)] text-[var(--signal)]">
          {verified ? <CheckCircle2 className="h-6 w-6 text-[var(--confirm)]" /> : status === "SCANNING" ? <CircleDot className="h-6 w-6" /> : <ScanLine className="h-6 w-6" />}
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-[var(--steel)]">{detail ?? "Aim the scanner at a product barcode or QR code. Use manual entry when the camera cannot read the label."}</p>
    </div>
  );
}
