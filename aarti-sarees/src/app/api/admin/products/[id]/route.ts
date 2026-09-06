import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { getDb } from "@/lib/db";
import { generateId } from "@/lib/auth/crypto";

export const dynamic = "force-dynamic";

type ProductUpdateInput = {
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
  imageMediaIds: string[];
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth("products.write", async () => {
    const { id } = await params;
    const db = getDb();
    const product = await db
      .prepare(`SELECT * FROM products WHERE id = ?`)
      .bind(id)
      .first();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const { results: images } = await db
      .prepare(
        `SELECT pi.media_id, m.url, pi.is_primary, pi.sort_order
         FROM product_images pi JOIN media m ON m.id = pi.media_id
         WHERE pi.product_id = ? ORDER BY pi.sort_order ASC`
      )
      .bind(id)
      .all();

    return NextResponse.json({ product, images });
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth("products.write", async () => {
    const { id } = await params;
    const body = (await req.json()) as ProductUpdateInput;
    const db = getDb();

    const existing = await db
      .prepare(`SELECT id FROM products WHERE id = ?`)
      .bind(id)
      .first();
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await db
      .prepare(
        `UPDATE products SET
          name = ?, slug = ?, sku = ?, description = ?, price = ?, sale_price = ?,
          category_id = ?, subcategory_id = ?, colors = ?, sizes = ?, fabric = ?,
          occasion = ?, tags = ?, availability = ?, badge = ?, video_url = ?,
          is_published = ?, is_featured = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
         WHERE id = ?`
      )
      .bind(
        body.name.trim(),
        body.slug?.trim(),
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
        id
      )
      .run();

    // Replace image associations wholesale (simplest correct approach for
    // a shop-owner-facing admin — avoids complex diffing logic).
    await db
      .prepare(`DELETE FROM product_images WHERE product_id = ?`)
      .bind(id)
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

    return NextResponse.json({ success: true });
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth("products.write", async () => {
    const { id } = await params;
    const db = getDb();
    await db.prepare(`DELETE FROM products WHERE id = ?`).bind(id).run();
    return NextResponse.json({ success: true });
  });
}
