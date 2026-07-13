import type { Metadata } from "next";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { OwnerProductTransactions } from "@/components/tuck-shop/OwnerProductTransactions";

export const metadata: Metadata = {
  title: "Owner Product Transactions",
  description: "Product purchases grouped by product with cash, card and King Sparkon App payment details.",
};

export default function OwnerTransactionsPage() {
  return (
    <>
      <DashboardHeader role="OWNER" title="Product Transactions" description="Review products as a sales catalogue, open each product’s purchases, and confirm whether every transaction was paid by cash, card machine or King Sparkon App." />
      <main className="grid gap-6 p-5 md:p-8">
        <OwnerProductTransactions />
      </main>
    </>
  );
}
