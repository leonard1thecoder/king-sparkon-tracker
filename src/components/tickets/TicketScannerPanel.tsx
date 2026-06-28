"use client";

import { useRef, useState } from "react";
import { AlertCircle, Camera, CheckCircle2, Keyboard, QrCode, ShieldCheck } from "lucide-react";
import type { TicketVerificationResult } from "@/types/tickets";
import { getTicketTypeLabel, verifyTicketByQr, verifyTicketByReference } from "@/services/ticketService";

type DecodeControls = {
  stop: () => void;
};

type ScannerReadableResult = {
  getText: () => string;
};

function resultTone(result: TicketVerificationResult | null) {
  if (!result) return "border-[var(--line)] bg-white";
  if (result.valid) return "border-[var(--confirm)]/30 bg-[var(--confirm)]/10";
  if (result.message.toLowerCase().includes("already")) return "border-[var(--gold)]/40 bg-[var(--gold)]/12";
  return "border-[var(--danger)]/25 bg-[var(--danger)]/10";
}

export function TicketScannerPanel() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<DecodeControls | null>(null);
  const [manualReference, setManualReference] = useState("");
  const [result, setResult] = useState<TicketVerificationResult | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  async function handleResult(nextResult: TicketVerificationResult) {
    setResult(nextResult);
    setIsVerifying(false);
  }

  async function verifyQrValue(qrValue: string) {
    setIsVerifying(true);
    await handleResult(await verifyTicketByQr(qrValue));
  }

  async function verifyReference() {
    if (!manualReference.trim()) {
      setResult({ valid: false, message: "Enter a ticket reference first." });
      return;
    }
    setIsVerifying(true);
    await handleResult(await verifyTicketByReference(manualReference));
  }

  async function startCamera() {
    setCameraError(null);
    setResult(null);

    if (!videoRef.current) return;

    try {
      const { BrowserQRCodeReader } = await import("@zxing/browser");
      const reader = new BrowserQRCodeReader();
      setCameraActive(true);
      controlsRef.current = await reader.decodeFromVideoDevice(undefined, videoRef.current, (scanResult: ScannerReadableResult | undefined) => {
        if (!scanResult) return;
        controlsRef.current?.stop();
        setCameraActive(false);
        void verifyQrValue(scanResult.getText());
      });
    } catch {
      setCameraActive(false);
      setCameraError("Camera scanner could not start. Use the manual ticket reference fallback.");
    }
  }

  function stopCamera() {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setCameraActive(false);
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <div className="overflow-hidden rounded-[2.25rem] border border-[var(--line)] bg-white shadow-[var(--shadow-ledger)]">
        <div className="bg-[var(--ink)] p-5 text-white md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[var(--gold)]">Gate verification camera</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.05em]">Scan user ticket QR codes</h2>
              <p className="mt-3 text-sm leading-7 text-white/62">Uses the existing QR scanner dependency and falls back to manual references when the device camera is unavailable.</p>
            </div>
            <div className="grid h-13 w-13 shrink-0 place-items-center rounded-[1.25rem] bg-white/10 text-[var(--gold)]"><QrCode className="h-6 w-6" /></div>
          </div>
          <div className="barcode-rule mt-6 text-white" />
        </div>

        <div className="p-5 md:p-6">
          <div className="relative overflow-hidden rounded-[1.8rem] border border-[var(--line)] bg-[var(--ink)] shadow-[var(--shadow-soft)]">
            <video ref={videoRef} className="aspect-video w-full bg-[var(--ink)] object-cover" muted playsInline aria-label="Ticket QR camera preview" />
            <div className="pointer-events-none absolute inset-0 scan-grid" />
            <div className="pointer-events-none absolute left-8 right-8 top-1/2 h-0.5 bg-[var(--signal)] shadow-[0_0_28px_rgba(242,100,42,0.8)]" />
            <div className="absolute bottom-4 left-4 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-white/78 backdrop-blur">
              {cameraActive ? "Camera active" : "Camera standby"}
            </div>
          </div>

          {cameraError ? <p className="mt-4 rounded-[1.2rem] border border-[var(--danger)]/20 bg-[var(--danger)]/10 px-4 py-3 text-sm font-bold text-[var(--danger)]">{cameraError}</p> : null}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={startCamera} disabled={cameraActive || isVerifying} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ember)]">
              <Camera className="h-4 w-4" /> Start camera scan
            </button>
            <button type="button" onClick={stopCamera} disabled={!cameraActive} className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full border border-[var(--line)] bg-white px-5 text-sm font-black text-[var(--ink)] shadow-[var(--shadow-soft)] hover:border-[var(--signal)]">
              Stop camera
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="rounded-[2rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)] md:p-6">
          <div className="flex gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-[1.15rem] bg-[var(--surface)] text-[var(--signal)]"><Keyboard className="h-5 w-5" /></div>
            <div>
              <h2 className="text-2xl font-black tracking-[-0.04em]">Manual fallback</h2>
              <p className="mt-1 text-sm leading-6 text-[var(--steel)]">Use this when a printed QR is damaged or the camera cannot focus.</p>
            </div>
          </div>
          <label className="mt-5 grid gap-2">
            <span className="text-sm font-black text-[var(--ink)]">Ticket reference</span>
            <input value={manualReference} onChange={(event) => setManualReference(event.target.value)} placeholder="Example: KST-EVENT-DEMO-001" className="min-h-13 rounded-[1.35rem] border border-[var(--line)] bg-white px-4 text-sm font-bold outline-none placeholder:text-[var(--muted)] focus:border-[var(--signal)] focus:shadow-[var(--focus-ring)]" />
          </label>
          <button type="button" onClick={verifyReference} disabled={isVerifying} className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ember)]">
            <ShieldCheck className="h-4 w-4" /> {isVerifying ? "Verifying..." : "Verify Ticket"}
          </button>
        </div>

        <div className={`rounded-[2rem] border p-5 shadow-[var(--shadow-soft)] md:p-6 ${resultTone(result)}`}>
          <div className="flex gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[1.15rem] bg-white text-[var(--signal)] shadow-[var(--shadow-soft)]">
              {result?.valid ? <CheckCircle2 className="h-5 w-5 text-[var(--confirm)]" /> : <AlertCircle className="h-5 w-5" />}
            </div>
            <div>
              <p className="font-mono text-[0.68rem] font-black uppercase tracking-[0.16em] text-[var(--muted)]">Scan result</p>
              <h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">{result?.message ?? "Waiting for scan"}</h2>
            </div>
          </div>

          {result?.ticket && result.event ? (
            <dl className="mt-5 grid gap-3 text-sm font-semibold text-[var(--steel)]">
              <div className="rounded-[1.15rem] border border-[var(--line)] bg-white p-3"><dt className="text-[0.65rem] uppercase tracking-[0.12em] text-[var(--muted)]">Event</dt><dd className="mt-1 font-black text-[var(--ink)]">{result.event.name}</dd></div>
              <div className="rounded-[1.15rem] border border-[var(--line)] bg-white p-3"><dt className="text-[0.65rem] uppercase tracking-[0.12em] text-[var(--muted)]">User</dt><dd className="mt-1 font-black text-[var(--ink)]">{result.ticket.buyerName}</dd></div>
              <div className="rounded-[1.15rem] border border-[var(--line)] bg-white p-3"><dt className="text-[0.65rem] uppercase tracking-[0.12em] text-[var(--muted)]">Ticket class</dt><dd className="mt-1 font-black text-[var(--ink)]">{getTicketTypeLabel(result.ticket.ticketType)}</dd></div>
              <div className="rounded-[1.15rem] border border-[var(--line)] bg-white p-3"><dt className="text-[0.65rem] uppercase tracking-[0.12em] text-[var(--muted)]">Reference</dt><dd className="code mt-1 font-black text-[var(--ink)]">{result.ticket.ticketReference}</dd></div>
            </dl>
          ) : (
            <p className="mt-5 text-sm font-semibold leading-7 text-[var(--steel)]">Scan a QR code or enter a ticket reference to verify entry status.</p>
          )}
        </div>
      </div>
    </section>
  );
}
