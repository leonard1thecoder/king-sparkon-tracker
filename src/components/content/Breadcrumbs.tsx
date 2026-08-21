import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href ? `https://king-sparkon-tracker.com${item.href}` : undefined,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm">
        <Link href="/" className="inline-flex items-center gap-1.5 font-semibold text-[var(--steel)] hover:text-[var(--signal-strong)]">
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">Home</span>
        </Link>
        {items.map((item, i) => (
          <span key={item.label} className="inline-flex items-center gap-1.5">
            <ChevronRight className="h-4 w-4 text-[var(--muted)]" />
            {item.href && i !== items.length - 1 ? (
              <Link href={item.href} className="font-semibold text-[var(--steel)] hover:text-[var(--signal-strong)]">
                {item.label}
              </Link>
            ) : (
              <span className="font-extrabold text-[var(--ink)]" aria-current="page">
                {item.label}
              </span>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}
