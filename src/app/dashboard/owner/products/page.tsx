import { Plus } from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { ProductTable, type InventoryProduct } from "@/components/inventory/ProductTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";

const products: InventoryProduct[] = [
  { barcode: "KST-6001234567890", name: "Sparkon Premium Lager", location: "Warehouse A", quantity: 184, status: "Healthy", lastScanned: "2 min ago" },
  { barcode: "KST-6001234567814", name: "Returnable Bottle Crate", location: "Counter 02", quantity: 18, status: "Low stock", lastScanned: "11 min ago" },
  { barcode: "KST-6001234567838", name: "Promotion QR Card", location: "Promo Desk", quantity: 72, status: "Review", lastScanned: "24 min ago" },
  { barcode: "KST-6001234567883", name: "Worker Tip QR Stand", location: "Front till", quantity: 46, status: "Healthy", lastScanned: "41 min ago" },
  { barcode: "KST-6001234567807", name: "Supplier Delivery Label", location: "Receiving Bay", quantity: 93, status: "Healthy", lastScanned: "1 hr ago" },
];

export default function OwnerProductsPage() {
  return (
    <>
      <DashboardHeader role="OWNER" title="Inventory products" description="Create products, review barcode capacity, monitor stock quantity, and keep product approval state visible." />
      <main className="grid gap-6 p-5 md:p-8">
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard label="Products" value="18,420" detail="Total active records" tone="confirm" />
          <MetricCard label="Low stock" value="07" detail="Below branch threshold" tone="signal" />
          <MetricCard label="Pending review" value="14" detail="Waiting approval" />
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Product inventory</CardTitle>
              <p className="mt-2 text-sm leading-6 text-[var(--steel)]">Desktop table and mobile cards use the same status language so workers and owners read product state fast.</p>
            </div>
            <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--signal)] bg-[var(--signal)] px-4 text-sm font-bold text-white hover:bg-[var(--ember)]">
              <Plus className="h-4 w-4" /> Add product
            </button>
          </CardHeader>
          <CardContent className="p-0">
            <ProductTable products={products} />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
