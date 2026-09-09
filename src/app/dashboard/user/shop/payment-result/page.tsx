import { Suspense } from "react";
import { PaymentResultClient } from "./payment-result-client";

export const metadata = {
  title: "Payment result",
  description: "Verify your King Sparkon Tracker PayFast payment result.",
  robots: { index: false, follow: false },
};

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<PaymentResultFallback />}>
      <PaymentResultClient />
    </Suspense>
  );
}

function PaymentResultFallback() {
  return (
    <main className="bg-[var(--surface)] p-5 md:p-8">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-[var(--line)] bg-white p-10 text-center shadow-[var(--shadow-soft)]">
        <p className="text-sm font-black text-[var(--steel)]">Loading payment result...</p>
      </div>
    </main>
  );
}
