import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { getActiveThemeDb, updateThemeDb } from "@/lib/repo/theme";
import type { ThemeConfig } from "@/data/theme";

export const dynamic = "force-dynamic";

export async function GET() {
  return withAuth("theme.write", async () => {
    const theme = await getActiveThemeDb();
    return NextResponse.json({ theme });
  });
}

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export async function PUT(req: NextRequest) {
  return withAuth("theme.write", async () => {
    const body = (await req.json()) as ThemeConfig;

    // Validate every value is either a valid hex color or (for overlay) a
    // valid rgba()/hsla() string — admin can type any HEX, not restricted
    // to a predefined palette, but we do reject garbage input.
    for (const [key, value] of Object.entries(body)) {
      const isValidHex = HEX_RE.test(value);
      const isValidFunc = /^(rgba?|hsla?)\(/.test(value);
      if (!isValidHex && !isValidFunc) {
        return NextResponse.json(
          { error: `Invalid color value for "${key}": ${value}` },
          { status: 400 }
        );
      }
    }

    await updateThemeDb(body);
    return NextResponse.json({ success: true });
  });
}
