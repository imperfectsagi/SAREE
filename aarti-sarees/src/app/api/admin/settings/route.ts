import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { getBusinessSettingsDb, updateSiteSettingDb } from "@/lib/repo/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  return withAuth("settings.write", async () => {
    const settings = await getBusinessSettingsDb();
    return NextResponse.json({ settings });
  });
}

const EDITABLE_KEYS = [
  "business_name",
  "business_tagline",
  "business_phone",
  "business_whatsapp",
  "business_address_line1",
  "business_address_line2",
  "business_address_city",
  "business_address_state",
  "business_address_pincode",
  "business_hours",
  "business_email",
  "social_instagram",
  "social_facebook",
] as const;

export async function PUT(req: NextRequest) {
  return withAuth("settings.write", async () => {
    const body = (await req.json()) as Record<string, string>;

    for (const key of EDITABLE_KEYS) {
      if (key in body) {
        await updateSiteSettingDb(key, body[key] ?? "");
      }
    }

    return NextResponse.json({ success: true });
  });
}
