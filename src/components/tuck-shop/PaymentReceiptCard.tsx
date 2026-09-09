import Link from "next/link";
import { CheckCircle2, ReceiptText, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { money } from "@/lib/tuck-shop/cart";
import type { PayFastCartPaymentStatus } from "@/lib/types/backend";

export function PaymentReceiptCard({ receipt }: { receipt: PayFastCartPaymentStatus }) {
  return (
    <Card className="overflow-hidden border-[var(--confirm)]/40 bg-white">
      <div className="flex flex-col gap-4 border-b border-[var(--confirm)]/25 bg-[var(--confirm)]/10 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[1rem] bg-[var(--confirm)] text-white"><CheckCircle2 className="h-6 w-6" /></div>
          <div>
            <p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-[var(--confirm)]">Verified payment receipt</p>
            <h2 className="mt-1 text-3xl font-black tracking-[-0.04em] text-[var(--ink)]">Payment confirmed and order fulfilled</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--steel)]">PayFast confirmed the payment and the verified backend ITN completed the product and ticket records before this cart was cleared.</p>
          </div>
        </div>
        <ShieldCheck className="h-9 w-9 shrink-0 text-[var(--confirm)]" />
      </div>
      <CardContent className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[1.5rem] bg-[var(--ink)] p-5 text-white">
          <ReceiptText className="h-7 w-7 text-[var(--gold)]" />
          <p className="mt-5 font-mono text-xs font-black uppercase tracking-[0.14em] text-white/55">Amount paid</p>
          <p className="money mt-2 text-4xl font-black text-[var(--gold)]">{money(receipt.amount)}</p>
          <p className="mt-4 break-all text-xs font-bold leading-5 text-white/65">PayFast payment: {receipt.merchantPaymentId}</p>
          <p className="mt-2 text-xs font-bold uppercase tracking-[0.1em] text-[var(--confirm)]">{receipt.paymentStatus} · ITN verified</p>
        </div>

        <div className="grid gap-3">
          {receipt.productPurchases.map((purchase) => (
            <div key={purchase.transactionId} className="rounded-[1.25rem] border border-[var(--line)] bg-[var(--surface)] p-4">
              <p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.14em] text-[var(--signal)]">Product transaction</p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="font-black text-[var(--ink)]">#{purchase.transactionId} · {purchase.businessName ?? `Business #${purchase.businessId ?? "-"}`}</p><p className="mt-1 text-xs font-bold text-[var(--steel)]">{purchase.items.length} product line{purchase.items.length === 1 ? "" : "s"} · {purchase.paymentStatus ?? "PAID"}</p></div>
                <p className="money text-xl font-black text-[var(--ink)]">{money(purchase.productTotal)}</p>
              </div>
            </div>
          ))}

          {receipt.ticketPaymentIds.length > 0 ? (
            <div className="rounded-[1.25rem] border border-[var(--line)] bg-[var(--surface)] p-4">
              <p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.14em] text-[var(--signal)]">Issued ticket payments</p>
              <div className="mt-3 flex flex-wrap gap-2">{receipt.ticketPaymentIds.map((id) => <span key={id} className="rounded-full border border-[var(--line)] bg-white px-3 py-1.5 text-xs font-black text-[var(--ink)]">{id}</span>)}</div>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/dashboard/user/carts" className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-[var(--line)] bg-white px-5 text-sm font-black text-[var(--ink)] hover:border-[var(--gold)]">View my carts</Link>
            {receipt.ticketPaymentIds.length > 0 ? <Link href="/dashboard/user/tickets" className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white hover:bg-[var(--ink)]">Open issued tickets</Link> : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
