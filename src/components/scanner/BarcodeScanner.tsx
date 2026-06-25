"use client";

import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
import { type FormEvent, useRef, useState } from "react";
import { Keyboard, ScanLine, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ScanResultCard } from "./ScanResultCard";

type ScannerStatus = "IDLE" | "SCANNING" | "VERIFIED" | "CAMERA_NOT_READY" | "CAMERA_BLOCKED";

export function BarcodeScanner({ onScan }: { onScan?: (value: string) => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [lastScan, setLastScan] = useState<string>();
  const [status, setStatus] = useState<ScannerStatus>("IDLE");

  async function start() {
    const videoElement = videoRef.current;

    if (!videoElement) {
      setStatus("CAMERA_NOT_READY");
      return;
    }

    try {
      setStatus("SCANNING");
      const reader = new BrowserMultiFormatReader();
      controlsRef.current = await reader.decodeFromVideoDevice(undefined, videoElement, (result) => {
        const value = result?.getText();
        if (value) {
          setLastScan(value);
          setStatus("VERIFIED");
          onScan?.(value);
        }
      });
    } catch {
      setStatus("CAMERA_BLOCKED");
    }
  }

  function stop() {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setStatus("IDLE");
  }

  function submitManualBarcode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const barcode = String(formData.get("barcode") ?? "").trim();

    if (!barcode) {
      return;
    }

    setLastScan(barcode);
    setStatus("VERIFIED");
    onScan?.(barcode);
    event.currentTarget.reset();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--surface-strong)] p-4 shadow-[var(--shadow-soft)]">
        <div className="relative overflow-hidden rounded-[var(--radius-lg)] bg-[var(--ink)] scan-grid">
          <video ref={videoRef} className="aspect-video w-full object-cover opacity-85" muted playsInline />
          <div className="pointer-events-none absolute inset-6 rounded-[var(--radius-xl)] border border-white/35">
            <div className="scan-sweep absolute inset-x-0 top-0 h-1 bg-[var(--signal)] shadow-[0_0_28px_var(--signal)]" />
          </div>
          <div className="absolute left-4 top-4 rounded-full border border-white/12 bg-black/30 px-3 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-white/70">
            {status === "SCANNING" ? "Scanning live" : "Camera frame"}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Button onClick={start} className="sm:flex-1">
            <ScanLine className="h-4 w-4" /> Start scan
          </Button>
          <Button variant="quiet" onClick={stop} className="sm:flex-1">
            <StopCircle className="h-4 w-4" /> Stop
          </Button>
        </div>
      </div>

      <div className="grid gap-5">
        <ScanResultCard barcode={lastScan} status={status} />
        <form onSubmit={submitManualBarcode} className="rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--surface-strong)] p-5 shadow-[var(--shadow-soft)]">
          <div className="flex items-center gap-2 text-[var(--ink)]">
            <Keyboard className="h-4 w-4 text-[var(--signal)]" />
            <h3 className="font-black tracking-[-0.02em]">Manual barcode fallback</h3>
          </div>
          <label className="mt-4 grid gap-2 text-sm font-semibold text-[var(--steel)]">
            Barcode number
            <input
              name="barcode"
              className="h-12 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--paper)] px-4 font-mono text-sm outline-none placeholder:text-[var(--muted)] focus:border-[var(--signal)]"
              placeholder="Enter or paste barcode"
              inputMode="numeric"
            />
          </label>
          <Button type="submit" variant="secondary" className="mt-4 w-full">
            Verify manually
          </Button>
        </form>
      </div>
    </div>
  );
}
