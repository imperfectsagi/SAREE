import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { getMediaBucket, getR2PublicBaseUrl } from "@/lib/db";
import { getDb } from "@/lib/db";
import { generateId } from "@/lib/auth/crypto";

export const dynamic = "force-dynamic";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"];
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50MB

function extensionFor(mimeType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "video/mp4": "mp4",
    "video/webm": "webm",
  };
  return map[mimeType] ?? "bin";
}

export async function POST(req: NextRequest) {
  return withAuth("media.write", async (user) => {
    const formData = await req.formData();
    const file = formData.get("file");
    const altText = (formData.get("altText") as string) || null;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        {
          error:
            "Unsupported file type. Allowed: JPEG, PNG, WebP, GIF images or MP4/WebM videos.",
        },
        { status: 400 }
      );
    }

    const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (file.size > maxBytes) {
      return NextResponse.json(
        {
          error: `File too large. Max ${Math.round(maxBytes / (1024 * 1024))}MB for ${
            isVideo ? "videos" : "images"
          }.`,
        },
        { status: 400 }
      );
    }

    const id = generateId();
    const ext = extensionFor(file.type);
    const r2Key = `${isVideo ? "videos" : "images"}/${id}.${ext}`;

    const bucket = getMediaBucket();
    const arrayBuffer = await file.arrayBuffer();
    await bucket.put(r2Key, arrayBuffer, {
      httpMetadata: { contentType: file.type },
    });

    const publicBase = getR2PublicBaseUrl();
    const url = publicBase
      ? `${publicBase}/${r2Key}`
      : `/api/media/${encodeURIComponent(r2Key)}`; // fallback proxy route if no public URL configured

    const db = getDb();
    await db
      .prepare(
        `INSERT INTO media (id, r2_key, url, kind, mime_type, size_bytes, alt_text, uploaded_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        r2Key,
        url,
        isVideo ? "video" : "image",
        file.type,
        file.size,
        altText,
        user.id
      )
      .run();

    return NextResponse.json({
      id,
      url,
      kind: isVideo ? "video" : "image",
      mimeType: file.type,
    });
  });
}
