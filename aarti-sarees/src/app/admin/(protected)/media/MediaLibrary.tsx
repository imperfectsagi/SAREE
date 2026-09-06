"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminButton } from "@/components/admin/ui";

type MediaItem = {
  id: string;
  url: string;
  kind: "image" | "video";
  mime_type: string;
  size_bytes: number | null;
  alt_text: string | null;
  created_at: string;
};

function formatBytes(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaLibrary({ initialMedia }: { initialMedia: MediaItem[] }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/media/upload", { method: "POST", body: fd });
        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          throw new Error(data.error || "Upload failed");
        }
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this file permanently from storage?")) return;
    const res = await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      alert(data.error || "Failed to delete");
      return;
    }
    router.refresh();
  };

  return (
    <div>
      <div
        style={{
          background: "var(--admin-surface)",
          border: "1px solid var(--admin-border)",
          borderRadius: "var(--admin-radius)",
          padding: 18,
          marginBottom: 20,
        }}
      >
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
        <label style={{ fontSize: 13, fontWeight: 600 }}>
          Upload new files
          <input
            type="file"
            multiple
            accept="image/*,video/mp4,video/webm"
            onChange={(e) => handleUpload(e.target.files)}
            disabled={uploading}
            style={{ display: "block", marginTop: 8, fontSize: 12.5 }}
          />
        </label>
        {uploading && (
          <p style={{ fontSize: 12, color: "var(--admin-text-muted)", marginTop: 8 }}>
            Uploading…
          </p>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 14,
        }}
      >
        {initialMedia.map((item) => (
          <div
            key={item.id}
            style={{
              background: "var(--admin-surface)",
              border: "1px solid var(--admin-border)",
              borderRadius: "var(--admin-radius-sm)",
              overflow: "hidden",
            }}
          >
            <div style={{ aspectRatio: "1", background: "#f1f2f4" }}>
              {item.kind === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.url}
                  alt={item.alt_text ?? ""}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <video
                  src={item.url}
                  muted
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              )}
            </div>
            <div style={{ padding: "8px 10px" }}>
              <div style={{ fontSize: 11, color: "var(--admin-text-muted)" }}>
                {item.kind} · {formatBytes(item.size_bytes)}
              </div>
              <AdminButton
                size="sm"
                variant="danger"
                onClick={() => handleDelete(item.id)}
              >
                Delete
              </AdminButton>
            </div>
          </div>
        ))}
        {initialMedia.length === 0 && (
          <p style={{ color: "var(--admin-text-muted)", fontSize: 13 }}>
            No media uploaded yet.
          </p>
        )}
      </div>
    </div>
  );
}
