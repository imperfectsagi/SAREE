import Link from "next/link";
import { getDb } from "@/lib/db";
import { AdminButton, AdminBadge } from "@/components/admin/ui";
import { BlogRowActions } from "./BlogRowActions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Blog" };

type BlogRow = {
  id: string;
  slug: string;
  title: string;
  status: string;
  published_at: string | null;
  category: string | null;
  thumbnail: string | null;
};

export default async function AdminBlogPage() {
  const db = getDb();
  const { results: posts } = await db
    .prepare(
      `SELECT b.id, b.slug, b.title, b.status, b.published_at, b.category, m.url as thumbnail
       FROM blog_posts b LEFT JOIN media m ON m.id = b.featured_image_id
       ORDER BY b.created_at DESC`
    )
    .all<BlogRow>();

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Blog</h1>
          <p style={{ fontSize: 13, color: "var(--admin-text-muted)" }}>
            {posts.length} post{posts.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link href="/admin/blog/new">
          <AdminButton>+ New Post</AdminButton>
        </Link>
      </div>

      <div
        style={{
          background: "var(--admin-surface)",
          border: "1px solid var(--admin-border)",
          borderRadius: "var(--admin-radius)",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead>
            <tr style={{ background: "var(--admin-surface-hover)", textAlign: "left" }}>
              <th style={th}></th>
              <th style={th}>Title</th>
              <th style={th}>Category</th>
              <th style={th}>Status</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ ...td, textAlign: "center", padding: 40, color: "var(--admin-text-muted)" }}>
                  No blog posts yet.
                </td>
              </tr>
            ) : (
              posts.map((p) => (
                <tr key={p.id} style={{ borderTop: "1px solid var(--admin-border)" }}>
                  <td style={{ ...td, width: 56 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 6, overflow: "hidden", background: "#f1f2f4" }}>
                      {p.thumbnail && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      )}
                    </div>
                  </td>
                  <td style={td}>{p.title}</td>
                  <td style={td}>{p.category || "—"}</td>
                  <td style={td}>
                    {p.status === "published" ? (
                      <AdminBadge tone="success">Published</AdminBadge>
                    ) : (
                      <AdminBadge>Draft</AdminBadge>
                    )}
                  </td>
                  <td style={{ ...td, textAlign: "right" }}>
                    <BlogRowActions id={p.id} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th: React.CSSProperties = {
  padding: "10px 14px",
  fontSize: 11.5,
  fontWeight: 700,
  color: "var(--admin-text-muted)",
  textTransform: "uppercase",
};
const td: React.CSSProperties = { padding: "10px 14px", verticalAlign: "middle" };
