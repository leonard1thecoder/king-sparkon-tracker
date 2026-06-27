import { MoreHorizontal } from "lucide-react";
import { StatusPill } from "@/components/ui/StatusPill";

export type InventoryStatus = "Healthy" | "Low stock" | "Review";

export type InventoryProduct = {
  barcode: string;
  name: string;
  location: string;
  quantity: number;
  status: InventoryStatus;
  lastScanned: string;
};

function toneForStatus(status: InventoryStatus) {
  if (status === "Healthy") {
    return "confirm";
  }

  if (status === "Low stock") {
    return "signal";
  }

  return "neutral";
}

export function ProductTable({ products }: { products: InventoryProduct[] }) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--surface-strong)] shadow-[var(--shadow-soft)]">
      <div className="hidden overflow-x-auto md:block">
        <table className="table-ledger min-w-[760px]">
          <thead>
            <tr>
              <th>Product</th>
              <th>Barcode</th>
              <th>Location</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Last scanned</th>
              <th className="w-10">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.barcode} className="hover:bg-[var(--paper)]/70">
                <td className="font-bold text-[var(--ink)]">{product.name}</td>
                <td className="code text-sm text-[var(--steel)]">{product.barcode}</td>
                <td className="text-sm text-[var(--steel)]">{product.location}</td>
                <td className="money font-black text-[var(--ink)]">{product.quantity}</td>
                <td><StatusPill label={product.status} tone={toneForStatus(product.status)} /></td>
                <td className="text-sm text-[var(--steel)]">{product.lastScanned}</td>
                <td><button className="grid h-9 w-9 place-items-center rounded-full border border-[var(--line)] text-[var(--steel)] hover:border-[var(--signal)] hover:text-[var(--signal)]" aria-label={`Open ${product.name} actions`}><MoreHorizontal className="h-4 w-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-3 md:hidden">
        {products.map((product) => (
          <article key={product.barcode} className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-black text-[var(--ink)]">{product.name}</h3>
                <p className="code mt-1 break-all text-xs text-[var(--steel)]">{product.barcode}</p>
              </div>
              <StatusPill label={product.status} tone={toneForStatus(product.status)} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-[var(--muted)]">Qty</p>
                <p className="money mt-1 font-black">{product.quantity}</p>
              </div>
              <div>
                <p className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-[var(--muted)]">Location</p>
                <p className="mt-1 font-semibold">{product.location}</p>
              </div>
              <div>
                <p className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-[var(--muted)]">Scanned</p>
                <p className="mt-1 font-semibold">{product.lastScanned}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
