import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicBreadcrumb, breadcrumbJsonLd } from "@/components/public/Breadcrumb";
import { ProductCard } from "@/components/public/ProductCard";
import { getPublicProductById, getPublicProducts } from "@/lib/public/data";
import { buildSlug, idFromSlug } from "@/lib/public/slug";
import { formatZar } from "@/lib/public/format";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

const siteUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://king-sparkon-tracker.com").replace(/\/$/, "");

function parseProductId(slug: string) {
  const raw = idFromSlug(slug);
  if (!raw) return null;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const id = parseProductId(slug);
  const product = id ? await getPublicProductById(id) : null;
  if (!product) return { title: "Product not found", robots: { index: false, follow: true } };
  return pageMetadata({
    title: `${product.name} | Mall`,
    description: `${product.name} on King Sparkon Mall${product.businessName ? ` from ${product.businessName}` : ""}.`,
    path: `/mall/products/${buildSlug(product.name, product.id)}`,
  });
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const id = parseProductId(slug);
  const product = id ? await getPublicProductById(id) : null;
  if (!product) notFound();

  const path = `/mall/products/${buildSlug(product.name, product.id)}`;
  const canonicalUrl = `${siteUrl}${path}`;
  const onSale = product.salePrice !== undefined && product.salePrice !== null && product.salePrice < product.price;
  const currentPrice = onSale ? Number(product.salePrice) : Number(product.price);
  const inStock = Number(product.stockQuantity) > 0;
  const related = (await getPublicProducts(12)).filter((item) => item.id !== product.id).slice(0, 3);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    ...(product.productImageUrl?.startsWith("https://") ? { image: product.productImageUrl } : {}),
    category: product.category,
    url: canonicalUrl,
    offers: {
      "@type": "Offer",
      price: currentPrice,
      priceCurrency: "ZAR",
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: canonicalUrl,
    },
  };

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Mall", href: "/mall" },
    { label: product.name },
  ];

  return (
    <>
      <PublicHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(crumbs, siteUrl)).replace(/</g, "\\u003c") }} />
      <main className="ks-public">
        <PublicBreadcrumb items={crumbs} />

        <section className="ks-section pt-4">
          <div className="ks-wrap grid gap-12 lg:grid-cols-2">
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-[var(--ks-radius)] border border-[var(--ks-line)] bg-[var(--ks-light-green)]/40">
              {product.productImageUrl ? (
                <img src={product.productImageUrl} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <span className="ks-float block h-24 w-24 rounded-[14px] border-2 border-[var(--ks-ink)] bg-[var(--ks-yellow)]" aria-hidden="true" />
              )}
            </div>

            <div>
              <p className="ks-eyebrow">{product.businessName ?? product.category}</p>
              <h1 className="ks-h1 mt-3 text-[clamp(1.9rem,4vw,3rem)]">{product.name}</h1>
              <div className="mt-6 flex items-baseline gap-3">
                <span className="text-3xl font-extrabold">{formatZar(currentPrice)}</span>
                {onSale ? <span className="text-lg text-[var(--ks-muted)] line-through">{formatZar(product.price)}</span> : null}
              </div>
              <p className="mt-4">
                <span className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ${inStock ? "bg-[var(--ks-light-green)]" : "bg-[var(--ks-line)] text-[var(--ks-muted)]"}`}>
                  {inStock ? "In stock" : "Out of stock"}
                </span>
              </p>
              <dl className="mt-8 grid gap-4 text-sm sm:grid-cols-2">
                <div className="ks-card">
                  <dt className="ks-eyebrow">Category</dt>
                  <dd className="mt-2 font-bold">{product.category}</dd>
                </div>
                {product.businessName ? (
                  <div className="ks-card">
                    <dt className="ks-eyebrow">Business</dt>
                    <dd className="mt-2 font-bold">{product.businessName}</dd>
                  </div>
                ) : null}
              </dl>
              <Link href={`/login?next=${encodeURIComponent(path)}`} className="ks-btn ks-btn-primary mt-8">
                Sign in to buy
              </Link>
            </div>
          </div>
        </section>

        {related.length > 0 ? (
          <section className="ks-section border-t border-[var(--ks-line)] pb-24">
            <div className="ks-wrap">
              <h2 className="ks-h2">Related products</h2>
              <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((item) => (
                  <li key={item.id}>
                    <ProductCard product={item} />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}
      </main>
    </>
  );
}
