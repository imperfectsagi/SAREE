import "server-only";
import type { BlogPost } from "@/data/blogs";
import { getDb, getDbAsync } from "@/lib/db";

type BlogRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image_url: string | null;
  author: string;
  published_at: string | null;
  category: string | null;
};

const BLOG_SELECT = `
  SELECT b.id, b.slug, b.title, b.excerpt, b.content, m.url AS image_url,
         b.author, b.published_at, b.category
  FROM blog_posts b
  LEFT JOIN media m ON m.id = b.featured_image_id
  WHERE b.status = 'published'
`;

function estimateReadTime(content: string): string {
  const words = content.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min`;
}

function rowToPost(row: BlogRow): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    image: row.image_url ?? "",
    author: row.author,
    date: row.published_at ?? "",
    category: row.category ?? "",
    readTime: estimateReadTime(row.content),
  };
}

export async function getAllBlogPostsDb(): Promise<BlogPost[]> {
  const db = getDb();
  const { results } = await db
    .prepare(`${BLOG_SELECT} ORDER BY b.published_at DESC`)
    .all<BlogRow>();
  return results.map(rowToPost);
}

export async function getBlogPostBySlugDb(
  slug: string
): Promise<BlogPost | undefined> {
  const db = getDb();
  const { results } = await db
    .prepare(`${BLOG_SELECT} AND b.slug = ? LIMIT 1`)
    .bind(slug)
    .all<BlogRow>();
  return results[0] ? rowToPost(results[0]) : undefined;
}

export async function getAllBlogSlugsAsync(): Promise<string[]> {
  const db = await getDbAsync();
  const { results } = await db
    .prepare(`SELECT slug FROM blog_posts WHERE status = 'published'`)
    .all<{ slug: string }>();
  return results.map((r) => r.slug);
}
