import type { Metadata } from "next";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { OwnerTuckShopProductManager } from "@/components/tuck-shop/OwnerTuckShopProductManager";

export const metadata: Metadata = {
  title: "Owner Products & Tuck Shop",
  description: "Owner product workspace for product creation, local photo uploads, barcode capacity, stock state, and King Sparkon Tuck Shop readiness.",
};

export default function OwnerProductsPage() {
  return (
    <>
      <DashboardHeader role="OWNER" title="Inventory products & Tuck Shop" description="Create products on the existing inventory model, choose product photos from your device, review barcode capacity, and make stock visible in King Sparkon Tuck Shop." />
      <main className="grid gap-6 p-5 md:p-8">
        <OwnerTuckShopProductManager />
      </main>
    </>
  );
}
