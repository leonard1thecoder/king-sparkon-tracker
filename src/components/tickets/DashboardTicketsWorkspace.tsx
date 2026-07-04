import type { UserRole } from "@/lib/types/backend";

export function DashboardTicketsWorkspace({ role }: { role: UserRole }) {
  return (
    <main className="grid gap-6 p-5 md:p-8">
      <section className="rounded-[2.5rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-ledger)] md:p-7">
        <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[var(--signal)]">{role} tickets</p>
        <h1 className="mt-4 text-3xl font-black tracking-[-0.05em] md:text-5xl">Dashboard ticket workspace</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--steel)]">Tickets are now planned inside each role dashboard, so role navigation does not send signed-in operators to the public tickets page.</p>
      </section>
    </main>
  );
}
