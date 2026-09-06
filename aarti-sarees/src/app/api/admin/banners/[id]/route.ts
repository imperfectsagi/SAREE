import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { getDb } from "@/lib/db";

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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth("banners.write", async () => {
    const { id } = await params;
    const body = (await req.json()) as BannerInput;
    const db = getDb();
    await db
      .prepare(
        `UPDATE banners SET type = ?, heading = ?, subtitle = ?, cta_label = ?,
         link_url = ?, overlay = ?, desktop_media_id = ?, mobile_media_id = ?,
         poster_media_id = ?, is_enabled = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
         WHERE id = ?`
      )
      .bind(
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
        id
      )
      .run();
    return NextResponse.json({ success: true });
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth("banners.write", async () => {
    const { id } = await params;
    const db = getDb();
    await db.prepare(`DELETE FROM banners WHERE id = ?`).bind(id).run();
    return NextResponse.json({ success: true });
  });
}
