import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { getDb } from "@/lib/db";
import { generateId } from "@/lib/auth/crypto";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return withAuth("categories.write", async () => {
    const body = (await req.json()) as { categoryId: string; name: string };
    if (!body.categoryId || !body.name?.trim()) {
      return NextResponse.json(
        { error: "Category and name are required" },
        { status: 400 }
      );
    }

    const db = getDb();
    const id = generateId();
    const slug = slugify(body.name);

    const { results: maxOrderRows } = await db
      .prepare(
        `SELECT COALESCE(MAX(sort_order), -1) + 1 as next FROM subcategories WHERE category_id = ?`
      )
      .bind(body.categoryId)
      .all<{ next: number }>();

    await db
      .prepare(
        `INSERT INTO subcategories (id, category_id, name, slug, is_enabled, sort_order)
         VALUES (?, ?, ?, ?, 1, ?)`
      )
      .bind(id, body.categoryId, body.name.trim(), slug, maxOrderRows[0]?.next ?? 0)
      .run();

    return NextResponse.json({ id, slug }, { status: 201 });
  });
}
