import { TuckShopProductDetails } from "@/components/tuck-shop/TuckShopProductDetails";

type ProductDetailsPageProps = {
  params: Promise<{ productId: string }>;
};

export default async function UserProductDetailsPage({ params }: ProductDetailsPageProps) {
  const { productId } = await params;
  return <TuckShopProductDetails productId={productId} />;
}
