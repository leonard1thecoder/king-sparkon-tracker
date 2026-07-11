import type { Metadata } from "next";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { BusinessProductsCatalogue } from "@/components/tuck-shop/BusinessProductsCatalogue";

type BusinessProductsPageProps = {
  params: Promise<{ businessId: string }>;
};

export const metadata: Metadata = {
  title: "Business Products",
  description: "View every Tuck Shop product belonging to one King Sparkon business.",
};

export default async function BusinessProductsPage({ params }: BusinessProductsPageProps) {
  const { businessId } = await params;
  const parsedBusinessId = Number(businessId);

  return (
    <>
      <DashboardHeader role="USER WORKSPACE" title="Business products" description="Browse every available product from the selected business without frontend pagination." />
      <main className="grid gap-6 p-5 md:p-8">
        <BusinessProductsCatalogue businessId={parsedBusinessId} />
      </main>
    </>
  );
}
