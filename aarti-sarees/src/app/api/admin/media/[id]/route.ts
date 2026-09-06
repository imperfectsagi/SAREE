import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { getDb, getMediaBucket } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth("media.write", async () => {
    const { id } = await params;
    const db = getDb();

    const row = await db
      .prepare(`SELECT r2_key FROM media WHERE id = ?`)
      .bind(id)
      .first<{ r2_key: string }>();

    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Check usage before deleting to avoid orphaned references breaking pages.
    const usage = await db
      .prepare(
        `SELECT
          (SELECT COUNT(*) FROM product_images WHERE media_id = ?) +
          (SELECT COUNT(*) FROM categories WHERE image_id = ?) +
          (SELECT COUNT(*) FROM subcategories WHERE image_id = ?) +
          (SELECT COUNT(*) FROM banners WHERE desktop_media_id = ? OR mobile_media_id = ? OR poster_media_id = ?) +
          (SELECT COUNT(*) FROM blog_posts WHERE featured_image_id = ?) as usage_count`
      )
      .bind(id, id, id, id, id, id, id)
      .first<{ usage_count: number }>();

    if (usage && usage.usage_count > 0) {
      return NextResponse.json(
        {
          error: `This file is used in ${usage.usage_count} place(s) (product, banner, category, or blog post). Remove it from those first.`,
        },
        { status: 409 }
      );
    }

    const bucket = getMediaBucket();
    await bucket.delete(row.r2_key);
    await db.prepare(`DELETE FROM media WHERE id = ?`).bind(id).run();

    return NextResponse.json({ success: true });
  });
}
