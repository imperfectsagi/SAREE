import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { getDb } from "@/lib/db";
import { generateId } from "@/lib/auth/crypto";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

type ProductInput = {
  name: string;
  slug?: string;
  sku?: string;
  description: string;
  price: number;
  salePrice?: number | null;
  categoryId: string;
  subcategoryId?: string | null;
  colors: string[];
  sizes: string[];
  fabric: string;
  occasion: string[];
  tags: string[];
  availability: "in-stock" | "low-stock" | "out-of-stock";
  badge?: string | null;
  videoUrl?: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  imageMediaIds: string[]; // ordered; first is primary
};

// GET /api/admin/products — list ALL products (published + unpublished)
// for the admin table, unlike the public repo layer which only returns
// published ones.
export async function GET() {
  return withAuth("products.write", async () => {
    const db = getDb();
    const { results } = await db
      .prepare(
        `SELECT p.id, p.slug, p.name, p.sku, p.price, p.sale_price,
                c.name as category_name, p.availability, p.is_published,
                p.is_featured, p.sort_order,
                (SELECT m.url FROM product_images pi JOIN media m ON m.id = pi.media_id
                 WHERE pi.product_id = p.id ORDER BY pi.sort_order ASC LIMIT 1) as thumbnail
         FROM products p
         JOIN categories c ON c.id = p.category_id
         ORDER BY p.sort_order ASC`
      )
      .all();
    return NextResponse.json({ products: results });
  });
}

export async function POST(req: NextRequest) {
  return withAuth("products.write", async () => {
    const body = (await req.json()) as ProductInput;

    if (!body.name?.trim() || !body.categoryId) {
      return NextResponse.json(
        { error: "Name and category are required" },
        { status: 400 }
      );
    }

    const db = getDb();
    const id = generateId();
    const slug = body.slug?.trim() || slugify(body.name);

    // Ensure slug uniqueness by appending a short suffix if needed.
    let finalSlug = slug;
    let attempt = 0;
    while (
      await db
        .prepare(`SELECT 1 FROM products WHERE slug = ?`)
        .bind(finalSlug)
        .first()
    ) {
      attempt += 1;
      finalSlug = `${slug}-${attempt}`;
    }

    const { results: maxOrderRows } = await db
      .prepare(`SELECT COALESCE(MAX(sort_order), -1) + 1 as next FROM products`)
      .all<{ next: number }>();
    const sortOrder = maxOrderRows[0]?.next ?? 0;

    await db
      .prepare(
        `INSERT INTO products (
          id, slug, name, sku, description, price, sale_price, category_id,
          subcategory_id, colors, sizes, fabric, occasion, tags, availability,
          badge, video_url, is_published, is_featured, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        finalSlug,
        body.name.trim(),
        body.sku?.trim() || null,
        body.description ?? "",
        body.price ?? 0,
        body.salePrice ?? null,
        body.categoryId,
        body.subcategoryId || null,
        JSON.stringify(body.colors ?? []),
        JSON.stringify(body.sizes ?? []),
        body.fabric ?? "",
        JSON.stringify(body.occasion ?? []),
        JSON.stringify(body.tags ?? []),
        body.availability ?? "in-stock",
        body.badge || null,
        body.videoUrl || null,
        body.isPublished ? 1 : 0,
        body.isFeatured ? 1 : 0,
        sortOrder
      )
      .run();

    if (body.imageMediaIds?.length) {
      const stmts = body.imageMediaIds.map((mediaId, idx) =>
        db
          .prepare(
            `INSERT INTO product_images (id, product_id, media_id, is_primary, sort_order)
             VALUES (?, ?, ?, ?, ?)`
          )
          .bind(generateId(), id, mediaId, idx === 0 ? 1 : 0, idx)
      );
      await db.batch(stmts);
    }

    return NextResponse.json({ id, slug: finalSlug }, { status: 201 });
  });
}
