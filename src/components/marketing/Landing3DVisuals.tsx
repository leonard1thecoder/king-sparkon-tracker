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

type FloatingCardProps = {
  image: string;
  alt: string;
  eyebrow: string;
  title: string;
  className: string;
  icon: ReactNode;
};

function StageDecor() {
  return (
    <>
      <div className="landing-motion-glow pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--signal-soft)] blur-3xl" aria-hidden="true" />
      <div className="landing-motion-ring landing-motion-ring-one pointer-events-none absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--line)]" aria-hidden="true" />
      <div className="landing-motion-ring landing-motion-ring-two pointer-events-none absolute left-1/2 top-1/2 h-[58%] w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--line-strong)]" aria-hidden="true" />
      <span className="landing-motion-dot landing-motion-dot-one" aria-hidden="true" />
      <span className="landing-motion-dot landing-motion-dot-two" aria-hidden="true" />
      <span className="landing-motion-dot landing-motion-dot-three" aria-hidden="true" />
    </>
  );
}

function FloatingCard({ image, alt, eyebrow, title, className, icon }: FloatingCardProps) {
  return (
    <article className={`capacity-card-3d absolute border border-[var(--line-strong)] bg-white p-3 shadow-[0_24px_55px_rgba(14,165,233,0.14)] ${className}`}>
      <div className="relative overflow-hidden rounded-lg border border-[var(--line)] bg-white">
        <Image src={image} alt={alt} width={760} height={760} unoptimized className="h-56 w-full object-contain p-2 sm:h-72" />
        <div className="landing-motion-scan pointer-events-none absolute inset-y-0 w-20" aria-hidden="true" />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 px-1 pb-1">
        <div>
          <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.12em] text-[var(--signal-strong)]">{eyebrow}</p>
          <p className="mt-1 text-lg font-black tracking-[-0.03em] text-[var(--ink)]">{title}</p>
        </div>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[var(--line)] bg-[var(--signal-soft)] text-[var(--signal-strong)]">{icon}</div>
      </div>
    </article>
  );
}

function SingleVisual({ image, alt, eyebrow, title, chips, icon }: { image: string; alt: string; eyebrow: string; title: string; chips: string[]; icon: ReactNode }) {
  return (
    <figure className="contact-hero-stage relative min-h-[28rem] overflow-hidden rounded-xl border border-[var(--line-strong)] bg-white p-4 shadow-[var(--shadow-soft)] sm:min-h-[32rem]">
      <StageDecor />
      <div className="contact-card-3d absolute inset-x-5 top-12 z-20 border border-[var(--line-strong)] bg-white p-3 shadow-[0_28px_65px_rgba(14,165,233,0.16)] sm:inset-x-10">
        <div className="relative overflow-hidden rounded-lg border border-[var(--line)] bg-white">
          <Image src={image} alt={alt} width={900} height={760} unoptimized className="h-72 w-full object-contain p-3 sm:h-80" />
          <div className="landing-motion-scan pointer-events-none absolute inset-y-0 w-20" aria-hidden="true" />
        </div>
        <figcaption className="mt-4 flex items-center justify-between gap-4 px-1 pb-1">
          <div>
            <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.12em] text-[var(--signal-strong)]">{eyebrow}</p>
            <p className="mt-1 text-xl font-black tracking-[-0.04em]">{title}</p>
          </div>
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-[var(--line)] bg-[var(--signal-soft)] text-[var(--signal-strong)]">{icon}</div>
        </figcaption>
      </div>
      <div className="absolute inset-x-5 bottom-5 z-30 grid grid-cols-3 gap-2 sm:inset-x-10">
        {chips.map((chip, index) => (
          <div key={chip} className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-center shadow-[var(--shadow-soft)]">
            <p className="text-[0.56rem] font-extrabold uppercase tracking-[0.1em] text-[var(--signal-strong)]">0{index + 1}</p>
            <p className="mt-1 text-xs font-extrabold text-[var(--ink)] sm:text-sm">{chip}</p>
          </div>
        ))}
      </div>
    </figure>
  );
}

export function Sponsor3DVisual() {
  return <SingleVisual image={TIP_KING_SPARKON_IMAGE} alt="3D King Sparkon platform support visual" eyebrow="Platform support" title="Maintain. Test. Improve." chips={["Host", "Secure", "Grow"]} icon={<BadgeCheck className="h-5 w-5" />} />;
}

export function Role3DVisual() {
  return <SingleVisual image={CHOOSE_FORM_IMAGE} alt="3D King Sparkon role selection visual" eyebrow="Choose your access" title="One platform. The correct role." chips={["User", "Affiliate", "Business"]} icon={<Crown className="h-5 w-5" />} />;
}

export function Capacity3DVisual() {
  return (
    <figure className="capacity-hero-stage relative min-h-[34rem] overflow-hidden rounded-xl border border-[var(--line-strong)] bg-white p-4 shadow-[var(--shadow-soft)] sm:min-h-[38rem]">
      <StageDecor />
      <FloatingCard image={ADMIN_CAPACITY_IMAGE} alt="3D administrator capacity dashboard" eyebrow="Platform capacity" title="Admin control" icon={<ShieldCheck className="h-5 w-5" />} className="capacity-card-3d-admin left-3 top-12 z-10 w-[72%] sm:left-8 sm:w-[61%]" />
      <FloatingCard image={OWNER_CAPACITY_IMAGE} alt="3D owner capacity dashboard" eyebrow="Business capacity" title="Owner control" icon={<BriefcaseBusiness className="h-5 w-5" />} className="capacity-card-3d-owner bottom-12 right-3 z-20 w-[72%] sm:right-8 sm:w-[61%]" />
      <div className="absolute bottom-4 left-4 right-4 z-30 flex items-center justify-between gap-3 rounded-lg border border-[var(--line)] bg-white px-4 py-3 shadow-[var(--shadow-soft)]">
        <p className="text-sm font-extrabold text-[var(--ink)]">Capacity stays visible before it becomes a problem.</p>
        <ScanLine className="h-5 w-5 shrink-0 text-[var(--signal)]" />
      </div>
    </figure>
  );
}

export function Engineering3DVisual() {
  return (
    <figure className="capacity-hero-stage relative min-h-[34rem] overflow-hidden rounded-xl border border-[var(--line-strong)] bg-white p-4 shadow-[var(--shadow-soft)] sm:min-h-[38rem]">
      <StageDecor />
      <FloatingCard image={APPLICATION_COMPLAINT_PRIMARY_IMAGE} alt="3D customer feedback evidence visual" eyebrow="Evidence input" title="Listen to friction" icon={<Megaphone className="h-5 w-5" />} className="capacity-card-3d-admin left-3 top-12 z-10 w-[72%] sm:left-8 sm:w-[61%]" />
      <FloatingCard image={APPLICATION_COMPLAINT_SECONDARY_IMAGE} alt="3D engineering response visual" eyebrow="Engineering response" title="Fix and prove" icon={<ShieldCheck className="h-5 w-5" />} className="capacity-card-3d-owner bottom-12 right-3 z-20 w-[72%] sm:right-8 sm:w-[61%]" />
      <div className="absolute bottom-4 left-4 right-4 z-30 grid grid-cols-3 gap-2 rounded-lg border border-[var(--line)] bg-white p-3 shadow-[var(--shadow-soft)]">
        {["Listen", "Fix", "Prove"].map((label, index) => <div key={label} className="text-center"><p className="text-[0.56rem] font-extrabold text-[var(--signal-strong)]">0{index + 1}</p><p className="mt-1 text-xs font-extrabold sm:text-sm">{label}</p></div>)}
      </div>
    </figure>
  );
}

export function Contact3DVisual() {
  return <SingleVisual image={CONTACT_FORM_IMAGE} alt="3D King Sparkon contact workflow visual" eyebrow="Contact pipeline" title="Message becomes action." chips={["Describe", "Review", "Build"]} icon={<QrCode className="h-5 w-5" />} />;
}

