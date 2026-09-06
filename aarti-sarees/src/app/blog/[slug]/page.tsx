import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPostBySlugDb } from "@/lib/repo/blog";

// Admin-editable content — always render fresh from D1 rather than at
// build time, so publishing a post in Admin shows up immediately.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlugDb(slug);
  if (!post) return { title: "Post Not Found" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.image ? [{ url: post.image }] : undefined,
    },
  };
}

function blogJsonLd(post: NonNullable<Awaited<ReturnType<typeof getBlogPostBySlugDb>>>) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.image ? [post.image] : undefined,
    author: { "@type": "Organization", name: post.author },
    datePublished: post.date || undefined,
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlugDb(slug);
  if (!post) notFound();

  return (
    <article className="max-w-3xl mx-auto px-4 py-10 md:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd(post)) }}
      />
      <nav className="text-sm text-[var(--muted)] mb-6">
        <Link href="/blog" className="hover:text-[var(--primary)]">
          Blog
        </Link>
        <span className="mx-1">/</span>
        <span className="text-[var(--text)]">{post.title}</span>
      </nav>

      <div className="flex items-center gap-2 text-xs text-[var(--muted)] mb-4">
        <span className="text-[var(--primary)] font-medium">
          {post.category}
        </span>
        <span>·</span>
        <span>{post.readTime} read</span>
        <span>·</span>
        <time dateTime={post.date}>
          {new Date(post.date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </time>
      </div>

      <h1 className="text-2xl md:text-4xl font-serif font-semibold leading-tight mb-6">
        {post.title}
      </h1>

      <div className="relative aspect-[16/9] rounded-[var(--radius)] overflow-hidden mb-8">
        <Image
          src={post.image}
          alt={post.title}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 768px"
        />
      </div>

      <div
        className="prose prose-sm sm:prose max-w-none text-[var(--text)]
          [&_h3]:font-serif [&_h3]:text-xl [&_h3]:mt-8 [&_h3]:mb-3
          [&_p]:text-[var(--muted)] [&_p]:leading-relaxed [&_p]:mb-4"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      <div className="mt-10 pt-6 border-t border-[var(--border)] text-sm text-[var(--muted)]">
        Written by {post.author}
      </div>
    </article>
  );
}
