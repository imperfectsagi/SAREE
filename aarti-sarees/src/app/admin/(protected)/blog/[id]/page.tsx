import Link from "next/link";
import { BlogForm } from "../BlogForm";

export const metadata = { title: "Edit Blog Post" };

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Link href="/admin/blog" style={{ fontSize: 12.5, color: "var(--admin-text-muted)", textDecoration: "none" }}>
          ← Back to Blog
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>Edit Blog Post</h1>
      </div>
      <BlogForm postId={id} />
    </div>
  );
}
