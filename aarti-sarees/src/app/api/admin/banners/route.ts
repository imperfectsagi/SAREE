import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { getDb } from "@/lib/db";
import { generateId } from "@/lib/auth/crypto";

export const dynamic = "force-dynamic";

type BannerInput = {
  type: "image" | "video";
  heading?: string;
  subtitle?: string;
  ctaLabel?: string;
  linkUrl?: string;
  overlay?: string;
  desktopMediaId?: string | null;
  mobileMediaId?: string | null;
  posterMediaId?: string | null;
  isEnabled: boolean;
};

export async function GET() {
  return withAuth("banners.write", async () => {
    const db = getDb();
    const { results } = await db
      .prepare(
        `SELECT b.*, dm.url as desktop_url, mm.url as mobile_url, pm.url as poster_url
         FROM banners b
         LEFT JOIN media dm ON dm.id = b.desktop_media_id
         LEFT JOIN media mm ON mm.id = b.mobile_media_id
         LEFT JOIN media pm ON pm.id = b.poster_media_id
         ORDER BY b.sort_order ASC`
      )
      .all();
    return NextResponse.json({ banners: results });
  });
}

export async function POST(req: NextRequest) {
  return withAuth("banners.write", async () => {
    const body = (await req.json()) as BannerInput;
    const db = getDb();
    const id = generateId();

    const { results: maxOrderRows } = await db
      .prepare(`SELECT COALESCE(MAX(sort_order), -1) + 1 as next FROM banners`)
      .all<{ next: number }>();

    await db
      .prepare(
        `INSERT INTO banners (
          id, type, heading, subtitle, cta_label, link_url, overlay,
          desktop_media_id, mobile_media_id, poster_media_id, is_enabled, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        body.type,
        body.heading || null,
        body.subtitle || null,
        body.ctaLabel || null,
        body.linkUrl || null,
        body.overlay || null,
        body.desktopMediaId || null,
        body.mobileMediaId || null,
        body.posterMediaId || null,
        body.isEnabled ? 1 : 0,
        maxOrderRows[0]?.next ?? 0
      )
      .run();

    return NextResponse.json({ id }, { status: 201 });
  });
}
