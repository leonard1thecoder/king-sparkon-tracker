"use client";

import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { Barcode, Camera, CheckCircle2, ImageUp, Loader2, ScanLine, ShieldCheck, XCircle } from "lucide-react";

type BarcodeMatchType = "PRODUCT_BARCODE" | "STOCK_UNIT" | "NOT_FOUND";

type BarcodeVerificationResponse = {
  input: string;
  normalizedValue: string;
  decoder: string;
  matchType: BarcodeMatchType;
  status: string;
  productId: number | null;
  productName: string | null;
  productBarcode: string | null;
  stockQuantity: number | null;
  unitCode: string | null;
  availabilityStatus: string | null;
  claimStatus: string | null;
  message: string;
  aiExplanation: string;
};

type ScannerControls = {
  stop: () => void;
};

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");

function tokenFromStorage() {
  if (typeof window === "undefined") {
    return "";
  }

  return (
    window.localStorage.getItem("king-sparkon-token") ??
    window.localStorage.getItem("accessToken") ??
    window.localStorage.getItem("token") ??
    window.localStorage.getItem("jwt") ??
    ""
  );
}

export function AiBarcodeVerify() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerControlsRef = useRef<ScannerControls | null>(null);
  const [authToken, setAuthToken] = useState("");
  const [manualValue, setManualValue] = useState("");
  const [result, setResult] = useState<BarcodeVerificationResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setAuthToken(tokenFromStorage());

    return () => {
      scannerControlsRef.current?.stop();
    };
  }, []);

  const authHeaders = (): Record<string, string> => {
    const token = authToken.trim();

    if (!token) {
      return {};
    }

    return { Authorization: `Bearer ${token}` };
  };

  const verifyValue = async (value: string, decoder = "MANUAL") => {
    const normalizedValue = value.trim();
    if (!normalizedValue) {
      setErrorMessage("Barcode or stock unit code is required.");
      return;
    }

    setErrorMessage("");
    setIsVerifying(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/barcodes/verify/${encodeURIComponent(normalizedValue)}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...authHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error(`Verification failed with status ${response.status}`);
      }

      const data = (await response.json()) as BarcodeVerificationResponse;
      setResult({ ...data, decoder: data.decoder || decoder });
    } catch (error) {
      console.error("Barcode verification failed", error);
      setErrorMessage("Unable to verify barcode. Make sure you are logged in and the backend is running.");
    } finally {
      setIsVerifying(false);
    }
  };

  const startCameraScan = async () => {
    setErrorMessage("");
    setResult(null);
    setIsScanning(true);

    try {
      const videoElement = videoRef.current;
      if (!videoElement) {
        throw new Error("Video element is not ready");
      }

      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const reader = new BrowserMultiFormatReader();
      const controls = await reader.decodeFromVideoDevice(undefined, videoElement, (scanResult, scanError, activeControls) => {
        void scanError;

        if (!scanResult) {
          return;
        }

        const scannedValue = scanResult.getText();
        activeControls.stop();
        scannerControlsRef.current = null;
        setIsScanning(false);
        setManualValue(scannedValue);
        void verifyValue(scannedValue, "BROWSER_ZXING");
      });

      scannerControlsRef.current = controls;
    } catch (error) {
      console.error("Camera barcode scan failed", error);
      setIsScanning(false);
      setErrorMessage("Camera scan failed. Use image upload or type the barcode manually.");
    }
  };

  const stopCameraScan = () => {
    scannerControlsRef.current?.stop();
    scannerControlsRef.current = null;
    setIsScanning(false);
  };

  const verifyImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setErrorMessage("");
    setResult(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${apiBaseUrl}/api/barcodes/images/verify`, {
        method: "POST",
        headers: {
          ...authHeaders(),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Image verification failed with status ${response.status}`);
      }

      const data = (await response.json()) as BarcodeVerificationResponse;
      setManualValue(data.normalizedValue ?? data.input ?? "");
      setResult(data);
    } catch (error) {
      console.error("Image barcode verification failed", error);
      setErrorMessage("Could not decode or verify this image. Retake the picture straight, closer, and with better light.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const statusTone = result?.matchType === "NOT_FOUND" ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-white/70 bg-[var(--ink)] p-6 text-white shadow-[0_34px_120px_rgba(7,19,31,0.24)] sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-xs font-black uppercase tracking-[0.28em] text-[var(--gold)]">AI Barcode Verify</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-[-0.06em] sm:text-5xl">
              Take a picture, extract the barcode, and verify stored data.
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-white/62 sm:text-base">
              Browser scan first, backend image decode second, then King Sparkon AI explains whether it matched a reusable product barcode or a unique stock unit code.
            </p>
          </div>
          <div className="grid rounded-3xl border border-white/10 bg-white/10 p-4 text-sm font-bold text-white/72">
            <span>Product barcode = reusable</span>
            <span>Unit code = unique item</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-soft)] sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-xs font-black uppercase tracking-[0.22em] text-[var(--signal)]">Camera</p>
              <h2 className="mt-1 text-2xl font-black tracking-[-0.05em] text-[var(--ink)]">Live scanner</h2>
            </div>
            <ScanLine className="h-7 w-7 text-[var(--gold)]" />
          </div>

          <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)]">
            <video ref={videoRef} className="aspect-video w-full object-cover" muted playsInline />
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => void startCameraScan()}
              disabled={isScanning || isVerifying}
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[var(--gold)] px-5 text-sm font-black text-[var(--ink)] shadow-[var(--shadow-soft)] disabled:opacity-60"
            >
              {isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              {isScanning ? "Scanning..." : "Open camera scan"}
            </button>
            <button
              type="button"
              onClick={stopCameraScan}
              disabled={!isScanning}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--line-strong)] bg-white px-5 text-sm font-black text-[var(--ink)] disabled:opacity-50"
            >
              Stop camera
            </button>
          </div>
        </div>

        <div className="rounded-[2rem] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-soft)] sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-xs font-black uppercase tracking-[0.22em] text-[var(--signal)]">Fallback</p>
              <h2 className="mt-1 text-2xl font-black tracking-[-0.05em] text-[var(--ink)]">Upload or type</h2>
            </div>
            <Barcode className="h-7 w-7 text-[var(--ember)]" />
          </div>

          <label className="mt-5 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-[var(--line-strong)] bg-[var(--surface)] px-4 text-center hover:border-[var(--gold)]">
            <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={(event) => void verifyImage(event)} />
            {isUploading ? <Loader2 className="h-7 w-7 animate-spin text-[var(--gold)]" /> : <ImageUp className="h-7 w-7 text-[var(--signal)]" />}
            <span className="mt-3 text-sm font-black text-[var(--ink)]">Upload barcode picture</span>
            <span className="mt-1 text-xs font-semibold text-[var(--muted)]">PNG/JPG up to 5MB</span>
          </label>

          <div className="mt-5 space-y-2">
            <label className="text-xs font-black uppercase tracking-[0.18em] text-[var(--steel)]">Manual barcode / unit code</label>
            <div className="flex gap-2 rounded-full border border-[var(--line-strong)] bg-white p-1.5 shadow-[var(--shadow-soft)]">
              <input
                value={manualValue}
                onChange={(event) => setManualValue(event.target.value)}
                placeholder="5449000000996 or KST-UNIT-000001"
                className="min-h-10 flex-1 rounded-full border-0 bg-transparent px-4 text-sm font-bold text-[var(--ink)] outline-none placeholder:text-[var(--muted)]"
              />
              <button
                type="button"
                onClick={() => void verifyValue(manualValue)}
                disabled={isVerifying || !manualValue.trim()}
                className="inline-flex min-h-10 items-center justify-center rounded-full bg-[var(--ink)] px-4 text-sm font-black text-white disabled:opacity-60"
              >
                {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
              </button>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <label className="text-xs font-black uppercase tracking-[0.18em] text-[var(--steel)]">Bearer token</label>
            <input
              value={authToken}
              onChange={(event) => setAuthToken(event.target.value)}
              placeholder="Paste JWT token if the app has not stored it"
              className="min-h-11 w-full rounded-full border border-[var(--line-strong)] bg-white px-4 text-sm font-semibold text-[var(--ink)] outline-none placeholder:text-[var(--muted)]"
            />
          </div>
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <div className={`rounded-[2rem] border p-5 shadow-[var(--shadow-soft)] ${statusTone}`}>
          <div className="flex items-start gap-3">
            {result.matchType === "NOT_FOUND" ? <XCircle className="mt-1 h-6 w-6" /> : <CheckCircle2 className="mt-1 h-6 w-6" />}
            <div className="min-w-0 flex-1">
              <p className="font-mono text-xs font-black uppercase tracking-[0.2em]">{result.matchType}</p>
              <h3 className="mt-1 text-2xl font-black tracking-[-0.04em]">{result.message}</h3>
              <p className="mt-3 text-sm font-bold leading-6">{result.aiExplanation}</p>

              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl bg-white/70 p-3">
                  <dt className="text-xs font-black uppercase tracking-[0.16em] opacity-70">Value</dt>
                  <dd className="mt-1 break-all font-black">{result.normalizedValue}</dd>
                </div>
                <div className="rounded-2xl bg-white/70 p-3">
                  <dt className="text-xs font-black uppercase tracking-[0.16em] opacity-70">Product</dt>
                  <dd className="mt-1 font-black">{result.productName ?? "Not linked"}</dd>
                </div>
                <div className="rounded-2xl bg-white/70 p-3">
                  <dt className="text-xs font-black uppercase tracking-[0.16em] opacity-70">Stock</dt>
                  <dd className="mt-1 font-black">{result.stockQuantity ?? "—"}</dd>
                </div>
                <div className="rounded-2xl bg-white/70 p-3">
                  <dt className="text-xs font-black uppercase tracking-[0.16em] opacity-70">Unit status</dt>
                  <dd className="mt-1 font-black">{result.availabilityStatus ?? "Reusable barcode"}</dd>
                </div>
              </dl>
            </div>
            <ShieldCheck className="hidden h-8 w-8 sm:block" />
          </div>
        </div>
      ) : null}
    </section>
  );
}
