import "server-only";
import { getDb, getDbAsync } from "@/lib/db";
import { business as staticBusinessFallback } from "@/data/business";

export type BusinessSettings = typeof staticBusinessFallback;

function mapRows(rows: { key: string; value: string | null }[]): BusinessSettings {
  const map = new Map(rows.map((r) => [r.key, r.value ?? ""]));
  const get = (key: string, fallback: string) => map.get(key) || fallback;

  return {
    name: get("business_name", staticBusinessFallback.name),
    tagline: get("business_tagline", staticBusinessFallback.tagline),
    phone: get("business_phone", staticBusinessFallback.phone),
    phoneRaw: get("business_phone", staticBusinessFallback.phoneRaw).replace(/\D/g, ""),
    whatsapp: get("business_whatsapp", staticBusinessFallback.whatsapp),
    email: map.get("business_email") || null,
    address: {
      line1: get("business_address_line1", staticBusinessFallback.address.line1),
      line2: get("business_address_line2", staticBusinessFallback.address.line2),
      city: get("business_address_city", staticBusinessFallback.address.city),
      state: get("business_address_state", staticBusinessFallback.address.state),
      pincode: get("business_address_pincode", staticBusinessFallback.address.pincode),
      full:
        [
          get("business_address_line1", staticBusinessFallback.address.line1),
          get("business_address_line2", staticBusinessFallback.address.line2),
          `${get("business_address_city", staticBusinessFallback.address.city)}, ${get(
            "business_address_state",
            staticBusinessFallback.address.state
          )} – ${get("business_address_pincode", staticBusinessFallback.address.pincode)}`,
        ].join(", ") || staticBusinessFallback.address.full,
    },
    hours: get("business_hours", staticBusinessFallback.hours),
    social: {
      instagram: map.get("social_instagram") || null,
      facebook: map.get("social_facebook") || null,
    },
  };
}

/**
 * Loads business info (name, phone, WhatsApp, address, hours, email,
 * social links) from site_settings so it's editable from Admin → Settings
 * without a code change. Falls back to the static src/data/business.ts
 * values only if a key is missing from the DB (e.g. before first seed).
 */
export async function getBusinessSettingsDb(): Promise<BusinessSettings> {
  const db = getDb();
  const { results } = await db
    .prepare(`SELECT key, value FROM site_settings`)
    .all<{ key: string; value: string | null }>();
  return mapRows(results);
}

/**
 * Async variant for the ROOT LAYOUT specifically, since it wraps every
 * route including statically-generated ones. getDb() (sync) throws if
 * called from a static-rendering context — see getActiveThemeDbAsync
 * for the same pattern.
 */
export async function getBusinessSettingsDbAsync(): Promise<BusinessSettings> {
  const db = await getDbAsync();
  const { results } = await db
    .prepare(`SELECT key, value FROM site_settings`)
    .all<{ key: string; value: string | null }>();
  return mapRows(results);
}
export async function updateSiteSettingDb(
  key: string,
  value: string
): Promise<void> {
  const db = getDb();
  await db
    .prepare(
      `INSERT INTO site_settings (key, value, updated_at)
       VALUES (?, ?, strftime('%Y-%m-%dT%H:%M:%fZ','now'))
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
    )
    .bind(key, value)
    .run();
}
