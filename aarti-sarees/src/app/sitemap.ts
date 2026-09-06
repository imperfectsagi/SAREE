import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getDbAsync } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/sarees`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/suits`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/categories`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const db = await getDbAsync();

  const [{ results: products }, { results: categories }, { results: blogs }] =
    await Promise.all([
      db
        .prepare(`SELECT slug FROM products WHERE is_published = 1`)
        .all<{ slug: string }>(),
      db
        .prepare(`SELECT slug FROM categories WHERE is_enabled = 1`)
        .all<{ slug: string }>(),
      db
        .prepare(
          `SELECT slug, published_at FROM blog_posts WHERE status = 'published'`
        )
        .all<{ slug: string; published_at: string | null }>(),
    ]);

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/products/${p.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/${c.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogs.map((b) => ({
    url: `${SITE_URL}/blog/${b.slug}`,
    lastModified: b.published_at ?? undefined,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...blogRoutes];
}
