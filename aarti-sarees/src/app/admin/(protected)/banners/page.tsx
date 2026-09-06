import { getDb } from "@/lib/db";
import { BannersManager } from "./BannersManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Banners" };

export default async function AdminBannersPage() {
  const db = getDb();
  const { results: banners } = await db
    .prepare(
      `SELECT b.*, dm.url as desktop_url, mm.url as mobile_url, pm.url as poster_url
       FROM banners b
       LEFT JOIN media dm ON dm.id = b.desktop_media_id
       LEFT JOIN media mm ON mm.id = b.mobile_media_id
       LEFT JOIN media pm ON pm.id = b.poster_media_id
       ORDER BY b.sort_order ASC`
    )
    .all();

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Banners</h1>
      <p style={{ fontSize: 13, color: "var(--admin-text-muted)", marginBottom: 20 }}>
        Manage homepage image and video banners. Videos autoplay muted &amp; looped, with a poster fallback.
      </p>
      <BannersManager initialBanners={banners as never} />
    </div>
  );
}
