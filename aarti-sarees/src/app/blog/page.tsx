import Image from "next/image";
import Link from "next/link";
import { getAllBlogPostsDb } from "@/lib/repo/blog";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Blog",
  description:
    "Styling tips, wedding trends, saree care guides and ethnic fashion inspiration from Aarti Sarees.",
};

export default async function BlogPage() {
  const blogs = await getAllBlogPostsDb();

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 md:py-14">
      <h1 className="text-2xl md:text-3xl font-serif font-semibold mb-2">
        Our Blog
      </h1>
      <p className="text-[var(--muted)] mb-10">
        Styling tips, trends & care guides
      </p>

      {blogs.length === 0 ? (
        <p className="text-[var(--muted)] py-12 text-center">
          No blog posts published yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {blogs.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group flex flex-col sm:flex-row gap-4 bg-[var(--surface)] rounded-[var(--radius)] overflow-hidden border border-[var(--border)] hover:shadow-[var(--shadow)] transition-shadow"
          >
            <div className="relative w-full sm:w-48 md:w-56 aspect-[16/10] sm:aspect-auto sm:h-auto flex-shrink-0 overflow-hidden">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, 224px"
                loading="lazy"
              />
            </div>
            <div className="p-4 sm:py-5 sm:pr-5 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-xs text-[var(--muted)] mb-2">
                <span>{post.category}</span>
                <span>·</span>
                <span>{post.readTime}</span>
                <span>·</span>
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </time>
              </div>
              <h2 className="font-semibold text-lg group-hover:text-[var(--primary)] transition-colors line-clamp-2">
                {post.title}
              </h2>
              <p className="mt-2 text-sm text-[var(--muted)] line-clamp-2">
                {post.excerpt}
              </p>
            </div>
          </Link>
        ))}
        </div>
      )}
    </div>
  );
}
