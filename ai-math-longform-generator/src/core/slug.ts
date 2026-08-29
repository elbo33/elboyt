// Slugs stay ASCII even though titles are Polish: fold the diacritics first
// (ł/Ł have no NFD decomposition, so map them explicitly), then strip.
export function slugify(input: string): string {
  return (
    input
      .replace(/ł/g, "l")
      .replace(/Ł/g, "L")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "math-short"
  );
}
