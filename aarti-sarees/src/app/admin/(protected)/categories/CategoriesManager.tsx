"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminButton, AdminInput, AdminCard, AdminBadge } from "@/components/admin/ui";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_enabled: number;
};
type Subcategory = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  is_enabled: number;
};

export function CategoriesManager({
  initialCategories,
  initialSubcategories,
}: {
  initialCategories: Category[];
  initialSubcategories: Subcategory[];
}) {
  const router = useRouter();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSubName, setNewSubName] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const addCategory = async () => {
    if (!newCategoryName.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });
      setNewCategoryName("");
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const addSubcategory = async (categoryId: string) => {
    const name = newSubName[categoryId]?.trim();
    if (!name) return;
    setSaving(true);
    try {
      await fetch("/api/admin/subcategories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, name }),
      });
      setNewSubName((s) => ({ ...s, [categoryId]: "" }));
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = async (cat: Category) => {
    await fetch(`/api/admin/categories/${cat.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: cat.name,
        description: cat.description,
        isEnabled: cat.is_enabled !== 1,
      }),
    });
    router.refresh();
  };

  const toggleSubcategory = async (sub: Subcategory) => {
    await fetch(`/api/admin/subcategories/${sub.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: sub.name, isEnabled: sub.is_enabled !== 1 }),
    });
    router.refresh();
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Delete this category? Products using it must be reassigned first.")) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      alert(data.error || "Failed to delete");
      return;
    }
    router.refresh();
  };

  const deleteSubcategory = async (id: string) => {
    if (!confirm("Delete this subcategory?")) return;
    await fetch(`/api/admin/subcategories/${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {initialCategories.map((cat) => {
        const subs = initialSubcategories.filter((s) => s.category_id === cat.id);
        return (
          <AdminCard
            key={cat.id}
            title={cat.name}
            actions={
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {cat.is_enabled === 1 ? (
                  <AdminBadge tone="success">Enabled</AdminBadge>
                ) : (
                  <AdminBadge>Disabled</AdminBadge>
                )}
                <AdminButton size="sm" variant="secondary" onClick={() => toggleCategory(cat)}>
                  {cat.is_enabled === 1 ? "Disable" : "Enable"}
                </AdminButton>
                <AdminButton size="sm" variant="danger" onClick={() => deleteCategory(cat.id)}>
                  Delete
                </AdminButton>
              </div>
            }
          >
            <p style={{ fontSize: 12.5, color: "var(--admin-text-muted)", marginBottom: 12 }}>
              /{cat.slug}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
              {subs.map((sub) => (
                <div
                  key={sub.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "6px 10px",
                    background: "var(--admin-surface-hover)",
                    borderRadius: 6,
                    fontSize: 13,
                  }}
                >
                  <span>
                    {sub.name}{" "}
                    {sub.is_enabled !== 1 && <AdminBadge>Disabled</AdminBadge>}
                  </span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <AdminButton size="sm" variant="ghost" onClick={() => toggleSubcategory(sub)}>
                      {sub.is_enabled === 1 ? "Disable" : "Enable"}
                    </AdminButton>
                    <AdminButton size="sm" variant="ghost" onClick={() => deleteSubcategory(sub.id)}>
                      Delete
                    </AdminButton>
                  </div>
                </div>
              ))}
              {subs.length === 0 && (
                <p style={{ fontSize: 12.5, color: "var(--admin-text-faint)" }}>
                  No subcategories yet.
                </p>
              )}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <AdminInput
                placeholder="New subcategory name"
                value={newSubName[cat.id] ?? ""}
                onChange={(e) => setNewSubName((s) => ({ ...s, [cat.id]: e.target.value }))}
              />
              <AdminButton
                variant="secondary"
                onClick={() => addSubcategory(cat.id)}
                disabled={saving}
              >
                Add
              </AdminButton>
            </div>
          </AdminCard>
        );
      })}

      <AdminCard title="Add New Category">
        <div style={{ display: "flex", gap: 8 }}>
          <AdminInput
            placeholder="Category name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
          <AdminButton onClick={addCategory} disabled={saving}>
            Add Category
          </AdminButton>
        </div>
      </AdminCard>
    </div>
  );
}
