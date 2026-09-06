"use client";

import { useState } from "react";
import type { ThemeConfig } from "@/data/theme";
import { AdminButton, AdminCard } from "@/components/admin/ui";

const TOKEN_LABELS: { key: keyof ThemeConfig; label: string }[] = [
  { key: "primary", label: "Primary" },
  { key: "secondary", label: "Secondary" },
  { key: "accent", label: "Accent" },
  { key: "background", label: "Background" },
  { key: "surface", label: "Surface" },
  { key: "text", label: "Text" },
  { key: "muted", label: "Muted" },
  { key: "border", label: "Border" },
  { key: "button", label: "Button" },
  { key: "buttonText", label: "Button Text" },
  { key: "header", label: "Header" },
  { key: "footer", label: "Footer" },
  { key: "card", label: "Card" },
  { key: "sale", label: "Sale" },
  { key: "badge", label: "Badge" },
  { key: "links", label: "Links" },
  { key: "overlay", label: "Overlay" },
];

export function ThemeEditor({ initialTheme }: { initialTheme: ThemeConfig }) {
  const [theme, setTheme] = useState<ThemeConfig>(initialTheme);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const update = (key: keyof ThemeConfig, value: string) => {
    setTheme((t) => ({ ...t, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(theme),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Failed to save theme");
        return;
      }
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>
      <AdminCard title="Color Tokens">
        {error && (
          <div
            style={{
              background: "var(--admin-danger-light)",
              color: "var(--admin-danger)",
              padding: "8px 12px",
              borderRadius: 6,
              fontSize: 13,
              marginBottom: 14,
            }}
          >
            {error}
          </div>
        )}
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
            Theme saved. Changes are now live on the storefront.
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {TOKEN_LABELS.map(({ key, label }) => (
            <div key={key}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 5 }}>{label}</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {/^#/.test(theme[key]) && (
                  <input
                    type="color"
                    value={theme[key]}
                    onChange={(e) => update(key, e.target.value)}
                    style={{ width: 34, height: 34, border: "1px solid var(--admin-border)", borderRadius: 6, padding: 0 }}
                  />
                )}
                <input
                  type="text"
                  value={theme[key]}
                  onChange={(e) => update(key, e.target.value)}
                  style={{
                    flex: 1,
                    padding: "7px 9px",
                    fontSize: 12.5,
                    fontFamily: "monospace",
                    border: "1px solid var(--admin-border)",
                    borderRadius: 6,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div style={{ height: 20 }} />
        <AdminButton onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save Theme"}
        </AdminButton>
      </AdminCard>

      <div style={{ position: "sticky", top: 20 }}>
        <AdminCard title="Live Preview">
          <div
            style={{
              background: theme.background,
              border: `1px solid ${theme.border}`,
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <div style={{ background: theme.header, padding: "10px 14px", color: theme.text, fontWeight: 700, fontSize: 13 }}>
              Aarti Sarees
            </div>
            <div style={{ padding: 16 }}>
              <div
                style={{
                  background: theme.card,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 10,
                }}
              >
                <div style={{ color: theme.text, fontWeight: 600, fontSize: 13 }}>
                  Banarasi Silk Saree
                </div>
                <div style={{ color: theme.muted, fontSize: 11.5, marginBottom: 6 }}>
                  Wedding Collection
                </div>
                <span
                  style={{
                    display: "inline-block",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#fff",
                    background: theme.badge,
                    padding: "2px 6px",
                    borderRadius: 4,
                    marginBottom: 8,
                  }}
                >
                  BESTSELLER
                </span>
                <div style={{ fontSize: 13 }}>
                  <span style={{ color: theme.sale, fontWeight: 700 }}>₹9,999</span>{" "}
                  <span style={{ color: theme.muted, textDecoration: "line-through", fontSize: 11.5 }}>
                    ₹12,999
                  </span>
                </div>
                <a style={{ color: theme.links, fontSize: 11.5 }}>View details →</a>
              </div>
              <button
                style={{
                  width: "100%",
                  padding: "8px",
                  background: theme.button,
                  color: theme.buttonText,
                  border: "none",
                  borderRadius: 6,
                  fontSize: 12.5,
                  fontWeight: 600,
                }}
              >
                Add to Cart
              </button>
            </div>
            <div style={{ background: theme.footer, padding: "10px 14px", color: "#fff", fontSize: 11 }}>
              © Aarti Sarees
            </div>
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
