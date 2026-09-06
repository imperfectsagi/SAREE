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

type Category = { id: string; name: string; slug: string };
type Subcategory = { id: string; category_id: string; name: string; slug: string };
type UploadedImage = { mediaId: string; url: string };

type ProductFormValue = {
  id?: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: string;
  salePrice: string;
  categoryId: string;
  subcategoryId: string;
  colors: string;
  sizes: string;
  fabric: string;
  occasion: string;
  tags: string;
  availability: "in-stock" | "low-stock" | "out-of-stock";
  badge: string;
  videoUrl: string;
  isPublished: boolean;
  isFeatured: boolean;
  images: UploadedImage[];
};

const emptyForm: ProductFormValue = {
  name: "",
  slug: "",
  sku: "",
  description: "",
  price: "",
  salePrice: "",
  categoryId: "",
  subcategoryId: "",
  colors: "",
  sizes: "",
  fabric: "",
  occasion: "",
  tags: "",
  availability: "in-stock",
  badge: "",
  videoUrl: "",
  isPublished: true,
  isFeatured: false,
  images: [],
};

export function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormValue>(emptyForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(Boolean(productId));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json() as Promise<{ categories: Category[]; subcategories: Subcategory[] }>)
      .then((data) => {
        setCategories(data.categories);
        setSubcategories(data.subcategories);
        setForm((f) => (f.categoryId ? f : { ...f, categoryId: data.categories[0]?.id ?? "" }));
      });
  }, []);

  useEffect(() => {
    if (!productId) return;
    fetch(`/api/admin/products/${productId}`)
      .then(
        (r) =>
          r.json() as Promise<{
            product: Record<string, unknown>;
            images: { media_id: string; url: string }[];
          }>
      )
      .then((data) => {
        const p = data.product;
        setForm({
          id: productId,
          name: String(p.name ?? ""),
          slug: String(p.slug ?? ""),
          sku: String(p.sku ?? ""),
          description: String(p.description ?? ""),
          price: String(p.price ?? ""),
          salePrice: p.sale_price != null ? String(p.sale_price) : "",
          categoryId: String(p.category_id ?? ""),
          subcategoryId: p.subcategory_id ? String(p.subcategory_id) : "",
          colors: JSON.parse(String(p.colors ?? "[]")).join(", "),
          sizes: JSON.parse(String(p.sizes ?? "[]")).join(", "),
          fabric: String(p.fabric ?? ""),
          occasion: JSON.parse(String(p.occasion ?? "[]")).join(", "),
          tags: JSON.parse(String(p.tags ?? "[]")).join(", "),
          availability: (p.availability as ProductFormValue["availability"]) ?? "in-stock",
          badge: String(p.badge ?? ""),
          videoUrl: String(p.video_url ?? ""),
          isPublished: p.is_published === 1,
          isFeatured: p.is_featured === 1,
          images: data.images.map((img) => ({ mediaId: img.media_id, url: img.url })),
        });
      })
      .finally(() => setLoading(false));
  }, [productId]);

  const filteredSubcategories = subcategories.filter(
    (s) => s.category_id === form.categoryId
  );

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded: UploadedImage[] = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/media/upload", { method: "POST", body: fd });
        const data = (await res.json()) as { id?: string; url?: string; error?: string };
        if (!res.ok || !data.id || !data.url) {
          throw new Error(data.error || "Upload failed");
        }
        uploaded.push({ mediaId: data.id, url: data.url });
      }
      setForm((f) => ({ ...f, images: [...f.images, ...uploaded] }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (mediaId: string) => {
    setForm((f) => ({ ...f, images: f.images.filter((img) => img.mediaId !== mediaId) }));
  };

  const setPrimary = (mediaId: string) => {
    setForm((f) => {
      const img = f.images.find((i) => i.mediaId === mediaId);
      if (!img) return f;
      return { ...f, images: [img, ...f.images.filter((i) => i.mediaId !== mediaId)] };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || undefined,
      sku: form.sku.trim() || undefined,
      description: form.description,
      price: Number(form.price) || 0,
      salePrice: form.salePrice ? Number(form.salePrice) : null,
      categoryId: form.categoryId,
      subcategoryId: form.subcategoryId || null,
      colors: form.colors.split(",").map((s) => s.trim()).filter(Boolean),
      sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      fabric: form.fabric,
      occasion: form.occasion.split(",").map((s) => s.trim()).filter(Boolean),
      tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
      availability: form.availability,
      badge: form.badge || null,
      videoUrl: form.videoUrl || null,
      isPublished: form.isPublished,
      isFeatured: form.isFeatured,
      imageMediaIds: form.images.map((img) => img.mediaId),
    };

    try {
      const res = await fetch(
        productId ? `/api/admin/products/${productId}` : "/api/admin/products",
        {
          method: productId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Failed to save product");
        return;
      }
      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p style={{ color: "var(--admin-text-muted)" }}>Loading…</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div
          style={{
            background: "var(--admin-danger-light)",
            color: "var(--admin-danger)",
            padding: "10px 14px",
            borderRadius: "var(--admin-radius-sm)",
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <AdminCard title="Basic Information">
            <AdminLabel>Product Name *</AdminLabel>
            <AdminInput
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Banarasi Silk Maroon Gold Zari"
            />

            <div style={{ height: 14 }} />
            <AdminLabel>Slug (auto-generated if left blank)</AdminLabel>
            <AdminInput
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="banarasi-silk-maroon-gold"
            />

            <div style={{ height: 14 }} />
            <AdminLabel>Description</AdminLabel>
            <AdminTextarea
              rows={5}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </AdminCard>

          <AdminCard title="Images">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                gap: 10,
                marginBottom: 12,
              }}
            >
              {form.images.map((img, idx) => (
                <div
                  key={img.mediaId}
                  style={{
                    position: "relative",
                    aspectRatio: "1",
                    borderRadius: 6,
                    overflow: "hidden",
                    border: idx === 0 ? "2px solid var(--admin-primary)" : "1px solid var(--admin-border)",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  {idx === 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: 3,
                        left: 3,
                        fontSize: 9.5,
                        fontWeight: 700,
                        background: "var(--admin-primary)",
                        color: "#fff",
                        padding: "1px 5px",
                        borderRadius: 4,
                      }}
                    >
                      PRIMARY
                    </span>
                  )}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      display: "flex",
                      gap: 2,
                      padding: 3,
                      background: "rgba(0,0,0,0.55)",
                    }}
                  >
                    {idx !== 0 && (
                      <button
                        type="button"
                        onClick={() => setPrimary(img.mediaId)}
                        style={{ fontSize: 9.5, color: "#fff", background: "none", border: "none", cursor: "pointer" }}
                      >
                        Set primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(img.mediaId)}
                      style={{ fontSize: 9.5, color: "#fca5a5", background: "none", border: "none", cursor: "pointer", marginLeft: "auto" }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleImageUpload(e.target.files)}
                disabled={uploading}
                style={{ fontSize: 12.5 }}
              />
            </label>
            {uploading && (
              <p style={{ fontSize: 12, color: "var(--admin-text-muted)", marginTop: 6 }}>
                Uploading…
              </p>
            )}
          </AdminCard>

          <AdminCard title="Attributes">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <AdminLabel>Colors (comma-separated)</AdminLabel>
                <AdminInput
                  value={form.colors}
                  onChange={(e) => setForm({ ...form, colors: e.target.value })}
                  placeholder="Maroon, Gold"
                />
              </div>
              <div>
                <AdminLabel>Sizes (comma-separated)</AdminLabel>
                <AdminInput
                  value={form.sizes}
                  onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                  placeholder="Free Size, S, M, L"
                />
              </div>
              <div>
                <AdminLabel>Fabric</AdminLabel>
                <AdminInput
                  value={form.fabric}
                  onChange={(e) => setForm({ ...form, fabric: e.target.value })}
                  placeholder="Banarasi Silk"
                />
              </div>
              <div>
                <AdminLabel>Occasion (comma-separated)</AdminLabel>
                <AdminInput
                  value={form.occasion}
                  onChange={(e) => setForm({ ...form, occasion: e.target.value })}
                  placeholder="Wedding, Festive"
                />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <AdminLabel>Tags (comma-separated)</AdminLabel>
                <AdminInput
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="bestseller, new-arrival"
                />
              </div>
            </div>
          </AdminCard>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <AdminCard title="Publish">
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, fontSize: 13 }}>
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
              />
              Published (visible on storefront)
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
              />
              Featured (shown on homepage)
            </label>

            <div style={{ height: 16 }} />
            <AdminButton type="submit" disabled={saving}>
              {saving ? "Saving…" : productId ? "Save Changes" : "Create Product"}
            </AdminButton>
          </AdminCard>

          <AdminCard title="Pricing & SKU">
            <AdminLabel>Price (₹) *</AdminLabel>
            <AdminInput
              required
              type="number"
              min={0}
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
            <div style={{ height: 14 }} />
            <AdminLabel>Sale Price (₹, optional)</AdminLabel>
            <AdminInput
              type="number"
              min={0}
              value={form.salePrice}
              onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
            />
            <div style={{ height: 14 }} />
            <AdminLabel>SKU</AdminLabel>
            <AdminInput
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              placeholder="Auto-generated if blank"
            />
          </AdminCard>

          <AdminCard title="Category & Stock">
            <AdminLabel>Category *</AdminLabel>
            <AdminSelect
              required
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value, subcategoryId: "" })}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </AdminSelect>

            <div style={{ height: 14 }} />
            <AdminLabel>Subcategory</AdminLabel>
            <AdminSelect
              value={form.subcategoryId}
              onChange={(e) => setForm({ ...form, subcategoryId: e.target.value })}
            >
              <option value="">None</option>
              {filteredSubcategories.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </AdminSelect>

            <div style={{ height: 14 }} />
            <AdminLabel>Availability</AdminLabel>
            <AdminSelect
              value={form.availability}
              onChange={(e) =>
                setForm({ ...form, availability: e.target.value as ProductFormValue["availability"] })
              }
            >
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </AdminSelect>

            <div style={{ height: 14 }} />
            <AdminLabel>Badge</AdminLabel>
            <AdminSelect
              value={form.badge}
              onChange={(e) => setForm({ ...form, badge: e.target.value })}
            >
              <option value="">None</option>
              <option value="New">New</option>
              <option value="Sale">Sale</option>
              <option value="Bestseller">Bestseller</option>
              <option value="Limited">Limited</option>
            </AdminSelect>
          </AdminCard>

          <AdminCard title="Video (optional)">
            <AdminLabel>Video URL</AdminLabel>
            <AdminInput
              value={form.videoUrl}
              onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
              placeholder="Uploaded via Media Library"
            />
          </AdminCard>
        </div>
      </div>
    </form>
  );
}
