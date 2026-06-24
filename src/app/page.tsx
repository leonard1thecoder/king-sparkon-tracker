import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Barcode,
  Boxes,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  DatabaseZap,
  Mail,
  MapPin,
  Phone,
  ScanLine,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Barcode Inventory Tracking Software",
  description:
    "King Sparkon Tracker helps businesses manage barcoded product inventory, stock movement, worker barcode assignment, returnable claims, reporting, audit logs, and billing.",
  keywords: [
    "barcode inventory tracking software",
    "barcoded product management",
    "stock barcode scanning",
    "inventory SaaS for workers",
    "returnable barcode claims",
    "business inventory reports",
  ],
};

const navItems = [
  { label: "Workflow", href: "#workflow" },
  { label: "Vision", href: "#vision" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
];

const metrics = [
  { label: "Barcode capacity", value: "1:1", detail: "One barcode per stocked unit" },
  { label: "Role workspaces", value: "2", detail: "Owner and worker dashboards" },
  { label: "Product scope", value: "All", detail: "Any product that carries a barcode" },
];

const workflow = [
  {
    title: "Create stock records",
    text: "Owners add products, prices, returnable settings, night-shift pricing, and stock quantities without adding physical barcodes.",
    icon: Boxes,
  },
  {
    title: "Assign barcode labels",
    text: "Workers scan one barcode per stocked unit. Remaining capacity is visible so teams cannot over-assign barcodes.",
    icon: ScanLine,
  },
  {
    title: "Move stock with proof",
    text: "BUY transactions stay barcode-free while SELL transactions require scanned barcodes equal to the quantity sold.",
    icon: ClipboardList,
  },
];

const vision = [
  "Make barcoded stock trustworthy before it reaches the sales floor.",
  "Give owners business-scoped reports without exposing global data.",
  "Help workers complete barcode work quickly from any device.",
  "Keep claims, transactions, audit logs, and billing in one operating system.",
];

const platform = [
  { label: "Inventory summary", value: "Live", icon: DatabaseZap },
  { label: "Audit history", value: "Scoped", icon: ShieldCheck },
  { label: "Worker teams", value: "Ready", icon: UsersRound },
  { label: "Barcode claims", value: "Traceable", icon: Barcode },
];

const plans = [
  {
    name: "Free Trial",
    plan: "FREE_TRIAL",
    price: "R0",
    worldPrice: "$0",
    billing: "14 day trial",
    worldBilling: "Rest of the world",
    cta: "Choose trial",
    accent: "text-[#99e39e]",
    features: ["2 workers", "Unlimited products", "Unlimited barcode scanning", "Barcode claims"],
  },
  {
    name: "Plus",
    plan: "PLUS",
    price: "R880",
    worldPrice: "$48",
    billing: "per month",
    worldBilling: "per month for Rest of the world",
    cta: "Choose Plus",
    accent: "text-[#1dc8cd]",
    features: ["5 workers", "Unlimited products", "Unlimited barcode scanning", "PayPal subscription flow"],
  },
  {
    name: "Pro",
    plan: "PRO",
    price: "R2,300",
    worldPrice: "$124",
    billing: "per month",
    worldBilling: "per month for Rest of the world",
    cta: "Choose Pro",
    accent: "text-[#ffab00]",
    features: ["Unlimited workers", "Business Analysis AI", "Worker clocker", "Full operational reporting"],
  },
];

type SocialIconName = "facebook" | "instagram" | "x" | "github";

const footerSocialLinks: Array<{ label: string; href: string; icon: SocialIconName }> = [
  { label: "Facebook", href: "https://www.facebook.com", icon: "facebook" },
  { label: "Instagram", href: "https://www.instagram.com", icon: "instagram" },
  { label: "X", href: "https://x.com", icon: "x" },
  { label: "GitHub", href: "https://github.com/leonard1thecoder/king-sparkon-tracker", icon: "github" },
];

function SectionHeading({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="relative mb-6 inline-flex pb-4 text-lg text-[#d8dbdb] after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-8 after:-translate-x-1/2 after:bg-[#99e39e]">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-medium leading-tight text-white sm:text-4xl">{title}</h2>
      <p className="mt-5 text-base leading-7 text-[#d8dbdb]/60">{text}</p>
    </div>
  );
}

function FooterSocialIcon({ name }: { name: SocialIconName }) {
  if (name === "facebook") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
        <path d="M14.25 8.25V6.6c0-.72.48-.9.82-.9h2.12V2.1L14.27 2C11.03 2 10.3 4.42 10.3 5.97v2.28H7.75V12h2.55v10h4.05V12h2.72l.36-3.75h-3.18Z" />
      </svg>
    );
  }

  if (name === "instagram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <rect x="3.5" y="3.5" width="17" height="17" rx="4.8" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="3.7" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="17.1" cy="6.9" r="1.2" fill="currentColor" />
      </svg>
    );
  }

  if (name === "github") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2.25c-5.52 0-10 4.36-10 9.74 0 4.31 2.87 7.96 6.85 9.25.5.09.68-.21.68-.47 0-.23-.01-.84-.01-1.65-2.79.59-3.38-1.31-3.38-1.31-.45-1.13-1.11-1.43-1.11-1.43-.91-.61.07-.6.07-.6 1 .07 1.53 1 1.53 1 .89 1.49 2.34 1.06 2.91.81.09-.63.35-1.06.63-1.3-2.23-.25-4.57-1.09-4.57-4.83 0-1.07.39-1.94 1.03-2.62-.1-.25-.45-1.25.1-2.59 0 0 .84-.26 2.75 1a9.8 9.8 0 0 1 5.02 0c1.91-1.26 2.75-1 2.75-1 .55 1.34.2 2.34.1 2.59.64.68 1.03 1.55 1.03 2.62 0 3.75-2.35 4.58-4.59 4.82.36.31.68.91.68 1.84 0 1.33-.01 2.4-.01 2.73 0 .26.18.56.69.47A9.82 9.82 0 0 0 22 11.99c0-5.38-4.48-9.74-10-9.74Z"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path d="M4.5 4.5 19.5 19.5M19.5 4.5 4.5 19.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <main className="crypto-screen min-h-screen overflow-x-hidden bg-[#000510] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#000510]/88 px-5 py-3 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5">
          <Link href="/" className="flex items-center gap-3" aria-label="King Sparkon Tracker home">
            <Image
              src="/king-sparkon-logo.png"
              alt="King Sparkon Tracker logo"
              width={68}
              height={68}
              priority
              className="h-12 w-12 rounded-full"
            />
            <span className="text-sm font-semibold uppercase tracking-[0.16em] text-white/80">
              King Sparkon
            </span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-white/68 md:flex" aria-label="Landing navigation">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="hover:text-[#99e39e]">
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-white/14 px-4 text-sm font-semibold text-white/82 hover:border-[#99e39e] hover:text-[#99e39e]"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="hidden h-11 items-center justify-center rounded-lg bg-[#99e39e] px-4 text-sm font-semibold text-[#000510] shadow-[0_18px_42px_rgba(153,227,158,0.24)] hover:bg-transparent hover:text-[#99e39e] hover:ring-1 hover:ring-[#99e39e] sm:inline-flex"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden px-5 pb-20 pt-14 sm:px-8 lg:px-10 lg:pb-28 lg:pt-20">
        <div className="absolute right-[-18rem] top-[-10rem] h-[42rem] w-[42rem] rounded-full bg-gradient-to-br from-[#477e70] to-[#666c78] opacity-40 blur-[220px]" />
        <div className="absolute left-[-18rem] top-[34rem] h-[34rem] w-[34rem] rounded-full bg-gradient-to-br from-[#99e39e] to-[#1dc8cd] opacity-20 blur-[220px]" />
        <div className="crypto-grid absolute inset-0 opacity-[0.11]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)]">
          <div>
            <div className="mb-6 flex items-center justify-center gap-4 lg:justify-start">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#99e39e]/18 text-[#99e39e]">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="text-lg text-white">
                Barcode inventory <span className="text-[#99e39e]">on the go</span>
              </p>
            </div>
            <h1 className="max-w-4xl text-center text-5xl font-medium leading-[1.05] tracking-normal text-white sm:text-6xl lg:text-left lg:text-7xl">
              Track every <span className="text-[#99e39e]">barcoded product</span> from stock to sale.
            </h1>
            <p className="mt-7 max-w-2xl text-center text-lg leading-8 text-[#d8dbdb]/68 lg:text-left">
              King Sparkon Tracker is barcode inventory tracking software for product stock, worker barcode assignment, SELL transaction proof, returnable claims, owner reports, audit logs, and billing.
            </p>
            <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row lg:items-start">
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#99e39e] px-7 text-base font-semibold text-[#000510] shadow-[0_18px_42px_rgba(153,227,158,0.25)] hover:bg-transparent hover:text-[#99e39e] hover:ring-1 hover:ring-[#99e39e]"
              >
                Start tracking stock
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-[#99e39e] px-7 text-base font-semibold text-[#99e39e] hover:bg-[#99e39e] hover:text-[#000510]"
              >
                Open workspace
              </Link>
            </div>
            <div className="mt-16 grid gap-4 sm:grid-cols-3">
              {metrics.map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 backdrop-blur">
                  <p className="text-3xl font-semibold text-[#99e39e]">{metric.value}</p>
                  <p className="mt-2 text-sm font-semibold text-white">{metric.label}</p>
                  <p className="mt-1 text-xs leading-5 text-white/54">{metric.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden lg:block">
            <Image
              src="/king-sparkon-logo.png"
              alt="King Sparkon Tracker dashboard brand mark"
              width={900}
              height={900}
              priority
              className="absolute -right-16 -top-28 w-[42rem] max-w-none opacity-28"
            />
            <div className="relative ml-8 rounded-[2rem] border border-white/10 bg-[#1e2229]/80 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.46)] backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#99e39e]/16 text-[#99e39e]">
                    <Barcode className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">Live barcode desk</p>
                    <p className="text-xs text-white/48">Worker scan queue</p>
                  </div>
                </div>
                <span className="rounded-full bg-[#99e39e] px-3 py-1 text-xs font-bold text-[#000510]">API ready</span>
              </div>
              <div className="mt-5 grid gap-3">
                {["SPK-90121", "SPK-90122", "SPK-90123", "SPK-90124"].map((code, index) => (
                  <div key={code} className="flex items-center justify-between rounded-xl border border-white/8 bg-[#000510]/44 p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1dc8cd]/12 text-[#1dc8cd]">
                        <ScanLine className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="font-mono text-sm text-white/86">{code}</span>
                    </div>
                    <span className="text-xs text-white/42">Unit {index + 1}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  ["Stock value", "R128k"],
                  ["Claims", "18"],
                  ["Open slots", "42"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-white/10 bg-white/[0.045] p-4">
                    <p className="text-xs text-white/44">{label}</p>
                    <p className="mt-3 text-xl font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="workflow" className="relative bg-[#000510] px-5 py-20 sm:px-8 lg:px-10">
        <SectionHeading
          eyebrow="Barcode workflow"
          title="Built around the real movement of physical products."
          text="The operating model follows the backend rules: owner-created stock, worker-assigned barcodes, capacity enforcement, and barcode-backed sales."
        />
        <div className="mx-auto mt-14 grid max-w-7xl gap-6 lg:grid-cols-3">
          {workflow.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="rounded-3xl border border-white/10 bg-[#1e2229]/50 p-8 backdrop-blur">
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-full bg-[#99e39e]/18 text-[#99e39e]">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="text-2xl font-medium text-white">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[#d8dbdb]/58">{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="vision" className="relative bg-[#000510] px-5 py-20 sm:px-8 lg:px-10">
        <div className="absolute bottom-[-18rem] left-[-12rem] h-[36rem] w-[36rem] rounded-full bg-gradient-to-br from-[#477e70] to-[#666c78] opacity-35 blur-[220px]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xl text-[#99e39e]">Our vision</p>
            <h2 className="mt-4 text-4xl font-medium leading-tight text-white">
              Product truth, barcode by barcode.
            </h2>
            <p className="mt-5 text-base leading-7 text-[#d8dbdb]/62">
              King Sparkon Tracker exists to make barcode inventory management dependable for growing businesses that need clean stock records, worker accountability, and trusted sales movement.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {vision.map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.045] p-6">
                <BadgeCheck className="mb-5 h-6 w-6 text-[#99e39e]" aria-hidden="true" />
                <p className="text-sm leading-7 text-white/72">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="platform" className="relative bg-[#000510] px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl rounded-3xl border border-[#737373]/20 bg-[#737373]/10 p-7 backdrop-blur lg:p-12">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <h2 className="text-3xl font-medium text-white">
                Powered by the Sparkon <span className="text-[#99e39e]">Platform</span>
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#d8dbdb]/60">
                One SaaS interface connects products, users, barcodes, transactions, reports, audit logs, and billing through secure backend APIs.
              </p>
            </div>
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-[#99e39e] px-6 text-base font-semibold text-[#000510] hover:bg-transparent hover:text-[#99e39e] hover:ring-1 hover:ring-[#99e39e]"
            >
              Get Started
            </Link>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {platform.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-[#000510]/45 p-5">
                  <Icon className="h-6 w-6 text-[#1dc8cd]" aria-hidden="true" />
                  <p className="mt-5 text-sm text-white/48">{item.label}</p>
                  <p className="mt-2 text-xl font-semibold text-white">{item.value}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="pricing" className="relative bg-[#000510] px-5 py-20 sm:px-8 lg:px-10">
        <SectionHeading
          eyebrow="Pricing"
          title="Start simple, then unlock more operations."
          text="Plan cards map to the backend billing plans, so owners can trial, upgrade, open PayPal approval, and activate approved subscriptions."
        />
        <p className="mx-auto mt-5 max-w-3xl text-center text-sm leading-6 text-[#d8dbdb]/58">
          South Africa plans are shown in Rand. Rest of the world is also supported and shown in Dollar pricing using the backend localization rate.
        </p>
        <div className="mx-auto mt-14 grid max-w-7xl gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan.name} className="flex min-h-full flex-col rounded-3xl border border-white/10 bg-[#1e2229]/55 p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={`text-lg font-semibold ${plan.accent}`}>{plan.name}</p>
                  <h3 className="mt-4 text-4xl font-medium text-white">{plan.price}</h3>
                  <p className="mt-2 text-sm text-[#d8dbdb]/54">{plan.billing}</p>
                  <p className="mt-3 rounded-xl border border-white/10 bg-[#000510]/38 px-3 py-2 text-sm text-[#d8dbdb]/66">
                    Rest of the world: <span className="font-semibold text-white">{plan.worldPrice}</span>{" "}
                    <span>{plan.worldBilling}</span>
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-white/60">
                  {plan.plan.replace("_", " ")}
                </span>
              </div>
              <ul className="mt-8 grid gap-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm text-[#d8dbdb]/66">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#99e39e]" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={`/register?plan=${plan.plan}`}
                className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#99e39e] px-5 text-sm font-semibold text-[#000510] shadow-[0_18px_42px_rgba(153,227,158,0.18)] hover:bg-transparent hover:text-[#99e39e] hover:ring-1 hover:ring-[#99e39e]"
              >
                <CreditCard className="h-4 w-4" aria-hidden="true" />
                {plan.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section id="contact" className="relative bg-[#000510] px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-8 rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur lg:grid-cols-[0.9fr_1.1fr] lg:p-12">
          <div>
            <p className="text-xl text-[#99e39e]">Contact us</p>
            <h2 className="mt-4 text-4xl font-medium text-white">Bring barcode tracking into your business.</h2>
            <p className="mt-5 text-base leading-7 text-[#d8dbdb]/60">
              Talk to King Sparkon Tracker about inventory tracking software, barcode scanning workflows, stock movement reporting, worker operations, claims, and billing setup.
            </p>
            <div className="mt-8 grid gap-4 text-sm text-white/72">
              <p className="flex items-center gap-3"><Mail className="h-4 w-4 text-[#99e39e]" aria-hidden="true" /> support@king-sparkon-tracker.com</p>
              <p className="flex items-center gap-3"><Phone className="h-4 w-4 text-[#99e39e]" aria-hidden="true" /> +27 00 000 0000</p>
              <p className="flex items-center gap-3"><MapPin className="h-4 w-4 text-[#99e39e]" aria-hidden="true" /> Built for business-scoped product operations</p>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#000510] px-5 py-10 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Image src="/king-sparkon-logo.png" alt="King Sparkon Tracker logo" width={52} height={52} className="h-10 w-10 rounded-full" />
            <p className="text-sm text-white/62">2026 King Sparkon Tracker. Barcode inventory tracking SaaS.</p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex gap-5 text-sm text-white/54">
              <a href="#workflow" className="hover:text-[#99e39e]">Workflow</a>
              <a href="#pricing" className="hover:text-[#99e39e]">Pricing</a>
              <a href="#contact" className="hover:text-[#99e39e]">Contact</a>
            </div>
            <div className="flex gap-3" aria-label="King Sparkon Tracker social links">
              {footerSocialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={link.label}
                  title={link.label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.05] text-white/75 transition hover:border-[#99e39e] hover:bg-[#99e39e]/10 hover:text-[#99e39e]"
                >
                  <FooterSocialIcon name={link.icon} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
