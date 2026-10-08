// Pure helpers. Safe to import from both server and client components.

export function slugify(value: string) {
  return (
    value
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "item"
  );
}

// The backend exposes no slug. A slug is "<name>--<id>". Splitting on the
// last "--" recovers the id even when the id itself contains hyphens.
export function buildSlug(name: string, id: string | number) {
  return `${slugify(name)}--${id}`;
}

export function idFromSlug(slug: string) {
  const index = slug.lastIndexOf("--");
  if (index === -1) return null;
  const id = slug.slice(index + 2);
  return id.length > 0 ? id : null;
}
