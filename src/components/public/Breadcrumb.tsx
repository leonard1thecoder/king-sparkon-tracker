import Link from "next/link";

export type Crumb = { label: string; href?: string };

export function PublicBreadcrumb({ items }: { items: readonly Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="ks-public ks-wrap py-5 text-sm text-[var(--ks-muted)]">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {item.href ? (
              <Link href={item.href} className="hover:text-[var(--ks-ink)] hover:underline">{item.label}</Link>
            ) : (
              <span aria-current="page" className="font-semibold text-[var(--ks-ink)]">{item.label}</span>
            )}
            {index < items.length - 1 ? <span aria-hidden="true">/</span> : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function breadcrumbJsonLd(items: readonly Crumb[], siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `${siteUrl}${item.href}` } : {}),
    })),
  };
}
