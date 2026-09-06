import Image from "next/image";
import Link from "next/link";
import { blogs } from "@/data/blogs";
import { Button } from "@/components/ui/Button";

export function BlogPreview() {
  const latest = blogs.slice(0, 3);

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-semibold">
              From Our Blog
            </h2>
            <p className="mt-1 text-[var(--muted)] text-sm">
              Styling tips, trends & care guides
            </p>
          </div>
          <Link href="/blog">
            <Button variant="outline" size="sm">
              View All Posts
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latest.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex flex-col bg-[var(--surface)] rounded-[var(--radius)] overflow-hidden border border-[var(--border)] hover:shadow-[var(--shadow)] transition-shadow"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  loading="lazy"
                />
              </div>
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-xs text-[var(--muted)] mb-2">
                  <span>{post.category}</span>
                  <span>·</span>
                  <span>{post.readTime} read</span>
                </div>
                <h3 className="font-medium text-base group-hover:text-[var(--primary)] transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--muted)] line-clamp-2 flex-1">
                  {post.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
