import "server-only";
import { getDb, getDbAsync } from "@/lib/db";
import { defaultTheme, type ThemeConfig } from "@/data/theme";

export async function getActiveThemeDb(): Promise<ThemeConfig> {
  const db = getDb();
  const row = await db
    .prepare(`SELECT tokens FROM theme_settings WHERE id = 1`)
    .first<{ tokens: string }>();
  if (!row) return defaultTheme;
  try {
    return { ...defaultTheme, ...JSON.parse(row.tokens) };
  } catch {
    return defaultTheme;
  }
}

/**
 * Async variant, safe to call from the ROOT LAYOUT specifically, since
 * the root layout wraps every route including statically-generated ones
 * (e.g. /_not-found, /about). getDb() (sync) throws if called from a
 * static-rendering context; getDbAsync() is the documented workaround.
 */
export async function getActiveThemeDbAsync(): Promise<ThemeConfig> {
  const db = await getDbAsync();
  const row = await db
    .prepare(`SELECT tokens FROM theme_settings WHERE id = 1`)
    .first<{ tokens: string }>();
  if (!row) return defaultTheme;
  try {
    return { ...defaultTheme, ...JSON.parse(row.tokens) };
  } catch {
    return defaultTheme;
  }
}

export async function updateThemeDb(tokens: ThemeConfig): Promise<void> {
  const db = getDb();
  await db
    .prepare(
      `INSERT INTO theme_settings (id, tokens, updated_at)
       VALUES (1, ?, strftime('%Y-%m-%dT%H:%M:%fZ','now'))
       ON CONFLICT(id) DO UPDATE SET tokens = excluded.tokens, updated_at = excluded.updated_at`
    )
    .bind(JSON.stringify(tokens))
    .run();
}
