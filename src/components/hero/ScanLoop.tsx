"use client";

export function ScanLoop() {
  return (
    <div className="depth-panel mx-auto w-full max-w-xl rounded-[1.8rem] p-4 text-white">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.35rem] border border-white/12 bg-[var(--ink)] scan-grid">
        <div className="absolute left-5 top-5 z-10 rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-white/62">
          Live scan terminal
        </div>

        <div className="absolute inset-x-8 top-20 rounded-[var(--radius-xl)] border border-white/12 bg-white/[0.05] p-4 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-white/45">Warehouse A</span>
            <span className="rounded-full bg-[var(--confirm)] px-2.5 py-1 text-xs font-bold text-white">Online</span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[["Products", "18.4K"], ["Scans", "426K"], ["Alerts", "07"]].map(([label, value]) => (
              <div key={label} className="rounded-[var(--radius-md)] border border-white/10 bg-black/15 p-3">
                <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-white/38">{label}</p>
                <p className="money mt-1 text-lg font-black text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 w-[78%] -translate-x-1/2 rounded-[var(--radius-xl)] border border-white/18 bg-[#fffaf0] p-5 text-[var(--ink)] shadow-2xl">
          <div className="flex items-center justify-between font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[var(--steel)]">
            <span>KST-6001234567890</span>
            <span className="text-[var(--confirm)]">Verified</span>
          </div>
          <div className="barcode-rule my-5 h-20 text-[var(--ink)]" />
          <div className="grid grid-cols-3 gap-2 text-[0.64rem] uppercase tracking-[0.14em] text-[var(--steel)]">
            <span>Product</span>
            <span>Stock</span>
            <span>Paid</span>
          </div>
        </div>

        <div className="scan-sweep absolute left-0 right-0 top-0 h-1 bg-[var(--signal)] shadow-[0_0_28px_var(--signal)]" />
      </div>
    </div>
  );
}
