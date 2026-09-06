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
    const body = (await req.json()) as { name: string; isEnabled?: boolean };
    const db = getDb();
    await db
      .prepare(`UPDATE subcategories SET name = ?, is_enabled = ? WHERE id = ?`)
      .bind(body.name.trim(), body.isEnabled === false ? 0 : 1, id)
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
    await db.prepare(`DELETE FROM subcategories WHERE id = ?`).bind(id).run();
    return NextResponse.json({ success: true });
  });
}
