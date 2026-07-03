export default function Loading() {
  return (
    <main className="grid min-h-screen place-items-center bg-white px-5 text-[var(--ink)] enterprise-grid">
      <div className="relative overflow-hidden rounded-[2.5rem] border border-[var(--line)] bg-white/90 p-8 text-center shadow-[var(--shadow-depth)] backdrop-blur-xl">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-[1.75rem] border border-[var(--gold)] bg-[var(--ink)] text-[var(--gold)] shadow-[var(--shadow-soft)]">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--gold)] border-t-transparent" aria-hidden="true" />
        </div>
        <p className="mt-6 font-mono text-xs font-black uppercase tracking-[0.18em] text-[var(--signal)]">King Sparkon loading</p>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.05em]">Preparing the full platform page.</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[var(--steel)]">
          Loading dashboards, stats, pricing, Dev Hub, affiliate, jobs, and QR platform sections fully.
        </p>
      </div>
    </main>
  );
}
