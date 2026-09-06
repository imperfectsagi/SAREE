"use client";

import { useEffect, useState } from "react";
import { AdminButton, AdminCard, AdminInput, AdminTextarea, AdminBadge, AdminSelect } from "@/components/admin/ui";

type Review = {
  id: string;
  author_name: string;
  rating: number;
  content: string;
  is_published: number;
  created_at: string;
  product_name: string | null;
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState({ authorName: "", rating: 5, content: "", isPublished: true });
  const [saving, setSaving] = useState(false);

  const load = () => {
    fetch("/api/admin/reviews")
      .then((r) => r.json() as Promise<{ reviews: Review[] }>)
      .then((data) => setReviews(data.reviews))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const addReview = async () => {
    if (!draft.authorName.trim() || !draft.content.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      setDraft({ authorName: "", rating: 5, content: "", isPublished: true });
      load();
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (review: Review) => {
    await fetch(`/api/admin/reviews/${review.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        authorName: review.author_name,
        rating: review.rating,
        content: review.content,
        isPublished: review.is_published !== 1,
      }),
    });
    load();
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Reviews</h1>
      <p style={{ fontSize: 13, color: "var(--admin-text-muted)", marginBottom: 20 }}>
        Add real customer reviews manually. Only published reviews appear on the storefront.
      </p>

      <AdminCard title="Add a Review">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: 14, marginBottom: 12 }}>
          <div>
            <AdminInput
              placeholder="Customer name"
              value={draft.authorName}
              onChange={(e) => setDraft({ ...draft, authorName: e.target.value })}
            />
          </div>
          <AdminSelect
            value={draft.rating}
            onChange={(e) => setDraft({ ...draft, rating: Number(e.target.value) })}
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} ★
              </option>
            ))}
          </AdminSelect>
        </div>
        <AdminTextarea
          rows={3}
          placeholder="Review content"
          value={draft.content}
          onChange={(e) => setDraft({ ...draft, content: e.target.value })}
        />
        <div style={{ height: 10 }} />
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 12 }}>
          <input
            type="checkbox"
            checked={draft.isPublished}
            onChange={(e) => setDraft({ ...draft, isPublished: e.target.checked })}
          />
          Publish immediately
        </label>
        <AdminButton onClick={addReview} disabled={saving}>
          {saving ? "Saving…" : "Add Review"}
        </AdminButton>
      </AdminCard>

      <div style={{ height: 20 }} />

      {loading ? (
        <p style={{ color: "var(--admin-text-muted)" }}>Loading…</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {reviews.map((r) => (
            <AdminCard
              key={r.id}
              actions={
                <div style={{ display: "flex", gap: 6 }}>
                  {r.is_published === 1 ? (
                    <AdminBadge tone="success">Published</AdminBadge>
                  ) : (
                    <AdminBadge>Hidden</AdminBadge>
                  )}
                  <AdminButton size="sm" variant="secondary" onClick={() => togglePublish(r)}>
                    {r.is_published === 1 ? "Unpublish" : "Publish"}
                  </AdminButton>
                  <AdminButton size="sm" variant="danger" onClick={() => deleteReview(r.id)}>
                    Delete
                  </AdminButton>
                </div>
              }
            >
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>
                {r.author_name} — {"★".repeat(r.rating)}
                {r.product_name && (
                  <span style={{ color: "var(--admin-text-muted)", fontWeight: 400 }}> on {r.product_name}</span>
                )}
              </div>
              <p style={{ fontSize: 13, color: "var(--admin-text-muted)", marginTop: 4 }}>{r.content}</p>
            </AdminCard>
          ))}
          {reviews.length === 0 && (
            <p style={{ color: "var(--admin-text-muted)", fontSize: 13 }}>No reviews yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
