import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { getDb } from "@/lib/db";
import { generateId } from "@/lib/auth/crypto";
import { slugify } from "@/lib/utils";

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

export async function GET() {
  return withAuth("blog.write", async () => {
    const db = getDb();
    const { results } = await db
      .prepare(
        `SELECT b.id, b.slug, b.title, b.status, b.published_at, b.category,
                m.url as thumbnail
         FROM blog_posts b LEFT JOIN media m ON m.id = b.featured_image_id
         ORDER BY b.created_at DESC`
      )
      .all();
    return NextResponse.json({ posts: results });
  });
}

export async function POST(req: NextRequest) {
  return withAuth("blog.write", async () => {
    const body = (await req.json()) as BlogInput;
    if (!body.title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const db = getDb();
    const id = generateId();
    const slug = body.slug?.trim() || slugify(body.title);

    let finalSlug = slug;
    let attempt = 0;
    while (
      await db.prepare(`SELECT 1 FROM blog_posts WHERE slug = ?`).bind(finalSlug).first()
    ) {
      attempt += 1;
      finalSlug = `${slug}-${attempt}`;
    }

    const publishedAt =
      body.status === "published" ? new Date().toISOString() : null;

    await db
      .prepare(
        `INSERT INTO blog_posts (
          id, slug, title, excerpt, content, featured_image_id, category, tags,
          status, published_at, seo_title, seo_description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        finalSlug,
        body.title.trim(),
        body.excerpt ?? "",
        body.content ?? "",
        body.featuredImageId || null,
        body.category || null,
        JSON.stringify(body.tags ?? []),
        body.status,
        publishedAt,
        body.seoTitle || null,
        body.seoDescription || null
      )
      .run();

    return NextResponse.json({ id, slug: finalSlug }, { status: 201 });
  });
}
