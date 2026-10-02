import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";

export function SignedInRegisterNotice({ dashboardPath }: { dashboardPath: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--surface)] p-5 text-[var(--ink)]">
      <section className="max-w-xl rounded-[var(--radius-xl)] border border-[var(--line)] bg-white p-5 text-center shadow-[var(--shadow-ledger)]">
        <div className="barcode-rule mx-auto mb-4 max-w-xs text-[var(--ink)]" />
        <p className="font-mono text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-[var(--signal)]">Already signed in</p>
        <h1 className="mt-2 text-[1.25rem] font-bold tracking-[-0.02em]">Registration is available after logout.</h1>
        <p className="mt-2 text-[0.8125rem] leading-5 text-[var(--steel)]">Remember-me kept this browser signed in. Open your dashboard, or logout here before creating another account.</p>
        <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
          <Link href={dashboardPath} className="inline-flex h-9 items-center justify-center rounded-[var(--radius-md)] border border-[var(--signal)] bg-[var(--signal)] px-4 text-[0.8125rem] font-bold text-white hover:bg-[var(--ink)]">Open dashboard</Link>
          <LogoutButton />
        </div>
      </section>
    </main>
  );
}
