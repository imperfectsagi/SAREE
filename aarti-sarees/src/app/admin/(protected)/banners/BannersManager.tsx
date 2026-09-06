"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminButton,
  AdminInput,
  AdminCard,
  AdminSelect,
  AdminLabel,
  AdminBadge,
} from "@/components/admin/ui";

type Banner = {
  id: string;
  type: "image" | "video";
  heading: string | null;
  subtitle: string | null;
  cta_label: string | null;
  link_url: string | null;
  overlay: string | null;
  desktop_media_id: string | null;
  mobile_media_id: string | null;
  poster_media_id: string | null;
  desktop_url: string | null;
  mobile_url: string | null;
  poster_url: string | null;
  is_enabled: number;
};

type DraftBanner = {
  type: "image" | "video";
  heading: string;
  subtitle: string;
  ctaLabel: string;
  linkUrl: string;
  overlay: string;
  desktopMediaId: string;
  desktopUrl: string;
  mobileMediaId: string;
  mobileUrl: string;
  posterMediaId: string;
  posterUrl: string;
  isEnabled: boolean;
};

const emptyDraft: DraftBanner = {
  type: "image",
  heading: "",
  subtitle: "",
  ctaLabel: "",
  linkUrl: "",
  overlay: "rgba(0,0,0,0.35)",
  desktopMediaId: "",
  desktopUrl: "",
  mobileMediaId: "",
  mobileUrl: "",
  posterMediaId: "",
  posterUrl: "",
  isEnabled: true,
};

async function uploadFile(file: File): Promise<{ id: string; url: string }> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/admin/media/upload", { method: "POST", body: fd });
  const data = (await res.json()) as { id?: string; url?: string; error?: string };
  if (!res.ok || !data.id || !data.url) throw new Error(data.error || "Upload failed");
  return { id: data.id, url: data.url };
}

export function BannersManager({ initialBanners }: { initialBanners: Banner[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<DraftBanner>(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (field: "desktop" | "mobile" | "poster", file: File | null) => {
    if (!file) return;
    try {
      const { id, url } = await uploadFile(file);
      setDraft((d) => ({ ...d, [`${field}MediaId`]: id, [`${field}Url`]: url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const createBanner = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: draft.type,
          heading: draft.heading,
          subtitle: draft.subtitle,
          ctaLabel: draft.ctaLabel,
          linkUrl: draft.linkUrl,
          overlay: draft.overlay,
          desktopMediaId: draft.desktopMediaId || null,
          mobileMediaId: draft.mobileMediaId || null,
          posterMediaId: draft.posterMediaId || null,
          isEnabled: draft.isEnabled,
        }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error || "Failed to create banner");
        return;
      }
      setDraft(emptyDraft);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const toggleBanner = async (banner: Banner) => {
    await fetch(`/api/admin/banners/${banner.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: banner.type,
        heading: banner.heading,
        subtitle: banner.subtitle,
        ctaLabel: banner.cta_label,
        linkUrl: banner.link_url,
        overlay: banner.overlay,
        desktopMediaId: banner.desktop_media_id,
        mobileMediaId: banner.mobile_media_id,
        posterMediaId: banner.poster_media_id,
        isEnabled: banner.is_enabled !== 1,
      }),
    });
    router.refresh();
  };

  const deleteBanner = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {initialBanners.map((banner) => (
        <AdminCard
          key={banner.id}
          title={banner.heading || `${banner.type} banner`}
          actions={
            <div style={{ display: "flex", gap: 8 }}>
              {banner.is_enabled === 1 ? (
                <AdminBadge tone="success">Enabled</AdminBadge>
              ) : (
                <AdminBadge>Disabled</AdminBadge>
              )}
              <AdminButton size="sm" variant="secondary" onClick={() => toggleBanner(banner)}>
                {banner.is_enabled === 1 ? "Disable" : "Enable"}
              </AdminButton>
              <AdminButton size="sm" variant="danger" onClick={() => deleteBanner(banner.id)}>
                Delete
              </AdminButton>
            </div>
          }
        >
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            {banner.desktop_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={banner.poster_url || banner.desktop_url}
                alt=""
                style={{ width: 120, height: 68, objectFit: "cover", borderRadius: 6 }}
              />
            )}
            <div style={{ fontSize: 13 }}>
              <div style={{ fontWeight: 600 }}>Type: {banner.type}</div>
              <div style={{ color: "var(--admin-text-muted)" }}>{banner.subtitle}</div>
              {banner.link_url && (
                <div style={{ color: "var(--admin-text-faint)", fontSize: 12 }}>→ {banner.link_url}</div>
              )}
            </div>
          </div>
        </AdminCard>
      ))}

      <AdminCard title="Add New Banner">
        {error && (
          <div
            style={{
              background: "var(--admin-danger-light)",
              color: "var(--admin-danger)",
              padding: "8px 12px",
              borderRadius: 6,
              fontSize: 13,
              marginBottom: 12,
            }}
          >
            {error}
          </div>
        )}

        <AdminLabel>Banner Type</AdminLabel>
        <AdminSelect
          value={draft.type}
          onChange={(e) => setDraft({ ...draft, type: e.target.value as "image" | "video" })}
        >
          <option value="image">Image Banner</option>
          <option value="video">Video Banner</option>
        </AdminSelect>

        <div style={{ height: 14 }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <AdminLabel>Heading</AdminLabel>
            <AdminInput
              value={draft.heading}
              onChange={(e) => setDraft({ ...draft, heading: e.target.value })}
            />
          </div>
          <div>
            <AdminLabel>Subtitle</AdminLabel>
            <AdminInput
              value={draft.subtitle}
              onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
            />
          </div>
          <div>
            <AdminLabel>CTA Label</AdminLabel>
            <AdminInput
              value={draft.ctaLabel}
              onChange={(e) => setDraft({ ...draft, ctaLabel: e.target.value })}
              placeholder="Shop Now"
            />
          </div>
          <div>
            <AdminLabel>Link URL</AdminLabel>
            <AdminInput
              value={draft.linkUrl}
              onChange={(e) => setDraft({ ...draft, linkUrl: e.target.value })}
              placeholder="/sarees"
            />
          </div>
          {draft.type === "image" && (
            <div>
              <AdminLabel>Overlay (CSS color, optional)</AdminLabel>
              <AdminInput
                value={draft.overlay}
                onChange={(e) => setDraft({ ...draft, overlay: e.target.value })}
                placeholder="rgba(0,0,0,0.35)"
              />
            </div>
          )}
        </div>

        <div style={{ height: 14 }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <AdminLabel>Desktop {draft.type === "video" ? "Video" : "Image"}</AdminLabel>
            <input
              type="file"
              accept={draft.type === "video" ? "video/mp4,video/webm" : "image/*"}
              onChange={(e) => handleUpload("desktop", e.target.files?.[0] ?? null)}
            />
            {draft.desktopUrl && (
              <p style={{ fontSize: 11.5, color: "var(--admin-success)", marginTop: 4 }}>Uploaded ✓</p>
            )}
          </div>
          <div>
            <AdminLabel>Mobile {draft.type === "video" ? "Video" : "Image"} (optional)</AdminLabel>
            <input
              type="file"
              accept={draft.type === "video" ? "video/mp4,video/webm" : "image/*"}
              onChange={(e) => handleUpload("mobile", e.target.files?.[0] ?? null)}
            />
            {draft.mobileUrl && (
              <p style={{ fontSize: 11.5, color: "var(--admin-success)", marginTop: 4 }}>Uploaded ✓</p>
            )}
          </div>
          {draft.type === "video" && (
            <div>
              <AdminLabel>Poster Image (shown before video loads)</AdminLabel>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleUpload("poster", e.target.files?.[0] ?? null)}
              />
              {draft.posterUrl && (
                <p style={{ fontSize: 11.5, color: "var(--admin-success)", marginTop: 4 }}>Uploaded ✓</p>
              )}
            </div>
          )}
        </div>

        <div style={{ height: 16 }} />
        <AdminButton onClick={createBanner} disabled={saving}>
          {saving ? "Saving…" : "Add Banner"}
        </AdminButton>
      </AdminCard>
    </div>
  );
}
