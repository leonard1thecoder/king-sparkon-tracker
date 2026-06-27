"use client";

const previewTerminalMetrics = [
  ["Preview products", "18.4K"],
  ["Preview scans", "426K"],
  ["Preview alerts", "07"],
] as const;

export function ScanLoop() {
  return (
    <div className="relative mx-auto w-full max-w-xl [perspective:1200px]">
      <div className="relative rounded-[2.25rem] border border-white/12 bg-white/[0.06] p-3 shadow-[var(--shadow-depth)] backdrop-blur-2xl [transform:rotateX(4deg)_rotateY(-7deg)]">
        <div className="relative overflow-hidden rounded-[1.85rem] border border-white/12 bg-[var(--ink)] scan-grid">
          <div className="relative z-10 flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
            <div>
              <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[var(--gold)]">Preview scan terminal</p>
              <p className="mt-1 text-sm font-semibold text-white/62">Demo warehouse view</p>
            </div>
            <span className="rounded-full border border-[var(--confirm)]/40 bg-[var(--confirm)]/20 px-3 py-1 text-xs font-black text-white">Online</span>
          </div>

          <div className="relative z-10 grid gap-4 p-5">
            <div className="grid gap-3 sm:grid-cols-3">
              {previewTerminalMetrics.map(([label, value]) => (
                <div key={label} className="rounded-[1.25rem] border border-white/10 bg-white/[0.06] p-3 shadow-[var(--shadow-soft)] backdrop-blur">
                  <p className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-white/38">{label}</p>
                  <p className="money mt-1 text-lg font-black text-white">{value}</p>
                </div>
              ))}
            </div>

            <div className="relative mx-auto my-3 w-[88%] rounded-[1.65rem] border border-white/18 bg-[#fffaf0] p-5 text-[var(--ink)] shadow-[0_28px_80px_rgba(0,0,0,0.45)]">
              <div className="flex items-center justify-between font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[var(--steel)]">
                <span>DEMO-BARCODE</span>
                <span className="rounded-full bg-[rgba(21,128,61,0.1)] px-2.5 py-1 font-black text-[var(--confirm)]">Verified</span>
              </div>
              <div className="barcode-rule my-5 h-20 text-[var(--ink)]" />
              <div className="grid grid-cols-3 gap-2 text-[0.64rem] uppercase tracking-[0.14em] text-[var(--steel)]">
                <span>Product</span>
                <span>Stock</span>
                <span>Status</span>
              </div>
              <div className="scan-sweep absolute left-0 right-0 top-0 h-1 bg-[var(--signal)] shadow-[0_0_28px_var(--signal)]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
