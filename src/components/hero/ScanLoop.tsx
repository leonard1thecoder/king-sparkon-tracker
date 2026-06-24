"use client";

export function ScanLoop() {
  return (
    <div className="mx-auto w-full max-w-xl border border-white/15 bg-white/[0.03] p-5 text-white">
      <div className="relative aspect-[4/3] overflow-hidden border border-white/15 bg-[var(--ink)]">
        <div className="absolute left-5 top-5 z-10 font-mono text-xs uppercase tracking-[0.2em] text-white/60">Live scan terminal</div>
        <div className="scan-card absolute left-1/2 top-1/2 w-[74%] -translate-x-1/2 -translate-y-1/2 border border-white/20 bg-[#f6f0df] p-6 text-[var(--ink)] shadow-2xl">
          <div className="flex items-center justify-between font-mono text-[0.65rem] uppercase tracking-[0.16em] text-[var(--steel)]">
            <span>KST-6001234567890</span>
            <span className="text-[var(--confirm)]">Verified</span>
          </div>
          <div className="barcode-rule my-7 h-24 text-[var(--ink)]" />
          <div className="mt-6 grid grid-cols-3 gap-2 text-[0.64rem] uppercase tracking-[0.15em] text-[var(--steel)]">
            <span>Product</span>
            <span>Stock</span>
            <span>Paid</span>
          </div>
        </div>
        <div className="scan-line absolute left-0 right-0 top-0 h-1 bg-[var(--signal)] shadow-[0_0_28px_var(--signal)]" />
        <div className="confirm-flash absolute inset-0 border-[10px] border-[var(--confirm)] opacity-0" />
      </div>
      <style jsx>{`
        .scan-card { animation: flip-card 7s linear infinite; }
        .scan-line { animation: scan-pass 3.5s linear infinite; }
        .confirm-flash { animation: confirm-flash 3.5s step-end infinite; }
        @keyframes scan-pass { 0% { transform: translateY(0); } 45% { transform: translateY(310px); } 100% { transform: translateY(0); } }
        @keyframes confirm-flash { 0%, 43%, 100% { opacity: 0; } 44%, 48% { opacity: .75; } }
        @keyframes flip-card { 0%, 45% { transform: translate(-50%, -50%) rotateY(0deg); } 55%, 95% { transform: translate(-50%, -50%) rotateY(180deg); } 100% { transform: translate(-50%, -50%) rotateY(360deg); } }
        @media (prefers-reduced-motion: reduce), (max-width: 640px) { .scan-card, .scan-line, .confirm-flash { animation: none; } }
      `}</style>
    </div>
  );
}
