import { getDb } from "@/lib/db";

export type HomepageBanner = {
  id: string;
  type: "image" | "video";
  heading: string | null;
  subtitle: string | null;
  ctaLabel: string | null;
  linkUrl: string | null;
  overlay: string | null;
  desktopUrl: string | null;
  mobileUrl: string | null;
  posterUrl: string | null;
};

export async function getActiveBannersDb(): Promise<HomepageBanner[]> {
  const db = getDb();

  const { results } = await db
    .prepare(
      `SELECT
        b.id,
        b.type,
        b.heading,
        b.subtitle,
        b.cta_label,
        b.link_url,
        b.overlay,
        dm.url AS desktop_url,
        mm.url AS mobile_url,
        pm.url AS poster_url
      FROM banners b
      LEFT JOIN media dm ON dm.id = b.desktop_media_id
      LEFT JOIN media mm ON mm.id = b.mobile_media_id
      LEFT JOIN media pm ON pm.id = b.poster_media_id
      WHERE b.is_enabled = 1
      ORDER BY b.sort_order ASC`
    )
    .all<{
      id: string;
      type: "image" | "video";
      heading: string | null;
      subtitle: string | null;
      cta_label: string | null;
      link_url: string | null;
      overlay: string | null;
      desktop_url: string | null;
      mobile_url: string | null;
      poster_url: string | null;
    }>();

  return results.map((banner) => ({
    id: banner.id,
    type: banner.type,
    heading: banner.heading,
    subtitle: banner.subtitle,
    ctaLabel: banner.cta_label,
    linkUrl: banner.link_url,
    overlay: banner.overlay,
    desktopUrl: banner.desktop_url,
    mobileUrl: banner.mobile_url,
    posterUrl: banner.poster_url,
  }));
}
