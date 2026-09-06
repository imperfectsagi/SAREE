import "server-only";
import type { Product } from "@/data/products";
import { getDb, getDbAsync } from "@/lib/db";

// Raw row shapes as they come back from D1 (snake_case, JSON-as-TEXT).
type ProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  sale_price: number | null;
  category_slug: "sarees" | "suits";
  subcategory_slug: string | null;
  colors: string;
  sizes: string;
  fabric: string;
  occasion: string;
  availability: "in-stock" | "low-stock" | "out-of-stock";
  badge: Product["badge"] | null;
  is_featured: number;
  created_at: string;
};

type ImageRow = { product_id: string; url: string };

const PRODUCT_SELECT = `
  SELECT
    p.id, p.slug, p.name, p.description, p.price, p.sale_price,
    c.slug AS category_slug, sc.slug AS subcategory_slug,
    p.colors, p.sizes, p.fabric, p.occasion, p.availability, p.badge,
    p.is_featured, p.created_at
  FROM products p
  JOIN categories c ON c.id = p.category_id
  LEFT JOIN subcategories sc ON sc.id = p.subcategory_id
  WHERE p.is_published = 1
`;

function rowToProduct(row: ProductRow, images: string[]): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    price: row.price,
    salePrice: row.sale_price ?? undefined,
    category: row.category_slug,
    subcategory: row.subcategory_slug ?? "",
    colors: JSON.parse(row.colors || "[]"),
    sizes: JSON.parse(row.sizes || "[]"),
    fabric: row.fabric,
    occasion: JSON.parse(row.occasion || "[]"),
    availability: row.availability,
    badge: row.badge ?? undefined,
    images,
    featured: row.is_featured === 1,
    createdAt: row.created_at,
  };
}

async function attachImages(
  db: D1Database,
  rows: ProductRow[]
): Promise<Product[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const placeholders = ids.map(() => "?").join(",");
  const { results } = await db
    .prepare(
      `SELECT pi.product_id, m.url
       FROM product_images pi
       JOIN media m ON m.id = pi.media_id
       WHERE pi.product_id IN (${placeholders})
       ORDER BY pi.product_id, pi.sort_order ASC`
    )
    .bind(...ids)
    .all<ImageRow>();

  const imagesByProduct = new Map<string, string[]>();
  for (const r of results) {
    const arr = imagesByProduct.get(r.product_id) ?? [];
    arr.push(r.url);
    imagesByProduct.set(r.product_id, arr);
  }

  return rows.map((row) =>
    rowToProduct(row, imagesByProduct.get(row.id) ?? [])
  );
}

/** For use in dynamic (SSR) contexts. */
export async function getAllProducts(): Promise<Product[]> {
  const db = getDb();
  const { results } = await db
    .prepare(`${PRODUCT_SELECT} ORDER BY p.sort_order ASC`)
    .all<ProductRow>();
  return attachImages(db, results);
}

export async function getProductBySlugDb(
  slug: string
): Promise<Product | undefined> {
  const db = getDb();
  const { results } = await db
    .prepare(`${PRODUCT_SELECT} AND p.slug = ? LIMIT 1`)
    .bind(slug)
    .all<ProductRow>();
  const [row] = results;
  if (!row) return undefined;
  const [product] = await attachImages(db, [row]);
  return product;
}

export async function getProductsByCategoryDb(
  category: "sarees" | "suits"
): Promise<Product[]> {
  const db = getDb();
  const { results } = await db
    .prepare(`${PRODUCT_SELECT} AND c.slug = ? ORDER BY p.sort_order ASC`)
    .bind(category)
    .all<ProductRow>();
  return attachImages(db, results);
}

export async function getFeaturedProductsDb(): Promise<Product[]> {
  const db = getDb();
  const { results } = await db
    .prepare(
      `${PRODUCT_SELECT} AND p.is_featured = 1 ORDER BY p.sort_order ASC`
    )
    .all<ProductRow>();
  return attachImages(db, results);
}

export async function searchProductsDb(query: string): Promise<Product[]> {
  if (!query.trim()) return [];
  const db = getDb();
  const like = `%${query.trim()}%`;
  const { results } = await db
    .prepare(
      `${PRODUCT_SELECT} AND (
         p.name LIKE ? OR p.description LIKE ? OR p.fabric LIKE ?
         OR c.slug LIKE ? OR sc.slug LIKE ?
       ) ORDER BY p.sort_order ASC`
    )
    .bind(like, like, like, like, like)
    .all<ProductRow>();
  return attachImages(db, results);
}

/** For use in static (SSG/generateStaticParams) contexts at build time. */
export async function getAllProductSlugsAsync(): Promise<string[]> {
  const db = await getDbAsync();
  const { results } = await db
    .prepare(`SELECT slug FROM products WHERE is_published = 1`)
    .all<{ slug: string }>();
  return results.map((r) => r.slug);
}
