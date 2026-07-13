"use client";

import { useRef, useState } from "react";
import { AlertCircle, Camera, CheckCircle2, ImageOff, Keyboard, QrCode, ShieldCheck, UserCheck, UserX } from "lucide-react";
import type { FaceVerificationDecision, TicketVerificationResult } from "@/types/tickets";
import { getTicketTypeLabel } from "@/services/ticketService";
import { verifyWorkerTicketByQr, verifyWorkerTicketByReference } from "@/services/ticketVerificationService";

type DecodeControls = {
  stop: () => void;
};

type ScannerReadableResult = {
  getText: () => string;
};

type ScanContext = {
  mode: "QR" | "REFERENCE";
  value: string;
};

function resultTone(result: TicketVerificationResult | null) {
  if (!result) return "border-[var(--line)] bg-white";
  if (result.valid) return "border-[var(--confirm)]/30 bg-[var(--confirm)]/10";
  if (result.requiresFaceConfirmation) return "border-[var(--gold)] bg-[var(--gold)]/12";
  if (result.message.toLowerCase().includes("already")) return "border-[var(--gold)]/40 bg-[var(--gold)]/12";
  return "border-[var(--danger)]/25 bg-[var(--danger)]/10";
}

export function TicketScannerPanel() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<DecodeControls | null>(null);
  const [manualReference, setManualReference] = useState("");
  const [result, setResult] = useState<TicketVerificationResult | null>(null);
  const [scanContext, setScanContext] = useState<ScanContext | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  async function runVerification(context: ScanContext, faceDecision: FaceVerificationDecision = "PENDING") {
    setIsVerifying(true);
    setCameraError(null);
    try {
      const nextResult = context.mode === "QR"
        ? await verifyWorkerTicketByQr(context.value, faceDecision)
        : await verifyWorkerTicketByReference(context.value, faceDecision);
      setResult(nextResult);
      setScanContext(nextResult.requiresFaceConfirmation ? context : null);
    } finally {
      setIsVerifying(false);
    }
  }

  async function verifyQrValue(qrValue: string) {
    const context: ScanContext = { mode: "QR", value: qrValue.trim() };
    if (!context.value) {
      setResult({ valid: false, message: "Scan a ticket QR code first." });
      return;
    }
    await runVerification(context);
  }

  async function verifyReference() {
    const value = manualReference.trim();
    if (!value) {
      setResult({ valid: false, message: "Enter a ticket reference first." });
      return;
    }
    await runVerification({ mode: "REFERENCE", value });
  }

  async function decideFace(faceDecision: Extract<FaceVerificationDecision, "MATCH" | "NO_MATCH">) {
    if (!scanContext) return;
    await runVerification(scanContext, faceDecision);
  }

  async function startCamera() {
    setCameraError(null);
    setResult(null);
    setScanContext(null);

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

  const verificationPhotoUrl = result?.verificationPhotoUrl ?? result?.ticket?.verificationPhotoUrl;

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <div className="overflow-hidden rounded-[2.25rem] border border-[var(--line)] bg-white shadow-[var(--shadow-ledger)]">
        <div className="bg-[var(--ink)] p-5 text-white md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[var(--gold)]">Gate verification camera</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.05em]">Scan first, verify the person second</h2>
              <p className="mt-3 text-sm leading-7 text-white/62">A scan only loads the ticket and owner photo. The ticket becomes USED only after a worker manually confirms the person matches.</p>
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
            <button type="button" onClick={startCamera} disabled={cameraActive || isVerifying} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ember)] disabled:opacity-50">
              <Camera className="h-4 w-4" /> Start camera scan
            </button>
            <button type="button" onClick={stopCamera} disabled={!cameraActive} className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full border border-[var(--line)] bg-white px-5 text-sm font-black text-[var(--ink)] shadow-[var(--shadow-soft)] hover:border-[var(--signal)] disabled:opacity-40">
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
              <h2 className="text-2xl font-black tracking-[-0.04em]">Manual reference fallback</h2>
              <p className="mt-1 text-sm leading-6 text-[var(--steel)]">Use this when the QR is damaged. It follows the same photo comparison and worker decision.</p>
            </div>
          </div>
          <label className="mt-5 grid gap-2">
            <span className="text-sm font-black text-[var(--ink)]">Ticket reference</span>
            <input value={manualReference} onChange={(event) => setManualReference(event.target.value)} placeholder="Example: KST-EVENT-DEMO-001" className="min-h-13 rounded-[1.35rem] border border-[var(--line)] bg-white px-4 text-sm font-bold outline-none placeholder:text-[var(--muted)] focus:border-[var(--signal)] focus:shadow-[var(--focus-ring)]" />
          </label>
          <button type="button" onClick={verifyReference} disabled={isVerifying} className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ember)] disabled:opacity-50">
            <ShieldCheck className="h-4 w-4" /> {isVerifying ? "Checking..." : "Load ticket for face check"}
          </button>
        </div>

        <div className={`rounded-[2rem] border p-5 shadow-[var(--shadow-soft)] md:p-6 ${resultTone(result)}`}>
          <div className="flex gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[1.15rem] bg-white text-[var(--signal)] shadow-[var(--shadow-soft)]">
              {result?.valid ? <CheckCircle2 className="h-5 w-5 text-[var(--confirm)]" /> : result?.requiresFaceConfirmation ? <UserCheck className="h-5 w-5 text-[var(--ink)]" /> : <AlertCircle className="h-5 w-5" />}
            </div>
            <div>
              <p className="font-mono text-[0.68rem] font-black uppercase tracking-[0.16em] text-[var(--muted)]">Gate result</p>
              <h2 className="mt-1 text-2xl font-black tracking-[-0.04em]">{result?.message ?? "Waiting for scan"}</h2>
            </div>
          </div>

          {result?.ticket && result.event ? (
            <div className="mt-5 grid gap-4">
              {result.requiresFaceConfirmation ? (
                <div className="rounded-[1.5rem] border border-[var(--gold)] bg-white p-4">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">Stored ticket-owner photo</p>
                  {verificationPhotoUrl ? (
                    <img src={verificationPhotoUrl} alt={`${result.ticket.buyerName} verification`} className="mt-3 aspect-square max-h-[24rem] w-full rounded-[1.3rem] border border-[var(--line)] object-cover" />
                  ) : (
                    <div className="mt-3 grid aspect-square max-h-[24rem] place-items-center rounded-[1.3rem] border border-dashed border-[var(--line)] bg-[var(--surface)]"><ImageOff className="h-10 w-10 text-[var(--muted)]" /></div>
                  )}
                  <p className="mt-3 text-sm font-semibold leading-6 text-[var(--steel)]">Look at the person standing in front of you and compare them manually with this image. Do not approve based only on the QR.</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <button type="button" onClick={() => decideFace("MATCH")} disabled={isVerifying} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--confirm)] bg-[var(--confirm)] px-5 text-sm font-black text-white disabled:opacity-50"><UserCheck className="h-4 w-4" /> {isVerifying ? "Saving..." : "Face matches — admit"}</button>
                    <button type="button" onClick={() => decideFace("NO_MATCH")} disabled={isVerifying} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--danger)] bg-white px-5 text-sm font-black text-[var(--danger)] disabled:opacity-50"><UserX className="h-4 w-4" /> Face does not match</button>
                  </div>
                </div>
              ) : null}

              <dl className="grid gap-3 text-sm font-semibold text-[var(--steel)] sm:grid-cols-2">
                <div className="rounded-[1.15rem] border border-[var(--line)] bg-white p-3"><dt className="text-[0.65rem] uppercase tracking-[0.12em] text-[var(--muted)]">Event</dt><dd className="mt-1 font-black text-[var(--ink)]">{result.event.name}</dd></div>
                <div className="rounded-[1.15rem] border border-[var(--line)] bg-white p-3"><dt className="text-[0.65rem] uppercase tracking-[0.12em] text-[var(--muted)]">Current owner</dt><dd className="mt-1 font-black text-[var(--ink)]">{result.ticket.buyerName}</dd></div>
                <div className="rounded-[1.15rem] border border-[var(--line)] bg-white p-3"><dt className="text-[0.65rem] uppercase tracking-[0.12em] text-[var(--muted)]">Ticket class</dt><dd className="mt-1 font-black text-[var(--ink)]">{getTicketTypeLabel(result.ticket.ticketType)}</dd></div>
                <div className="rounded-[1.15rem] border border-[var(--line)] bg-white p-3"><dt className="text-[0.65rem] uppercase tracking-[0.12em] text-[var(--muted)]">Reference</dt><dd className="code mt-1 font-black text-[var(--ink)]">{result.ticket.ticketReference}</dd></div>
              </dl>
            </div>
          ) : (
            <p className="mt-5 text-sm font-semibold leading-7 text-[var(--steel)]">Scan a QR code or enter a ticket reference. Guests must not enter when the secure verification service is unavailable.</p>
          )}
        </div>
      </div>
    </section>
  );
}
