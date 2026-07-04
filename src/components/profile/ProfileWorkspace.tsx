"use client";

import { useEffect, useState } from "react";
import { Mail, ShieldCheck, UserRound } from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { apiGet, normalizeApiError } from "@/lib/api/client";
import type { TrackerUser, UserRole } from "@/lib/types/backend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusPill } from "@/components/ui/StatusPill";

function roles(user?: TrackerUser | null) {
  const raw = user?.roles?.length ? user.roles : user?.privilege ? [user.privilege] : [];
  return raw.map(String).filter(Boolean);
}

export function ProfileWorkspace({ role }: { role: UserRole }) {
  const [user, setUser] = useState<TrackerUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    apiGet<TrackerUser>("/users/me")
      .then((nextUser) => { if (mounted) setUser(nextUser); })
      .catch((exception) => { if (mounted) setError(normalizeApiError(exception).message); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const accountRoles = roles(user);

  return (
    <main className="grid gap-6 p-5 md:p-8">
      <section className="rounded-[2.5rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-ledger)] md:p-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[var(--signal)]">{role} profile</p>
            <h1 className="mt-3 text-3xl font-black tracking-[-0.05em] md:text-5xl">Account, role and session controls.</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--steel)]">This page uses the protected backend profile endpoint. It gives every role a real place to inspect identity and sign out.</p>
          </div>
          <LogoutButton />
        </div>
      </section>

      {error ? <p className="rounded-[var(--radius-lg)] border border-[var(--danger)]/30 bg-white p-4 text-sm font-bold text-[var(--danger)]">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Profile API" value={loading ? "..." : user ? "Loaded" : "Unavailable"} detail="GET /api/users/me through the protected proxy" tone={user ? "confirm" : "neutral"} icon={<UserRound className="h-5 w-5" />} />
        <MetricCard label="Role" value={accountRoles[0] ?? role} detail={accountRoles.length > 1 ? accountRoles.join(" + ") : "Primary dashboard role"} tone="signal" icon={<ShieldCheck className="h-5 w-5" />} />
        <MetricCard label="Email" value={user?.emailVerified ? "Verified" : "Review"} detail={user?.emailAddress ?? "Backend profile not loaded yet"} icon={<Mail className="h-5 w-5" />} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {[
            ["Username", user?.username],
            ["Email", user?.emailAddress],
            ["Business", user?.businessName ?? user?.businessId],
            ["Affiliate code", user?.affiliateCode],
            ["Tip QR", user?.tipQrCodeUrl ? "Available" : "Not available"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] p-4">
              <p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.14em] text-[var(--muted)]">{label}</p>
              <p className="mt-2 break-all text-sm font-bold text-[var(--ink)]">{loading ? "Loading..." : value ? String(value) : "Not set"}</p>
            </div>
          ))}
          <div className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] p-4 md:col-span-2">
            <p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.14em] text-[var(--muted)]">Roles</p>
            <div className="mt-3 flex flex-wrap gap-2">{(accountRoles.length ? accountRoles : [role]).map((item) => <StatusPill key={item} label={item} tone="confirm" />)}</div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
