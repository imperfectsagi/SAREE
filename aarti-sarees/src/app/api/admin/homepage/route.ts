import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/guard";
import { getDb } from "@/lib/db";
import { generateId } from "@/lib/auth/crypto";

export const dynamic = "force-dynamic";

const DEFAULT_SECTIONS = [
  { key: "hero", heading: "Hero Banner", order: 0 },
  { key: "featured_categories", heading: "Shop by Category", order: 1 },
  { key: "featured_products", heading: "Featured Products", order: 2 },
  { key: "collection_sarees", heading: "Sarees Collection", order: 3 },
  { key: "collection_suits", heading: "Suits Collection", order: 4 },
  { key: "promo_banner", heading: "Promotional Banner", order: 5 },
  { key: "why_choose_us", heading: "Why Choose Us", order: 6 },
  { key: "blog_preview", heading: "From Our Blog", order: 7 },
  { key: "store_info", heading: "Visit Our Store", order: 8 },
];

/** Ensures the homepage_sections table has a row for every known section
 * (idempotent — safe to call on every GET, cheap no-op after first run). */
async function ensureSeeded(db: D1Database) {
  const { results } = await db
    .prepare(`SELECT section_key FROM homepage_sections`)
    .all<{ section_key: string }>();
  const existing = new Set(results.map((r) => r.section_key));

  const missing = DEFAULT_SECTIONS.filter((s) => !existing.has(s.key));
  if (missing.length === 0) return;

  const stmts = missing.map((s) =>
    db
      .prepare(
        `INSERT INTO homepage_sections (id, section_key, heading, is_enabled, sort_order)
         VALUES (?, ?, ?, 1, ?)`
      )
      .bind(generateId(), s.key, s.heading, s.order)
  );
  await db.batch(stmts);
}

export async function GET() {
  return withAuth("homepage.write", async () => {
    const db = getDb();
    await ensureSeeded(db);
    const { results } = await db
      .prepare(`SELECT * FROM homepage_sections ORDER BY sort_order ASC`)
      .all();
    return NextResponse.json({ sections: results });
  });
}

export async function PUT(req: NextRequest) {
  return withAuth("homepage.write", async () => {
    const body = (await req.json()) as {
      sections: { id: string; heading: string; description: string; isEnabled: boolean; sortOrder: number }[];
    };
    const db = getDb();
    const stmts = body.sections.map((s) =>
      db
        .prepare(
          `UPDATE homepage_sections SET heading = ?, description = ?, is_enabled = ?, sort_order = ?,
           updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ?`
        )
        .bind(s.heading, s.description, s.isEnabled ? 1 : 0, s.sortOrder, s.id)
    );
    await db.batch(stmts);
    return NextResponse.json({ success: true });
  });
}
