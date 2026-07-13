"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, Copy, Download, LockKeyhole, QrCode, Share2, Upload, UserCheck, X } from "lucide-react";
import type { UserTicket } from "@/types/tickets";
import { getTicketTypeLabel } from "@/services/ticketService";
import { TicketStatusBadge } from "./TicketStatusBadge";

type TicketQrCardProps = {
  ticket: UserTicket;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  isMock?: boolean;
  onCapturePhoto?: (file: File) => Promise<void>;
  onShare?: (username: string) => Promise<void>;
};

function formatDate(eventDate: string) {
  return new Intl.DateTimeFormat("en-ZA", { dateStyle: "medium" }).format(new Date(`${eventDate}T00:00`));
}

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

export function TicketQrCard({
  ticket,
  eventName,
  eventDate,
  eventLocation,
  isMock = false,
  onCapturePhoto,
  onShare,
}: TicketQrCardProps) {
  const [copied, setCopied] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUsername, setShareUsername] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const active = ticket.status === "ACTIVE";
  const hasPhoto = Boolean(ticket.verificationPhotoUrl);
  const canShare = active && ticket.canShare !== false;
  const canChangePhoto = active && ticket.canChangeVerificationPhoto !== false;

  useEffect(() => () => stopStream(streamRef.current), []);

  async function copyReference() {
    await navigator.clipboard.writeText(ticket.ticketReference);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  async function startCamera() {
    setError(null);
    setMessage(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Camera access is unavailable in this browser. Choose a photo file instead.");
      fileInputRef.current?.click();
      return;
    }

    try {
      stopStream(streamRef.current);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 900 }, height: { ideal: 900 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
      window.setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
      }, 0);
    } catch {
      setError("Camera permission was not granted. Choose a clear front-facing photo instead.");
    }
  }

  function closeCamera() {
    stopStream(streamRef.current);
    streamRef.current = null;
    setCameraOpen(false);
  }

  async function savePhoto(file: File) {
    if (!onCapturePhoto || !canChangePhoto) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await onCapturePhoto(file);
      setMessage("Verification photo saved. A worker must compare this photo manually at the gate.");
      closeCamera();
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : "Verification photo could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  async function captureFrame() {
    const video = videoRef.current;
    if (!video || video.videoWidth <= 0 || video.videoHeight <= 0) {
      setError("The camera is still starting. Try again when your face is visible.");
      return;
    }

    const canvas = document.createElement("canvas");
    const side = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = 720;
    canvas.height = 720;
    const context = canvas.getContext("2d");
    if (!context) {
      setError("The verification photo could not be prepared.");
      return;
    }

    const sourceX = Math.max((video.videoWidth - side) / 2, 0);
    const sourceY = Math.max((video.videoHeight - side) / 2, 0);
    context.drawImage(video, sourceX, sourceY, side, side, 0, 0, 720, 720);
    canvas.toBlob((blob) => {
      if (!blob) {
        setError("The verification photo could not be captured.");
        return;
      }
      void savePhoto(new File([blob], `ticket-${ticket.id}-verification.jpg`, { type: "image/jpeg" }));
    }, "image/jpeg", 0.9);
  }

  async function submitShare() {
    const username = shareUsername.trim();
    if (!username) {
      setError("Enter the recipient username.");
      return;
    }
    if (!onShare || !canShare) return;

    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await onShare(username);
      setMessage(`Ticket shared with ${username}. The previous QR and verification photo are no longer valid.`);
      setShareOpen(false);
      setShareUsername("");
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : "Ticket could not be shared.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="relative grid gap-5 rounded-[2rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)] lg:grid-cols-[240px_1fr]">
      <div className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface)] p-4">
        <div className="grid aspect-square place-items-center rounded-[1.3rem] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-soft)]">
          <div className="relative grid h-full w-full grid-cols-5 grid-rows-5 gap-1 rounded-[1rem] bg-white p-2">
            {Array.from({ length: 25 }).map((_, index) => (
              <span key={index} className={`rounded-[0.22rem] ${index % 2 === 0 || index % 7 === 0 || index === 18 ? "bg-[var(--ink)]" : "bg-[var(--gold)]/28"}`} />
            ))}
            <div className="absolute left-1/2 top-1/2 grid h-24 w-24 -translate-x-1/2 -translate-y-1/2 place-items-center overflow-hidden rounded-full border-4 border-white bg-white shadow-[0_8px_24px_rgba(7,19,31,0.28)]">
              {ticket.verificationPhotoUrl ? (
                <img src={ticket.verificationPhotoUrl} alt={`${ticket.buyerName} ticket verification`} className="h-full w-full object-cover" />
              ) : (
                <QrCode className="h-10 w-10 text-[var(--signal)]" />
              )}
            </div>
          </div>
        </div>

        <p className="mt-3 break-all text-center font-mono text-[0.62rem] font-bold leading-5 text-[var(--muted)]">Ticket QR · ownership v{ticket.ownershipVersion ?? 1}</p>

        {canChangePhoto ? (
          <div className="mt-3 grid gap-2">
            <button type="button" onClick={startCamera} disabled={busy} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-4 text-xs font-black uppercase tracking-[0.08em] text-white hover:bg-[var(--ink)] disabled:opacity-50">
              <Camera className="h-4 w-4" /> {hasPhoto ? "Retake verification photo" : "Take verification photo"}
            </button>
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={busy} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 text-xs font-black text-[var(--ink)] hover:border-[var(--gold)] disabled:opacity-50">
              <Upload className="h-4 w-4" /> Choose photo
            </button>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void savePhoto(file);
            }} />
          </div>
        ) : (
          <div className="mt-3 flex items-center justify-center gap-2 rounded-[1rem] border border-[var(--line)] bg-white p-3 text-xs font-black text-[var(--steel)]">
            <LockKeyhole className="h-4 w-4" /> Verification photo locked
          </div>
        )}
      </div>

      <div className="flex flex-col justify-between gap-5">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-mono text-[0.68rem] font-black uppercase tracking-[0.16em] text-[var(--signal)]">{getTicketTypeLabel(ticket.ticketType)} Ticket</p>
                {isMock ? <span className="rounded-full border border-[var(--gold)] bg-[var(--gold)]/20 px-2.5 py-1 text-[0.6rem] font-black uppercase tracking-[0.1em] text-[var(--ink)]">Demo</span> : null}
                {hasPhoto ? <span className="inline-flex items-center gap-1 rounded-full border border-[var(--confirm)]/30 bg-[var(--confirm)]/10 px-2.5 py-1 text-[0.6rem] font-black uppercase tracking-[0.1em] text-[var(--confirm)]"><UserCheck className="h-3 w-3" /> Photo ready</span> : null}
              </div>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[var(--ink)]">{eventName}</h2>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <TicketStatusBadge status={ticket.status} />
              {canShare ? (
                <button type="button" onClick={() => setShareOpen((current) => !current)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-white px-4 text-xs font-black uppercase tracking-[0.08em] text-[var(--signal)] hover:bg-[var(--signal)] hover:text-white">
                  <Share2 className="h-4 w-4" /> Share ticket
                </button>
              ) : (
                <span className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-xs font-black uppercase tracking-[0.08em] text-[var(--steel)]"><LockKeyhole className="h-4 w-4" /> Locked</span>
              )}
            </div>
          </div>

          {shareOpen && canShare ? (
            <div className="mt-5 rounded-[1.3rem] border border-[var(--signal)]/25 bg-[var(--signal)]/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-[var(--ink)]">Share using a username</p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-[var(--steel)]">Ownership moves to the recipient. Your QR and photo are invalidated, and the recipient must take a new verification photo.</p>
                </div>
                <button type="button" onClick={() => setShareOpen(false)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--line)] bg-white"><X className="h-4 w-4" /></button>
              </div>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <input value={shareUsername} onChange={(event) => setShareUsername(event.target.value)} placeholder="Recipient username" className="min-h-11 flex-1 rounded-[1rem] border border-[var(--line)] bg-white px-4 text-sm font-bold outline-none focus:border-[var(--signal)]" />
                <button type="button" onClick={submitShare} disabled={busy} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white disabled:opacity-50"><Share2 className="h-4 w-4" /> {busy ? "Sharing..." : "Send ticket"}</button>
              </div>
            </div>
          ) : null}

          <dl className="mt-5 grid gap-3 text-sm font-semibold text-[var(--steel)] sm:grid-cols-2">
            <div className="rounded-[1.1rem] border border-[var(--line)] bg-[var(--surface)] p-3"><dt className="text-[0.65rem] uppercase tracking-[0.12em] text-[var(--muted)]">Reference</dt><dd className="code mt-1 font-black text-[var(--ink)]">{ticket.ticketReference}</dd></div>
            <div className="rounded-[1.1rem] border border-[var(--line)] bg-[var(--surface)] p-3"><dt className="text-[0.65rem] uppercase tracking-[0.12em] text-[var(--muted)]">Current owner</dt><dd className="mt-1 font-black text-[var(--ink)]">{ticket.buyerName}</dd></div>
            <div className="rounded-[1.1rem] border border-[var(--line)] bg-[var(--surface)] p-3"><dt className="text-[0.65rem] uppercase tracking-[0.12em] text-[var(--muted)]">Date</dt><dd className="mt-1 font-black text-[var(--ink)]">{formatDate(eventDate)}</dd></div>
            <div className="rounded-[1.1rem] border border-[var(--line)] bg-[var(--surface)] p-3"><dt className="text-[0.65rem] uppercase tracking-[0.12em] text-[var(--muted)]">Location</dt><dd className="mt-1 font-black text-[var(--ink)]">{eventLocation}</dd></div>
          </dl>
        </div>

        {cameraOpen ? (
          <div className="rounded-[1.4rem] border border-[var(--signal)]/25 bg-[var(--ink)] p-4 text-white">
            <div className="flex items-center justify-between gap-3"><p className="font-black">Centre your face in the camera</p><button type="button" onClick={closeCamera} className="grid h-9 w-9 place-items-center rounded-full bg-white/10"><X className="h-4 w-4" /></button></div>
            <video ref={videoRef} muted playsInline className="mt-3 aspect-square max-h-[28rem] w-full rounded-[1.2rem] bg-black object-cover" />
            <button type="button" onClick={captureFrame} disabled={busy} className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[var(--gold)] bg-[var(--gold)] px-5 text-sm font-black text-[var(--ink)] disabled:opacity-50"><Camera className="h-4 w-4" /> {busy ? "Saving..." : "Capture verification photo"}</button>
            <p className="mt-3 text-xs font-semibold leading-5 text-white/65">This image is used only for a worker&apos;s manual visual comparison at entry. The app does not perform automated face recognition.</p>
          </div>
        ) : null}

        {error ? <p className="rounded-[1rem] border border-[var(--danger)]/25 bg-[var(--danger)]/10 p-3 text-sm font-bold text-[var(--danger)]">{error}</p> : null}
        {message ? <p className="rounded-[1rem] border border-[var(--confirm)]/25 bg-[var(--confirm)]/10 p-3 text-sm font-bold text-[var(--confirm)]">{message}</p> : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={copyReference} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ember)]">
            {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : "Copy reference"}
          </button>
          <button type="button" className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-5 text-sm font-black text-[var(--ink)] shadow-[var(--shadow-soft)] hover:border-[var(--signal)]">
            <Download className="h-4 w-4" /> View / Download
          </button>
        </div>
      </div>
    </article>
  );
}
