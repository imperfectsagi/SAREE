import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth("categories.write", async () => {
    const { id } = await params;
    const body = (await req.json()) as {
      name: string;
      description?: string;
      imageId?: string | null;
      isEnabled?: boolean;
    };
    const db = getDb();
    await db
      .prepare(
        `UPDATE categories SET name = ?, description = ?, image_id = ?, is_enabled = ?,
         updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ?`
      )
      .bind(
        body.name.trim(),
        body.description ?? "",
        body.imageId || null,
        body.isEnabled === false ? 0 : 1,
        id
      )
      .run();
    return NextResponse.json({ success: true });
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth("categories.write", async () => {
    const { id } = await params;
    const db = getDb();

    const productCount = await db
      .prepare(`SELECT COUNT(*) as c FROM products WHERE category_id = ?`)
      .bind(id)
      .first<{ c: number }>();

    if (productCount && productCount.c > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete: ${productCount.c} product(s) still use this category. Reassign or delete them first.`,
        },
        { status: 409 }
      );
    }

    await db.prepare(`DELETE FROM categories WHERE id = ?`).bind(id).run();
    return NextResponse.json({ success: true });
  });
}
