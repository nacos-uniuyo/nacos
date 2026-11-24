/**
 * URL-friendly slug generator with a random suffix to guarantee uniqueness
 * across member-submitted project proposals and opportunity listings.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateUniqueSlug(title: string): string {
  const base = slugify(title).slice(0, 100) || "item";
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return `${base}-${randomSuffix}`;
}
