"use client";

import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ScanResultCard } from "./ScanResultCard";

export function BarcodeScanner({ onScan }: { onScan?: (value: string) => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [lastScan, setLastScan] = useState<string>();
  const [status, setStatus] = useState("IDLE");

  async function start() {
    setStatus("SCANNING");
    const reader = new BrowserMultiFormatReader();
    controlsRef.current = await reader.decodeFromVideoDevice(undefined, videoRef.current, (result) => {
      const value = result?.getText();
      if (value) {
        setLastScan(value);
        setStatus("VERIFIED");
        onScan?.(value);
      }
    });
  }

  function stop() {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setStatus("IDLE");
  }

  return (
    <div className="grid gap-4">
      <video ref={videoRef} className="aspect-video w-full border border-[var(--line)] bg-[var(--ink)]" muted playsInline />
      <div className="flex gap-3">
        <Button onClick={start}>Start scan</Button>
        <Button variant="quiet" onClick={stop}>Stop</Button>
      </div>
      <ScanResultCard barcode={lastScan} status={status} />
    </div>
  );
}
