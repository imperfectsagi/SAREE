import { NextRequest, NextResponse } from "next/server";
import { getMediaBucket } from "@/lib/db";

export const dynamic = "force-dynamic";

// Fallback route: serves R2 objects through the Worker when no public R2
// URL/custom domain has been configured in Admin → Settings yet. Once
// R2_PUBLIC_BASE_URL is set, new uploads use that directly (faster, no
// Worker CPU spent streaming bytes) — this route stays as a safety net
// for any media rows still pointing at it.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const { key } = await params;
  const r2Key = key.join("/");

  const bucket = getMediaBucket();
  const object = await bucket.get(r2Key);

  if (!object) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");

  return new NextResponse(object.body as unknown as BodyInit, { headers });
}
