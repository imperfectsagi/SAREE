import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { getDb } from "@/lib/db";
import { generateId } from "@/lib/auth/crypto";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  return withAuth("products.write", async () => {
    const db = getDb();
    const { results: categories } = await db
      .prepare(
        `SELECT id, name, slug, description, image_id, is_enabled, sort_order
         FROM categories ORDER BY sort_order ASC`
      )
      .all();
    const { results: subcategories } = await db
      .prepare(
        `SELECT id, category_id, name, slug, is_enabled, sort_order
         FROM subcategories ORDER BY category_id, sort_order ASC`
      )
      .all();
    return NextResponse.json({ categories, subcategories });
  });
}

export async function POST(req: NextRequest) {
  return withAuth("categories.write", async () => {
    const body = (await req.json()) as {
      name: string;
      description?: string;
      imageId?: string | null;
    };
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const db = getDb();
    const id = generateId();
    const slug = slugify(body.name);

    const { results: maxOrderRows } = await db
      .prepare(`SELECT COALESCE(MAX(sort_order), -1) + 1 as next FROM categories`)
      .all<{ next: number }>();

    await db
      .prepare(
        `INSERT INTO categories (id, name, slug, description, image_id, is_enabled, sort_order)
         VALUES (?, ?, ?, ?, ?, 1, ?)`
      )
      .bind(id, body.name.trim(), slug, body.description ?? "", body.imageId || null, maxOrderRows[0]?.next ?? 0)
      .run();

    return NextResponse.json({ id, slug }, { status: 201 });
  });
}
