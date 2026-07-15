"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { BadgeCheck, BriefcaseBusiness, Crown, Megaphone, QrCode, ScanLine, ShieldCheck } from "lucide-react";

const TIP_KING_SPARKON_IMAGE = "https://veizbtzugssszhxabzrv.supabase.co/storage/v1/object/public/king-sparkon-logo/AAA.png";
const CHOOSE_FORM_IMAGE = "https://veizbtzugssszhxabzrv.supabase.co/storage/v1/object/public/king-sparkon-logo/AXA.png";
const ADMIN_CAPACITY_IMAGE = "https://veizbtzugssszhxabzrv.supabase.co/storage/v1/object/public/king-sparkon-logo/ChatGPT%20Image%20Jul%202,%202026,%2004_35_43%20PM%20(3).png";
const OWNER_CAPACITY_IMAGE = "https://veizbtzugssszhxabzrv.supabase.co/storage/v1/object/public/king-sparkon-logo/ChatGPT%20Image%20Jul%202,%202026,%2004_26_15%20PM%20(3).png";
const CONTACT_FORM_IMAGE = "https://veizbtzugssszhxabzrv.supabase.co/storage/v1/object/public/king-sparkon-logo/ChatGPT%20Image%20Jul%202,%202026,%2004_35_42%20PM%20(1).png";
const APPLICATION_COMPLAINT_PRIMARY_IMAGE = "https://veizbtzugssszhxabzrv.supabase.co/storage/v1/object/public/king-sparkon-logo/ChatGPT%20Image%20Jul%202,%202026,%2004_35_42%20PM%20(2).png";
const APPLICATION_COMPLAINT_SECONDARY_IMAGE = "https://veizbtzugssszhxabzrv.supabase.co/storage/v1/object/public/king-sparkon-logo/ChatGPT%20Image%20Jul%202,%202026,%2004_26_11%20PM%20(2).png";

function CircleStage({ children, label, icon }: { children: ReactNode; label: string; icon: ReactNode }) {
  return (
    <figure className="landing-circle-stage relative isolate mx-auto aspect-square w-full max-w-[28rem] overflow-hidden rounded-full border border-[var(--line-strong)] bg-white shadow-[0_20px_54px_rgba(14,165,233,0.12)]">
      <div className="landing-circle-glow pointer-events-none absolute inset-[8%] rounded-full bg-[var(--signal-soft)]" aria-hidden="true" />
      <div className="landing-circle-ring landing-circle-ring-one pointer-events-none absolute inset-[9%] rounded-full border border-[var(--line-strong)]" aria-hidden="true" />
      <div className="landing-circle-ring landing-circle-ring-two pointer-events-none absolute inset-[20%] rounded-full border border-[var(--line)]" aria-hidden="true" />
      {children}
      <figcaption className="absolute bottom-[7%] left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[var(--line-strong)] bg-white px-4 py-2 shadow-[var(--shadow-soft)]">
        <span className="text-[var(--signal)]">{icon}</span>
        <span className="whitespace-nowrap text-xs font-extrabold text-[var(--ink)]">{label}</span>
      </figcaption>
    </figure>
  );
}

function SingleCircleVisual({ image, alt, label, icon }: { image: string; alt: string; label: string; icon: ReactNode }) {
  return (
    <CircleStage label={label} icon={icon}>
      <div className="landing-circle-image absolute inset-[16%] z-20 overflow-hidden rounded-full border border-[var(--line)] bg-white shadow-[0_16px_38px_rgba(14,165,233,0.12)]">
        <Image src={image} alt={alt} fill unoptimized sizes="(min-width: 1024px) 28rem, 88vw" className="object-contain p-[8%]" />
        <div className="landing-circle-scan pointer-events-none absolute inset-x-[8%] h-14" aria-hidden="true" />
      </div>
    </CircleStage>
  );
}

function DoubleCircleVisual({ primaryImage, primaryAlt, secondaryImage, secondaryAlt, label, icon }: { primaryImage: string; primaryAlt: string; secondaryImage: string; secondaryAlt: string; label: string; icon: ReactNode }) {
  return (
    <CircleStage label={label} icon={icon}>
      <div className="landing-circle-card landing-circle-card-primary absolute left-[12%] top-[16%] z-10 aspect-square w-[55%] overflow-hidden rounded-full border border-[var(--line-strong)] bg-white shadow-[0_16px_40px_rgba(14,165,233,0.12)]">
        <Image src={primaryImage} alt={primaryAlt} fill unoptimized sizes="16rem" className="object-contain p-[8%]" />
      </div>
      <div className="landing-circle-card landing-circle-card-secondary absolute bottom-[16%] right-[10%] z-20 aspect-square w-[55%] overflow-hidden rounded-full border border-[var(--line-strong)] bg-white shadow-[0_18px_44px_rgba(14,165,233,0.15)]">
        <Image src={secondaryImage} alt={secondaryAlt} fill unoptimized sizes="16rem" className="object-contain p-[8%]" />
      </div>
      <div className="landing-circle-scan pointer-events-none absolute inset-x-[14%] z-30 h-14" aria-hidden="true" />
    </CircleStage>
  );
}

export function Sponsor3DVisual() {
  return <SingleCircleVisual image={TIP_KING_SPARKON_IMAGE} alt="3D King Sparkon platform support visual" label="Maintain · Test · Improve" icon={<BadgeCheck className="h-4 w-4" />} />;
}

export function Role3DVisual() {
  return <SingleCircleVisual image={CHOOSE_FORM_IMAGE} alt="3D King Sparkon role selection visual" label="Choose the correct access" icon={<Crown className="h-4 w-4" />} />;
}

export function Capacity3DVisual() {
  return <DoubleCircleVisual primaryImage={ADMIN_CAPACITY_IMAGE} primaryAlt="3D administrator capacity dashboard" secondaryImage={OWNER_CAPACITY_IMAGE} secondaryAlt="3D owner capacity dashboard" label="Admin and owner capacity" icon={<BriefcaseBusiness className="h-4 w-4" />} />;
}

export function Engineering3DVisual() {
  return <DoubleCircleVisual primaryImage={APPLICATION_COMPLAINT_PRIMARY_IMAGE} primaryAlt="3D customer feedback evidence visual" secondaryImage={APPLICATION_COMPLAINT_SECONDARY_IMAGE} secondaryAlt="3D engineering response visual" label="Listen · Fix · Prove" icon={<Megaphone className="h-4 w-4" />} />;
}

export function Contact3DVisual() {
  return <SingleCircleVisual image={CONTACT_FORM_IMAGE} alt="3D King Sparkon contact workflow visual" label="Message becomes action" icon={<QrCode className="h-4 w-4" />} />;
}

export function CompactScanBadge() {
  return <div className="grid h-12 w-12 place-items-center rounded-full border border-[var(--line-strong)] bg-white text-[var(--signal)] shadow-[var(--shadow-soft)]"><ScanLine className="h-5 w-5" /></div>;
}

export function CompactShieldBadge() {
  return <div className="grid h-12 w-12 place-items-center rounded-full border border-[var(--line-strong)] bg-white text-[var(--signal)] shadow-[var(--shadow-soft)]"><ShieldCheck className="h-5 w-5" /></div>;
}
