import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";

export function SignedInRegisterNotice({ dashboardPath }: { dashboardPath: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--surface)] p-5 text-[var(--ink)]">
      <section className="max-w-xl rounded-[2.25rem] border border-[var(--line)] bg-white p-7 text-center shadow-[var(--shadow-ledger)]">
        <div className="barcode-rule mx-auto mb-6 max-w-xs text-[var(--ink)]" />
        <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[var(--signal)]">Already signed in</p>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.05em]">Registration is available after logout.</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--steel)]">Remember-me kept this browser signed in. Open your dashboard, or logout here before creating another account.</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href={dashboardPath} className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white hover:bg-[var(--ink)]">Open dashboard</Link>
          <LogoutButton />
        </div>
      </section>
    </main>
  );
}
