import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth("reviews.write", async () => {
    const { id } = await params;
    const body = (await req.json()) as {
      authorName: string;
      rating: number;
      content: string;
      isPublished: boolean;
    };
    const db = getDb();
    await db
      .prepare(
        `UPDATE reviews SET author_name = ?, rating = ?, content = ?, is_published = ?,
         updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ?`
      )
      .bind(body.authorName.trim(), body.rating, body.content, body.isPublished ? 1 : 0, id)
      .run();
    return NextResponse.json({ success: true });
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth("reviews.write", async () => {
    const { id } = await params;
    const db = getDb();
    await db.prepare(`DELETE FROM reviews WHERE id = ?`).bind(id).run();
    return NextResponse.json({ success: true });
  });
}
