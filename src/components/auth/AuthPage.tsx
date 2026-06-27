import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Barcode,
  Building2,
  CheckCircle2,
  Eye,
  Fingerprint,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";
import { SocialLinks } from "@/components/social/SocialLinks";

type AuthMode = "login" | "register" | "affiliate";

type AuthPageProps = {
  mode: AuthMode;
};

const authCopy = {
  login: {
    eyebrow: "Secure access",
    title: "Login to your scan command center.",
    description:
      "Access barcode scanning, inventory dashboards, worker activity, tip payouts, affiliate reports, and audit-ready business operations from one premium terminal.",
    badge: "Protected owner, worker, affiliate and admin routes",
    primaryAction: "Open dashboard",
    alternateText: "New to King Sparkon Tracker?",
    alternateAction: "Create business account",
    alternateHref: "/register",
    schemaName: "King Sparkon Tracker Login",
    schemaPath: "/login",
  },
  register: {
    eyebrow: "Business onboarding",
    title: "Create your barcode tracking workspace.",
    description:
      "Register your business for inventory scanning, QR verification, product movement, worker tip visibility, affiliate growth, promotions, and reporting.",
    badge: "Free trial ready with scalable billing plans",
    primaryAction: "Create workspace",
    alternateText: "Already running operations here?",
    alternateAction: "Login instead",
    alternateHref: "/login",
    schemaName: "King Sparkon Tracker Business Registration",
    schemaPath: "/register",
  },
  affiliate: {
    eyebrow: "Affiliate access",
    title: "Join the referral engine behind the scanner.",
    description:
      "Create an affiliate profile to share trackable links, QR-ready promotion assets, and measurable business referrals for King Sparkon Tracker.",
    badge: "Referral links, QR previews and payout visibility",
    primaryAction: "Join affiliate program",
    alternateText: "Registering a business instead?",
    alternateAction: "Create business account",
    alternateHref: "/register",
    schemaName: "King Sparkon Tracker Affiliate Registration",
    schemaPath: "/register-affiliate",
  },
} as const;

const trustPoints = [
  "SEO-ready auth entry points",
  "Rounded premium UI instead of boxy forms",
  "Social profiles exposed without linking to a repo",
  "Designed for secure httpOnly session proxy wiring",
] as const;

const sideMetrics = [
  ["Scan flow", "Barcode + QR"],
  ["Dashboards", "Owner / Worker / Affiliate"],
  ["Policy", "Tips + payouts + commissions"],
] as const;

function AuthStructuredData({ mode }: { mode: AuthMode }) {
  const copy = authCopy[mode];
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: copy.schemaName,
    url: `https://king-sparkon-tracker.com${copy.schemaPath}`,
    description: copy.description,
    isPartOf: {
      "@type": "WebSite",
      name: "King Sparkon Tracker",
      url: "https://king-sparkon-tracker.com",
    },
    potentialAction: {
      "@type": mode === "login" ? "LoginAction" : "RegisterAction",
      target: `https://king-sparkon-tracker.com${copy.schemaPath}`,
    },
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />;
}

function EmailField({ mode }: { mode: AuthMode }) {
  return (
    <div>
      <label htmlFor={`${mode}-email`} className="text-sm font-black text-[var(--ink)]">
        Work email
      </label>
      <div className="mt-2 flex min-h-13 items-center gap-3 rounded-full border border-[var(--line)] bg-white px-4 shadow-[var(--shadow-soft)] focus-within:border-[var(--signal)] focus-within:shadow-[var(--focus-ring)]">
        <Mail className="h-4 w-4 shrink-0 text-[var(--signal)]" />
        <input
          id={`${mode}-email`}
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@company.com"
          className="min-h-12 w-full bg-transparent text-sm font-semibold outline-none placeholder:text-[var(--muted)]"
        />
      </div>
    </div>
  );
}

function PasswordField({ mode, label = "Password", autoComplete = "current-password" }: { mode: AuthMode; label?: string; autoComplete?: string }) {
  return (
    <div>
      <label htmlFor={`${mode}-${label.toLowerCase().replaceAll(" ", "-")}`} className="text-sm font-black text-[var(--ink)]">
        {label}
      </label>
      <div className="mt-2 flex min-h-13 items-center gap-3 rounded-full border border-[var(--line)] bg-white px-4 shadow-[var(--shadow-soft)] focus-within:border-[var(--signal)] focus-within:shadow-[var(--focus-ring)]">
        <LockKeyhole className="h-4 w-4 shrink-0 text-[var(--signal)]" />
        <input
          id={`${mode}-${label.toLowerCase().replaceAll(" ", "-")}`}
          name={label.toLowerCase().replaceAll(" ", "-")}
          type="password"
          autoComplete={autoComplete}
          required
          placeholder="••••••••••"
          className="min-h-12 w-full bg-transparent text-sm font-semibold outline-none placeholder:text-[var(--muted)]"
        />
        <Eye className="h-4 w-4 shrink-0 text-[var(--muted)]" aria-hidden="true" />
      </div>
    </div>
  );
}

function NameField({ mode, business = false }: { mode: AuthMode; business?: boolean }) {
  const fieldLabel = business ? "Business name" : "Full name";
  const fieldId = `${mode}-${business ? "business" : "name"}`;

  return (
    <div>
      <label htmlFor={fieldId} className="text-sm font-black text-[var(--ink)]">
        {fieldLabel}
      </label>
      <div className="mt-2 flex min-h-13 items-center gap-3 rounded-full border border-[var(--line)] bg-white px-4 shadow-[var(--shadow-soft)] focus-within:border-[var(--signal)] focus-within:shadow-[var(--focus-ring)]">
        {business ? <Building2 className="h-4 w-4 shrink-0 text-[var(--signal)]" /> : <UserRound className="h-4 w-4 shrink-0 text-[var(--signal)]" />}
        <input
          id={fieldId}
          name={business ? "businessName" : "fullName"}
          type="text"
          autoComplete={business ? "organization" : "name"}
          required
          placeholder={business ? "Example Retail Group" : "Leonard The Coder"}
          className="min-h-12 w-full bg-transparent text-sm font-semibold outline-none placeholder:text-[var(--muted)]"
        />
      </div>
    </div>
  );
}

function RegisterFields({ mode }: { mode: Extract<AuthMode, "register" | "affiliate"> }) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-5 md:grid-cols-2">
        <NameField mode={mode} />
        <NameField mode={mode} business={mode === "register"} />
      </div>
      <EmailField mode={mode} />
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor={`${mode}-phone`} className="text-sm font-black text-[var(--ink)]">
            WhatsApp or phone
          </label>
          <div className="mt-2 flex min-h-13 items-center gap-3 rounded-full border border-[var(--line)] bg-white px-4 shadow-[var(--shadow-soft)] focus-within:border-[var(--signal)] focus-within:shadow-[var(--focus-ring)]">
            <UsersRound className="h-4 w-4 shrink-0 text-[var(--signal)]" />
            <input
              id={`${mode}-phone`}
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              placeholder="+27 00 000 0000"
              className="min-h-12 w-full bg-transparent text-sm font-semibold outline-none placeholder:text-[var(--muted)]"
            />
          </div>
        </div>
        <div>
          <label htmlFor={`${mode}-role`} className="text-sm font-black text-[var(--ink)]">
            {mode === "register" ? "Workspace type" : "Promotion channel"}
          </label>
          <div className="mt-2 flex min-h-13 items-center gap-3 rounded-full border border-[var(--line)] bg-white px-4 shadow-[var(--shadow-soft)] focus-within:border-[var(--signal)] focus-within:shadow-[var(--focus-ring)]">
            <Fingerprint className="h-4 w-4 shrink-0 text-[var(--signal)]" />
            <select id={`${mode}-role`} name="role" required className="min-h-12 w-full bg-transparent text-sm font-semibold outline-none">
              {mode === "register" ? (
                <>
                  <option>Retail business</option>
                  <option>Restaurant or service business</option>
                  <option>Warehouse or stock room</option>
                  <option>Multi-branch operation</option>
                </>
              ) : (
                <>
                  <option>Social media promoter</option>
                  <option>Business consultant</option>
                  <option>Retail network partner</option>
                  <option>Content creator</option>
                </>
              )}
            </select>
          </div>
        </div>
      </div>
      <PasswordField mode={mode} label="Create password" autoComplete="new-password" />
    </div>
  );
}

export function AuthPage({ mode }: AuthPageProps) {
  const copy = authCopy[mode];
  const isLogin = mode === "login";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--ink)] text-white">
      <AuthStructuredData mode={mode} />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-14rem] top-[-10rem] h-[34rem] w-[34rem] rounded-full bg-[var(--gold)]/15 blur-3xl" />
        <div className="absolute bottom-[-14rem] right-[-8rem] h-[38rem] w-[38rem] rounded-full bg-[var(--signal)]/16 blur-3xl" />
        <div className="absolute left-1/2 top-0 h-px w-[86%] -translate-x-1/2 bg-gradient-to-r from-transparent via-[var(--gold)]/50 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl gap-8 px-5 py-6 md:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:py-10">
        <section className="flex min-h-[42rem] flex-col justify-between rounded-[2.5rem] border border-white/10 bg-white/[0.055] p-6 shadow-[var(--shadow-depth)] backdrop-blur-xl md:p-8">
          <div>
            <Link href="/" aria-label="King Sparkon Tracker home" className="inline-flex items-center gap-3">
              <Image
                src="/king-sparkon-logo.png"
                alt="King Sparkon Tracker barcode logo"
                width={56}
                height={56}
                className="rounded-[1.35rem] border border-white/12 bg-white/[0.08] p-1.5"
                priority
              />
              <div>
                <p className="font-mono text-[0.66rem] font-black uppercase tracking-[0.2em] text-[var(--gold)]">King Sparkon</p>
                <p className="text-xl font-black uppercase tracking-[-0.04em]">Tracker</p>
              </div>
            </Link>

            <div className="mt-12 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 font-mono text-[0.68rem] font-black uppercase tracking-[0.16em] text-white/68">
                <Sparkles className="h-3.5 w-3.5 text-[var(--gold)]" /> {copy.eyebrow}
              </div>
              <h1 className="mt-6 text-5xl font-black leading-[0.95] tracking-[-0.07em] md:text-6xl xl:text-7xl">{copy.title}</h1>
              <p className="mt-6 text-sm leading-7 text-white/65 md:text-base">{copy.description}</p>
            </div>
          </div>

          <div className="mt-10">
            <div className="grid gap-3 sm:grid-cols-3">
              {sideMetrics.map(([label, value]) => (
                <div key={label} className="rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-4">
                  <p className="font-mono text-[0.62rem] font-black uppercase tracking-[0.14em] text-white/40">{label}</p>
                  <p className="mt-2 text-sm font-black text-white">{value}</p>
                </div>
              ))}
            </div>
            <div className="barcode-rule mt-7 text-white" />
          </div>
        </section>

        <section className="relative">
          <div className="absolute -inset-4 rounded-[3rem] bg-gradient-to-br from-[var(--gold)]/16 via-white/5 to-[var(--signal)]/16 blur-2xl" />
          <div className="relative overflow-hidden rounded-[2.75rem] border border-white/12 bg-[var(--paper)] p-4 text-[var(--ink)] shadow-[var(--shadow-depth)] md:p-6">
            <div className="absolute right-[-6rem] top-[-8rem] h-72 w-72 rounded-full bg-[var(--gold)]/25 blur-3xl" />
            <div className="absolute bottom-[-8rem] left-[-7rem] h-80 w-80 rounded-full bg-[var(--signal)]/15 blur-3xl" />

            <div className="relative rounded-[2.25rem] border border-[var(--line)] bg-white/78 p-5 shadow-[var(--shadow-ledger)] backdrop-blur md:p-7">
              <div className="flex flex-col gap-4 border-b border-[var(--line)] pb-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-[var(--signal)]">{copy.badge}</p>
                  <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] md:text-4xl">{isLogin ? "Welcome back" : mode === "affiliate" ? "Affiliate profile" : "Business profile"}</h2>
                </div>
                <div className="grid h-13 w-13 place-items-center rounded-[1.35rem] bg-[var(--ink)] text-[var(--gold)] shadow-[var(--shadow-soft)]">
                  {isLogin ? <ShieldCheck className="h-6 w-6" /> : <Barcode className="h-6 w-6" />}
                </div>
              </div>

              <form action={isLogin ? "/dashboard/owner" : "/dashboard/owner"} className="mt-6 grid gap-5">
                {isLogin ? (
                  <>
                    <EmailField mode={mode} />
                    <PasswordField mode={mode} />
                    <div className="flex flex-col gap-3 text-sm font-bold text-[var(--steel)] sm:flex-row sm:items-center sm:justify-between">
                      <label className="inline-flex items-center gap-2">
                        <input type="checkbox" name="remember" className="h-4 w-4 rounded border-[var(--line)] accent-[var(--signal)]" />
                        Remember this device
                      </label>
                      <Link href="/forgot-password" className="text-[var(--signal)] hover:text-[var(--ember)]">
                        Forgot password?
                      </Link>
                    </div>
                  </>
                ) : (
                  <RegisterFields mode={mode} />
                )}

                <button
                  type="submit"
                  className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-6 text-sm font-black text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ember)]"
                >
                  {copy.primaryAction} <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              <div className="mt-6 rounded-[1.75rem] border border-[var(--line)] bg-[var(--paper)] p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <p className="text-sm font-bold text-[var(--steel)]">
                    {copy.alternateText} {" "}
                    <Link href={copy.alternateHref} className="font-black text-[var(--signal)] hover:text-[var(--ember)]">
                      {copy.alternateAction}
                    </Link>
                  </p>
                  {mode === "affiliate" ? (
                    <Link href="/login" className="text-sm font-black text-[var(--signal)] hover:text-[var(--ember)]">
                      Affiliate login
                    </Link>
                  ) : null}
                </div>
              </div>

              <div className="mt-6 border-t border-[var(--line)] pt-6">
                <p className="mb-3 font-mono text-[0.68rem] font-black uppercase tracking-[0.16em] text-[var(--muted)]">Official profiles</p>
                <SocialLinks variant="light" />
              </div>
            </div>

            <div className="relative mt-4 grid gap-3 md:grid-cols-2">
              {trustPoints.map((point) => (
                <div key={point} className="flex items-center gap-3 rounded-[1.25rem] border border-[var(--line)] bg-white/72 px-4 py-3 text-sm font-bold text-[var(--steel)] shadow-[var(--shadow-soft)]">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--confirm)]" />
                  {point}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-white/45">
            <span className="inline-flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-[var(--gold)]" /> Social links point to profiles, not repositories.
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}
