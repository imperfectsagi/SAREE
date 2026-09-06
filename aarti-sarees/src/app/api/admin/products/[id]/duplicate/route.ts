import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { getDb } from "@/lib/db";
import { generateId } from "@/lib/auth/crypto";

export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth("products.write", async () => {
    const { id } = await params;
    const db = getDb();

    const original = await db
      .prepare(`SELECT * FROM products WHERE id = ?`)
      .bind(id)
      .first<Record<string, unknown>>();

    if (!original) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const newId = generateId();
    const baseSlug = `${original.slug}-copy`;
    let finalSlug = baseSlug;
    let attempt = 0;
    while (
      await db
        .prepare(`SELECT 1 FROM products WHERE slug = ?`)
        .bind(finalSlug)
        .first()
    ) {
      attempt += 1;
      finalSlug = `${baseSlug}-${attempt}`;
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
        )
        SELECT ?, ?, name || ' (Copy)', NULL, description, price, sale_price,
          category_id, subcategory_id, colors, sizes, fabric, occasion, tags,
          availability, badge, video_url, 0, 0, ?
        FROM products WHERE id = ?`
      )
      .bind(newId, finalSlug, sortOrder, id)
      .run();

    // Duplicate image associations (same media, new rows).
    const { results: images } = await db
      .prepare(
        `SELECT media_id, is_primary, sort_order FROM product_images WHERE product_id = ?`
      )
      .bind(id)
      .all<{ media_id: string; is_primary: number; sort_order: number }>();

    if (images.length) {
      const stmts = images.map((img) =>
        db
          .prepare(
            `INSERT INTO product_images (id, product_id, media_id, is_primary, sort_order)
             VALUES (?, ?, ?, ?, ?)`
          )
          .bind(generateId(), newId, img.media_id, img.is_primary, img.sort_order)
      );
      await db.batch(stmts);
    }

    return NextResponse.json({ id: newId, slug: finalSlug }, { status: 201 });
  });
}
