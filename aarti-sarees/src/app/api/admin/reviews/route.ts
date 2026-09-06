import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { getDb } from "@/lib/db";
import { generateId } from "@/lib/auth/crypto";

export const dynamic = "force-dynamic";

export async function GET() {
  return withAuth("reviews.write", async () => {
    const db = getDb();
    const { results } = await db
      .prepare(
        `SELECT r.id, r.author_name, r.rating, r.content, r.is_published, r.created_at,
                p.name as product_name
         FROM reviews r LEFT JOIN products p ON p.id = r.product_id
         ORDER BY r.created_at DESC`
      )
      .all();
    return NextResponse.json({ reviews: results });
  });
}

export async function POST(req: NextRequest) {
  return withAuth("reviews.write", async () => {
    const body = (await req.json()) as {
      productId?: string | null;
      authorName: string;
      rating: number;
      content: string;
      isPublished?: boolean;
    };

    if (!body.authorName?.trim() || !body.rating) {
      return NextResponse.json(
        { error: "Author name and rating are required" },
        { status: 400 }
      );
    }
    if (body.rating < 1 || body.rating > 5) {
      return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
    }

    const db = getDb();
    const id = generateId();
    await db
      .prepare(
        `INSERT INTO reviews (id, product_id, author_name, rating, content, is_published)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        body.productId || null,
        body.authorName.trim(),
        body.rating,
        body.content ?? "",
        body.isPublished ? 1 : 0
      )
      .run();

    return NextResponse.json({ id }, { status: 201 });
  });
}
