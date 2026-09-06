"use client";

import { useEffect, useState } from "react";
import { AdminButton, AdminCard, AdminInput, AdminTextarea, AdminBadge } from "@/components/admin/ui";

type Section = {
  id: string;
  section_key: string;
  heading: string | null;
  description: string | null;
  is_enabled: number;
  sort_order: number;
};

export default function AdminHomepagePage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/homepage")
      .then((r) => r.json() as Promise<{ sections: Section[] }>)
      .then((data) => setSections(data.sections))
      .finally(() => setLoading(false));
  }, []);

  const update = (id: string, patch: Partial<Section>) => {
    setSections((secs) => secs.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    setSaved(false);
  };

  const move = (index: number, direction: -1 | 1) => {
    setSections((secs) => {
      const next = [...secs];
      const target = index + direction;
      if (target < 0 || target >= next.length) return secs;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((s, i) => ({ ...s, sort_order: i }));
    });
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/homepage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sections: sections.map((s, i) => ({
            id: s.id,
            heading: s.heading ?? "",
            description: s.description ?? "",
            isEnabled: s.is_enabled === 1,
            sortOrder: i,
          })),
        }),
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ color: "var(--admin-text-muted)" }}>Loading…</p>;

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Homepage</h1>
      <p style={{ fontSize: 13, color: "var(--admin-text-muted)", marginBottom: 20 }}>
        Enable/disable and reorder homepage sections, and edit their headings.
        Product/category selection for each section is managed from Products and Categories.
      </p>

      {saved && (
        <div
          style={{
            background: "var(--admin-success-light)",
            color: "var(--admin-success)",
            padding: "8px 12px",
            borderRadius: 6,
            fontSize: 13,
            marginBottom: 14,
          }}
        >
          Saved. Changes are live on the homepage.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {sections.map((section, index) => (
          <AdminCard
            key={section.id}
            actions={
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {section.is_enabled === 1 ? (
                  <AdminBadge tone="success">Visible</AdminBadge>
                ) : (
                  <AdminBadge>Hidden</AdminBadge>
                )}
                <AdminButton size="sm" variant="ghost" onClick={() => move(index, -1)}>
                  ↑
                </AdminButton>
                <AdminButton size="sm" variant="ghost" onClick={() => move(index, 1)}>
                  ↓
                </AdminButton>
                <AdminButton
                  size="sm"
                  variant="secondary"
                  onClick={() => update(section.id, { is_enabled: section.is_enabled === 1 ? 0 : 1 })}
                >
                  {section.is_enabled === 1 ? "Hide" : "Show"}
                </AdminButton>
              </div>
            }
          >
            <div style={{ fontSize: 11.5, color: "var(--admin-text-faint)", marginBottom: 8, textTransform: "uppercase" }}>
              {section.section_key.replace(/_/g, " ")}
            </div>
            <AdminInput
              value={section.heading ?? ""}
              onChange={(e) => update(section.id, { heading: e.target.value })}
              placeholder="Section heading"
              style={{ marginBottom: 8 }}
            />
            <AdminTextarea
              rows={2}
              value={section.description ?? ""}
              onChange={(e) => update(section.id, { description: e.target.value })}
              placeholder="Optional description"
            />
          </AdminCard>
        ))}
      </div>

      <div style={{ height: 16 }} />
      <AdminButton onClick={handleSave} disabled={saving}>
        {saving ? "Saving…" : "Save Homepage Layout"}
      </AdminButton>
    </div>
  );
}
