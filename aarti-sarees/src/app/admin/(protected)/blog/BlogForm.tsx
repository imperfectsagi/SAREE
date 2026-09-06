"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminButton,
  AdminInput,
  AdminTextarea,
  AdminSelect,
  AdminLabel,
  AdminCard,
} from "@/components/admin/ui";

type BlogFormValue = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string;
  status: "draft" | "published";
  seoTitle: string;
  seoDescription: string;
  featuredImageId: string;
  featuredImageUrl: string;
};

const emptyForm: BlogFormValue = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "",
  tags: "",
  status: "draft",
  seoTitle: "",
  seoDescription: "",
  featuredImageId: "",
  featuredImageUrl: "",
};

export function BlogForm({ postId }: { postId?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<BlogFormValue>(emptyForm);
  const [loading, setLoading] = useState(Boolean(postId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) return;
    fetch(`/api/admin/blog/${postId}`)
      .then((r) => r.json() as Promise<{ post: Record<string, unknown> }>)
      .then(({ post }) => {
        setForm({
          title: String(post.title ?? ""),
          slug: String(post.slug ?? ""),
          excerpt: String(post.excerpt ?? ""),
          content: String(post.content ?? ""),
          category: String(post.category ?? ""),
          tags: JSON.parse(String(post.tags ?? "[]")).join(", "),
          status: (post.status as "draft" | "published") ?? "draft",
          seoTitle: String(post.seo_title ?? ""),
          seoDescription: String(post.seo_description ?? ""),
          featuredImageId: post.featured_image_id ? String(post.featured_image_id) : "",
          featuredImageUrl: "",
        });
      })
      .finally(() => setLoading(false));
  }, [postId]);

  const handleImageUpload = async (file: File | null) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/media/upload", { method: "POST", body: fd });
    const data = (await res.json()) as { id?: string; url?: string; error?: string };
    if (!res.ok || !data.id || !data.url) {
      setError(data.error || "Upload failed");
      return;
    }
    setForm((f) => ({ ...f, featuredImageId: data.id!, featuredImageUrl: data.url! }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim() || undefined,
      excerpt: form.excerpt,
      content: form.content,
      featuredImageId: form.featuredImageId || null,
      category: form.category,
      tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
      status: form.status,
      seoTitle: form.seoTitle || undefined,
      seoDescription: form.seoDescription || undefined,
    };

    try {
      const res = await fetch(postId ? `/api/admin/blog/${postId}` : "/api/admin/blog", {
        method: postId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Failed to save");
        return;
      }
      router.push("/admin/blog");
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ color: "var(--admin-text-muted)" }}>Loading…</p>;

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div
          style={{
            background: "var(--admin-danger-light)",
            color: "var(--admin-danger)",
            padding: "10px 14px",
            borderRadius: 6,
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <AdminCard title="Content">
            <AdminLabel>Title *</AdminLabel>
            <AdminInput required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <div style={{ height: 14 }} />
            <AdminLabel>Slug</AdminLabel>
            <AdminInput value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            <div style={{ height: 14 }} />
            <AdminLabel>Excerpt</AdminLabel>
            <AdminTextarea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
            <div style={{ height: 14 }} />
            <AdminLabel>Content (HTML)</AdminLabel>
            <AdminTextarea rows={14} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </AdminCard>

          <AdminCard title="SEO">
            <AdminLabel>SEO Title</AdminLabel>
            <AdminInput value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} />
            <div style={{ height: 14 }} />
            <AdminLabel>SEO Description</AdminLabel>
            <AdminTextarea rows={2} value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} />
          </AdminCard>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <AdminCard title="Publish">
            <AdminLabel>Status</AdminLabel>
            <AdminSelect value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "draft" | "published" })}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </AdminSelect>
            <div style={{ height: 16 }} />
            <AdminButton type="submit" disabled={saving}>
              {saving ? "Saving…" : postId ? "Save Changes" : "Create Post"}
            </AdminButton>
          </AdminCard>

          <AdminCard title="Featured Image">
            {form.featuredImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.featuredImageUrl} alt="" style={{ width: "100%", borderRadius: 6, marginBottom: 10 }} />
            )}
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files?.[0] ?? null)} />
          </AdminCard>

          <AdminCard title="Organization">
            <AdminLabel>Category</AdminLabel>
            <AdminInput value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Styling Tips" />
            <div style={{ height: 14 }} />
            <AdminLabel>Tags (comma-separated)</AdminLabel>
            <AdminInput value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          </AdminCard>
        </div>
      </div>
    </form>
  );
}
