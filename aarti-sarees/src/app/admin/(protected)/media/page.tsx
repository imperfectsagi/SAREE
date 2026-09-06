import { getDb } from "@/lib/db";
import { MediaLibrary } from "./MediaLibrary";

export const dynamic = "force-dynamic";
export const metadata = { title: "Media Library" };

export default async function AdminMediaPage() {
  const db = getDb();
  const { results: media } = await db
    .prepare(
      `SELECT id, url, kind, mime_type, size_bytes, alt_text, created_at
       FROM media ORDER BY created_at DESC LIMIT 200`
    )
    .all();

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Media Library</h1>
      <p style={{ fontSize: 13, color: "var(--admin-text-muted)", marginBottom: 20 }}>
        All uploaded images and videos. Files are stored in Cloudflare R2.
      </p>
      <MediaLibrary initialMedia={media as never} />
    </div>
  );
}
