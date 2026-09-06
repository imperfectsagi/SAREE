import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

type BlogInput = {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  featuredImageId?: string | null;
  category?: string;
  tags: string[];
  status: "draft" | "published";
  seoTitle?: string;
  seoDescription?: string;
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth("blog.write", async () => {
    const { id } = await params;
    const db = getDb();
    const post = await db
      .prepare(`SELECT * FROM blog_posts WHERE id = ?`)
      .bind(id)
      .first();
    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ post });
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth("blog.write", async () => {
    const { id } = await params;
    const body = (await req.json()) as BlogInput;
    const db = getDb();

    const existing = await db
      .prepare(`SELECT status, published_at FROM blog_posts WHERE id = ?`)
      .bind(id)
      .first<{ status: string; published_at: string | null }>();
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Set published_at the first time a post transitions to published;
    // keep it stable on subsequent edits.
    const publishedAt =
      body.status === "published"
        ? existing.published_at ?? new Date().toISOString()
        : null;

    await db
      .prepare(
        `UPDATE blog_posts SET
          title = ?, slug = ?, excerpt = ?, content = ?, featured_image_id = ?,
          category = ?, tags = ?, status = ?, published_at = ?, seo_title = ?,
          seo_description = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
         WHERE id = ?`
      )
      .bind(
        body.title.trim(),
        body.slug?.trim(),
        body.excerpt ?? "",
        body.content ?? "",
        body.featuredImageId || null,
        body.category || null,
        JSON.stringify(body.tags ?? []),
        body.status,
        publishedAt,
        body.seoTitle || null,
        body.seoDescription || null,
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
  return withAuth("blog.write", async () => {
    const { id } = await params;
    const db = getDb();
    await db.prepare(`DELETE FROM blog_posts WHERE id = ?`).bind(id).run();
    return NextResponse.json({ success: true });
  });
}
