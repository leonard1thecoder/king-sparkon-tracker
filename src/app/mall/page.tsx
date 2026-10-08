import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicBreadcrumb } from "@/components/public/Breadcrumb";
import { ProductCard } from "@/components/public/ProductCard";
import { Reveal, Scene } from "@/components/public/InView";
import { getPublicProducts } from "@/lib/public/data";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "King Sparkon Mall | Products & Event Commerce",
    description: "Explore products and connected commerce through King Sparkon Mall.",
    path: "/mall",
  }),
  title: { absolute: "King Sparkon Mall | Products & Event Commerce" },
};

export const revalidate = 300;

export default async function MallPage() {
  const products = await getPublicProducts(48);
  const featured = products.slice(0, 6);

  const categoryCounts = new Map<string, number>();
  for (const product of products) {
    const key = product.category || "Other";
    categoryCounts.set(key, (categoryCounts.get(key) ?? 0) + 1);
  }
  const categories = [...categoryCounts.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <>
      <PublicHeader />
      <main className="ks-public">
        <PublicBreadcrumb items={[{ label: "Home", href: "/" }, { label: "Mall" }]} />

        <section className="ks-section pt-4">
          <div className="ks-wrap grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
            <div>
              <p className="ks-eyebrow">Mall</p>
              <h1 className="ks-h1 mt-3">King Sparkon Mall</h1>
              <p className="ks-lead mt-5">
                Products from connected businesses, checked out online or at the counter, with stock and records kept together.
              </p>
            </div>
            <Scene className="relative h-56">
              {[
                { left: "8%", top: "12%", delay: "0s", tone: "bg-[var(--ks-yellow)]" },
                { left: "40%", top: "4%", delay: "-2s", tone: "bg-[var(--ks-light-green)]" },
                { left: "70%", top: "20%", delay: "-4s", tone: "bg-[var(--ks-sky)]" },
                { left: "24%", top: "56%", delay: "-1s", tone: "bg-[var(--ks-light-green)]" },
                { left: "58%", top: "58%", delay: "-3s", tone: "bg-[var(--ks-yellow)]" },
              ].map((box, index) => (
                <span
                  key={index}
                  className={`ks-float absolute block h-14 w-14 rounded-[10px] border-2 border-[var(--ks-ink)] ${box.tone}`}
                  style={{ left: box.left, top: box.top, animationDelay: box.delay }}
                  aria-hidden="true"
                />
              ))}
            </Scene>
          </div>
        </section>

        {products.length === 0 ? (
          <section className="ks-section border-t border-[var(--ks-line)] pb-24">
            <div className="ks-wrap rounded-[var(--ks-radius)] border border-dashed border-[var(--ks-line)] px-6 py-16 text-center">
              <p className="text-xl font-extrabold">The Mall is being stocked.</p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--ks-muted)]">
                Products appear here as businesses list them. Check back soon.
              </p>
              <Link href="/register" className="ks-btn ks-btn-secondary mt-6">Register</Link>
            </div>
          </section>
        ) : (
          <>
            <section className="ks-section border-t border-[var(--ks-line)]">
              <div className="ks-wrap">
                <Reveal>
                  <h2 className="ks-h2">Featured Products</h2>
                </Reveal>
                <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {featured.map((product) => (
                    <li key={product.id}>
                      <ProductCard product={product} />
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="ks-section border-t border-[var(--ks-line)]">
              <div className="ks-wrap grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
                <Reveal>
                  <h2 className="ks-h2">Categories</h2>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {categories.map(([name, count]) => (
                      <li key={name} className="rounded-full border border-[var(--ks-line)] ks-surface px-4 py-2 text-sm font-semibold">
                        {name} <span className="text-[var(--ks-muted)]">· {count}</span>
                      </li>
                    ))}
                  </ul>
                </Reveal>
                <Reveal>
                  <h2 className="ks-h2">Explore Products</h2>
                  <ul className="mt-6 grid gap-5 sm:grid-cols-2">
                    {products.map((product) => (
                      <li key={product.id}>
                        <ProductCard product={product} />
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </div>
            </section>
          </>
        )}

        <section className="ks-section border-t border-[var(--ks-line)] pb-24">
          <div className="ks-wrap grid gap-10 md:grid-cols-3">
            <Reveal>
              <p className="ks-eyebrow">How Mall works</p>
              <h2 className="ks-h2 mt-3">From the shelf to the collection point.</h2>
            </Reveal>
            <Reveal>
              <p className="font-bold">Choose</p>
              <p className="mt-2 text-sm leading-6 text-[var(--ks-muted)]">Browse products and add what you need to your cart.</p>
            </Reveal>
            <Reveal>
              <p className="font-bold">Pay and collect</p>
              <p className="mt-2 text-sm leading-6 text-[var(--ks-muted)]">Checkout confirms payment. Collect at the counter or at the event.</p>
            </Reveal>
          </div>
        </section>
      </main>
    </>
  );
}
