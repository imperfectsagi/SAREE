import "server-only";
import type { Category, SubCategory } from "@/data/categories";
import { getDb } from "@/lib/db";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
};

type SubcategoryRow = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
};

export async function getAllCategoriesDb(): Promise<Category[]> {
  const db = getDb();
  const { results: catRows } = await db
    .prepare(
      `SELECT c.id, c.name, c.slug, c.description, m.url AS image_url
       FROM categories c
       LEFT JOIN media m ON m.id = c.image_id
       WHERE c.is_enabled = 1
       ORDER BY c.sort_order ASC`
    )
    .all<CategoryRow>();

  const { results: subRows } = await db
    .prepare(
      `SELECT id, category_id, name, slug FROM subcategories
       WHERE is_enabled = 1 ORDER BY category_id, sort_order ASC`
    )
    .all<SubcategoryRow>();

  const subsByCategory = new Map<string, SubCategory[]>();
  for (const s of subRows) {
    const arr = subsByCategory.get(s.category_id) ?? [];
    arr.push({ id: s.id, name: s.name, slug: s.slug });
    subsByCategory.set(s.category_id, arr);
  }

  return catRows.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? "",
    image: c.image_url ?? "",
    subcategories: subsByCategory.get(c.id) ?? [],
  }));
}

export async function getCategoryBySlugDb(
  slug: string
): Promise<Category | undefined> {
  const categories = await getAllCategoriesDb();
  return categories.find((c) => c.slug === slug);
}
